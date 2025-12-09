/**
 * @component <CodePass />
 * @description Muestra la vista principal si hay conexión a internet; si no, muestra un modal de error.
 * @description Usa <CodePassContext> para validar el estado y el hook personalizado useTestRed() para comprobar la red.
 * @returns {JSX.Element} Estructura visual del dashboard CodePass o mensaje de error si no hay conexión.
*/

import { useContext, useEffect, useState, useCallback } from 'react';
import { CodePassContext } from '@contexts/CodepassContext';
import { Header } from '@components/Header'
import { InputCodepass } from '@components/InputCodepass'
import { PasswordBox } from '@components/PasswordBox'
import { Footer } from '@components/Footer'
import { ModalGeneric } from '@components/ModalGeneric';
import { ModalBlock } from '@components/ModalBlock';
import { ModalPort } from '@components/ModalPort';
import { ModalRequired } from '@components/ModalRequired';
import { IconRobotX } from '@icons/IconRobotX';
import { MESSAGE_ES } from '@utils/Message';
import { useTestRed } from '@hooks/useTestRed';
import { useLogin } from "@hooks/useLogin";
import { TRANSFORM_DATA_TO_PASSWORDS, TRANSFORM_ENCODED_TO_DATA } from '@utils/transformDataToPasswords';
import { encryptWithPassphrase, go_to_encrypt, deriveMasterKey } from '@utils/EncodePayload';
import toast from "react-hot-toast";

const CodePass = () => {
    // [STATES]
    const { dataCodePass, updateAllPasswords, setPassBlock, setBlockPasswords, setManualUnblockPass, setOnDriveFile } = useContext(CodePassContext);
    const [connect, setConnect] = useTestRed();
    const [skeleton, setSkeleton] = useState(true);
    const [showContent, setShowContent] = useState(false);
    const [inputStatus, setInputStatus] = useState(false);
    const [, setLogin] = useLogin();
    const shouldTryConnection = ( // Se evalúa si se debe intentar reconectar
        dataCodePass.page === dataCodePass.pages.codepass &&
        !dataCodePass.net &&
        !dataCodePass.modalError
    );
    // [EFFECTS]
    useEffect(() => {
        // effectos de conexión y modal de error
        if (shouldTryConnection && !connect) {
            console.log('Intentando...');
            setConnect(true);
        }
        if (!connect) {
            console.log('Esperando red...');
        }
        if (dataCodePass.net) {
            setSkeleton(false);
            setTimeout(() => {
                setShowContent(true);
            }, 300);
            console.log('Red Ok!');
        }
        if (dataCodePass.modalError) {
            setSkeleton(false);
            console.warn('Error de Conexión');
        }
    }, [shouldTryConnection, connect, dataCodePass.net, dataCodePass.modalError, setConnect]);
    useEffect(() => {
        // Oculta el input si el bloqueo de passwords está activo
        if (dataCodePass.blockpasswords) {
            setInputStatus(false);
        }
    }, [dataCodePass.blockpasswords]);

    // [EFFECT] - Procesar archivo de Drive cuando se cierra el modal
    const [wasModalOpen, setWasModalOpen] = useState(false);
    
    useEffect(() => {
        if (dataCodePass.modalRequired && dataCodePass.onDriveFile) {
            console.log('Modal abierto para Drive file');
            setWasModalOpen(true);
        }
    }, [dataCodePass.modalRequired, dataCodePass.onDriveFile]);

    useEffect(() => {
        console.log('useEffect Drive - modalRequired:', dataCodePass.modalRequired, 'onDriveFile:', dataCodePass.onDriveFile, 'wasModalOpen:', wasModalOpen);
        
        if (wasModalOpen && !dataCodePass.modalRequired && dataCodePass.onDriveFile) {
            console.log('Modal cerrado, iniciando procesamiento de archivo de Drive...');
            setWasModalOpen(false);
            
            const processDriveFile = async () => {
                try {
                    const { temporaldrivepass, temporaldrivecontent } = await chrome.storage.local.get(['temporaldrivepass', 'temporaldrivecontent']);
                    const blockPhrase = temporaldrivepass;
                    const driveContent = temporaldrivecontent;
                    
                    console.log('Procesando archivo de Drive con blockPhrase');
                    
                    if (!driveContent) {
                        console.error('No hay contenido de Drive para procesar');
                        setOnDriveFile(false);
                        return;
                    }
                    
                    if (!blockPhrase) {
                        console.error('Frase de bloqueo no proporcionada');
                        toast.error('Frase de bloqueo no proporcionada', { position: 'bottom-center', duration: 3000 });
                        setOnDriveFile(false);
                        return;
                    }

                    console.log('Derivando masterKey para descifrar Drive...');
                    // Derivar masterKey (SIN timeToken) - igual que cuando se cifró para Drive
                    const masterKey = await deriveMasterKey(blockPhrase);
                    
                    console.log('Descifrando contenido de Drive con masterKey...');
                    const DECRYPTED_STRING = await TRANSFORM_ENCODED_TO_DATA({ 
                        encodedData: driveContent, 
                        passphrase: masterKey 
                    });

                    if (DECRYPTED_STRING?.error) {
                        console.log('Error al descifrar:', DECRYPTED_STRING.error);
                        toast.error('Frase de bloqueo incorrecta', { position: 'bottom-center', duration: 3000 });
                        
                        // Limpiar datos temporales
                        chrome.storage.local.remove('temporaldrivepass');
                        chrome.storage.local.remove('temporaldrivecontent');
                        setOnDriveFile(false);
                        
                        // Desloguear usuario para evitar sobrescribir Drive
                        setTimeout(() => {
                            setLogin(false);
                        }, 500);
                        return;
                    }

                    console.log('Descifrado exitoso, transformando passwords...');
                    const PASSWORDS_ARRAY = TRANSFORM_DATA_TO_PASSWORDS(DECRYPTED_STRING);
                    console.log('Passwords transformadas:', PASSWORDS_ARRAY.length);

                    console.log('Configurando blockpass...');
                    const encryptedBlockPass = await encryptWithPassphrase(blockPhrase, blockPhrase);
                    setPassBlock(encryptedBlockPass);
                    chrome.storage.local.set({ 'blockdatapass': encryptedBlockPass });

                    setBlockPasswords(true);
                    setManualUnblockPass(false);
                    chrome.storage.local.set({ 'manualunblockpass': false });

                    console.log('Guardando masterKey para sincronización con Drive...');
                    // Guardar masterKey (SIN timeToken) para usar en sync durante la sesión
                    chrome.storage.local.set({ 'masterkey': masterKey });

                    console.log('Derivando temporalsesionpass...');
                    const TIME_TOKEN = await chrome.storage.local.get('timeToken');
                    const temporalSessionPass = await deriveMasterKey(blockPhrase, TIME_TOKEN.timeToken.toString());
                    chrome.storage.local.set({ 'temporalsesionpass': temporalSessionPass });

                    console.log('Cifrando passwords localmente...');
                    const encryptedPasswords = await go_to_encrypt({ 
                        passwords: PASSWORDS_ARRAY, 
                        masterKey: temporalSessionPass 
                    });
                    console.log('Passwords cifradas:', encryptedPasswords.length);

                    console.log('Actualizando contexto...');
                    updateAllPasswords(encryptedPasswords);

                    console.log('Limpiando datos temporales...');
                    chrome.storage.local.remove('temporaldrivepass');
                    chrome.storage.local.remove('temporaldrivecontent');
                    setOnDriveFile(false);

                    console.log('Proceso completado exitosamente');
                    toast.success(MESSAGE_ES.buttons.connect, { position: 'bottom-center', duration: 3000 });
                } catch (error) {
                    console.error('Error procesando archivo de Drive:', error);
                    toast.error(MESSAGE_ES.errorunexpected, { position: 'bottom-center', duration: 3000 });
                    chrome.storage.local.remove('temporaldrivepass');
                    chrome.storage.local.remove('temporaldrivecontent');
                    setOnDriveFile(false);
                }
            };
            processDriveFile();
        }
    }, [dataCodePass.modalRequired, dataCodePass.onDriveFile, wasModalOpen, setPassBlock, setBlockPasswords, setManualUnblockPass, updateAllPasswords, setOnDriveFile, setLogin]);
    // [FUNCTIONS]
    const ON_ACTION_INPUT = useCallback((statusFocus) => {
        setInputStatus(statusFocus);
    }, []);
    const CLASS_INPUT_BOX = inputStatus ? 'h-28' : 'h-16 ';
    const CLASS_PASS_BOX = inputStatus ? 'h-[280px] max-h-[280px]' : (dataCodePass.blockpasswords) ? 'h-[380px] max-h-[380px]' : 'h-[325px] max-h-[325px]';
    // [STYLES]
    const contentClasses = `flex flex-col justify-start items-start w-full h-full transition-opacity duration-500 ease-in-out ${showContent ? 'opacity-100' : 'opacity-0'}`;
    // [RENDER]    
    return (
        <>
            {/* MAINCONTENT CODEPASS */}
            <div className="flex flex-col justify-evenly items-center h-full w-full bg-darkblue">
                {
                    (!dataCodePass.net && skeleton) ? (
                        <span className="white-1 font-barlownormal text-lg">
                            {MESSAGE_ES.loading}
                        </span>
                    ) : (
                        <div className={contentClasses}>
                            <Header />
                            {(!dataCodePass.blockpasswords) &&
                                <div className={`flex justify-start items-start w-full transition-all duration-200 ${CLASS_INPUT_BOX} pl-4 pr-4`}>
                                    <InputCodepass onFocus={ON_ACTION_INPUT} />
                                </div>
                            }
                            <div className='flex-center w-full h-10 pl-4 pr-4 mb-1'>
                                <span className='text-center w-full text-white font-orbitron-normal text-2xl pl-4 pr-4 select-none'>
                                    {MESSAGE_ES.mid_text}
                                </span>
                            </div>
                            {/* PASSWORDS COMPONENT */}
                            <div className={`flex justify-start items-start w-full transition-all duration-200 ${CLASS_PASS_BOX} p-4 pr-3 pb-10 pt-0`}>
                                <PasswordBox />
                            </div>
                        </div>

                    )
                }
            </div>
            {/* FOOTER */}
            <Footer />
            {/* MODAL */}
            {
                (!dataCodePass.net && !skeleton) &&
                <ModalGeneric action={() => { setLogin(false); }} show={dataCodePass.modalError} mode="middle" type="info" text="Reintentar">
                    <header className="flex-center flex-col h-3/5 w-full">
                        <IconRobotX ww="150" />
                        <h3 className="font-orbitron-title text-3xl">Error</h3>
                    </header>
                    <article className="h-2/5 w-full pt-4 text-left">
                        <span className="font-barlownormal text-xl">
                            {MESSAGE_ES.error.net}
                        </span>
                    </article>
                </ModalGeneric>
            }
            {/* MODAL LOCK */}
            <ModalBlock />
            {/* MODAL PORT */}
            <ModalPort />
            {/* MODAL REQUIRED */}
            <ModalRequired />
        </>
    );
};

export { CodePass };
