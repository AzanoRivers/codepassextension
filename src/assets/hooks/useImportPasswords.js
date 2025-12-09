import { useState, useEffect, useContext } from "react";
import { TRANSFORM_DATA_TO_PASSWORDS, TRANSFORM_ENCODED_TO_DATA } from '@utils/transformDataToPasswords';
import { CodePassContext } from '@contexts/CodepassContext';
import { useModalRequired } from '@hooks/useModalRequired';
import { encryptWithPassphrase, go_to_encrypt, deriveMasterKey } from '@utils/EncodePayload';
import { useSyncDrive } from '@hooks/useSyncDrive';

const READ_FILE_AS_TEXT = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        reader.onerror = (e) => {
            reject(e);
        };
        reader.readAsText(file);
    });
};
const useImportPasswords = () => {
    // [STATES]
    const [dataPasswordFile, setDataPasswordFile] = useState('');
    const [onLoadImportFile, setOnLoadImportFile] = useState(false);
    const [errorStatus, setErrorStatus] = useState(false);
    const [isEncrypting, setIsEncrypting] = useState(false); // Bandera para evitar bucle
    const { toggleModalRequired } = useModalRequired();
    // [CONTEXTS]
    const context = useContext(CodePassContext);
    const { dataCodePass, updatePasswords, setOnImportFile, setPassBlock, updateAllPasswords, setBlockPasswords, setManualUnblockPass } = context;
    const { syncPasswordsToDrive } = useSyncDrive(context);
    // [FUNCTIONS]
    const fileToString = async (file) => {
        if (!file || file.type !== 'text/plain') {
            // console.log('Invalid file type');
            return ('Invalid file type');
        }
        if (onLoadImportFile) {
            // console.log('File is already being imported');
            return ('File is already being imported');
        }
        setOnLoadImportFile(true);
        const fileContent = await READ_FILE_AS_TEXT(file);
        setDataPasswordFile(fileContent);
        if (fileContent.includes('<<<cpbh5:') && fileContent.includes('>>>')) {
            toggleModalRequired();
        } else {
            // Archivo sin cifrar
            const NEW_PASSWORDS_DATA = TRANSFORM_DATA_TO_PASSWORDS(fileContent);
            
            // Verificar si hay blockpass activo
            const { temporalsesionpass, blockdatapass } = await chrome.storage.local.get(['temporalsesionpass', 'blockdatapass']);
            
            if (temporalsesionpass && blockdatapass) {
                // Hay blockpass activo - cifrar passwords con temporalsesionpass
                // console.log('Importando con blockpass activo - cifrando passwords');
                const encryptedPasswords = await go_to_encrypt({ 
                    passwords: NEW_PASSWORDS_DATA, 
                    masterKey: temporalsesionpass 
                });
                updatePasswords(encryptedPasswords);
                
                // Sincronizar con Drive
                setTimeout(() => {
                    syncPasswordsToDrive();
                }, 500);
            } else {
                // No hay blockpass - importar sin cifrar
                // console.log('Importando sin blockpass - passwords sin cifrar');
                updatePasswords(NEW_PASSWORDS_DATA);
                
                // Sincronizar con Drive
                setTimeout(() => {
                    syncPasswordsToDrive();
                }, 500);
            }
            
            setOnLoadImportFile(false);
        }
    };

    // [EFFECTS]
    useEffect(() => {
        // Efecto para detectar la validación correcta en el modal requerido y proceder con la importación
        if (!dataCodePass.modalRequired && onLoadImportFile && dataCodePass.onImportFile && !isEncrypting) {
            const asyncImport = async () => {
                try {
                    setIsEncrypting(true); // Activar bandera para evitar re-ejecución
                    // console.log(dataPasswordFile);
                    const TEMPORAL_IMPORT_PASSWORD = await chrome.storage.local.get('temporalimportpass');
                    const NEW_PASSWORDS_DATA = await TRANSFORM_ENCODED_TO_DATA({ encodedData: dataPasswordFile, passphrase: (TEMPORAL_IMPORT_PASSWORD?.temporalimportpass || '') });
                    // console.log('RESPONSE NEW PASSWORDS DATA: ', NEW_PASSWORDS_DATA);
                    if (NEW_PASSWORDS_DATA?.error) {
                        setErrorStatus(true);
                        // Limpiar temporalimportpass en caso de error
                        chrome.storage.local.remove('temporalimportpass');
                        setOnLoadImportFile(false);
                        setOnImportFile(false);
                        setIsEncrypting(false);
                        return;
                    } else {
                    const FINAL_PASSWORDS_DATA = TRANSFORM_DATA_TO_PASSWORDS(NEW_PASSWORDS_DATA);
                    
                    // Iniciar proceso de encriptación con la frase de bloqueo importada
                    const blockPhrase = TEMPORAL_IMPORT_PASSWORD?.temporalimportpass;
                    if (blockPhrase) {
                        // 1. Cifrar blockpass con sí misma y guardar en contexto + local
                        const encryptedBlockPass = await encryptWithPassphrase(blockPhrase, blockPhrase);
                        setPassBlock(encryptedBlockPass);
                        chrome.storage.local.set({ 'blockdatapass': encryptedBlockPass });
                        
                        // Establecer el estado de bloqueo activado y manualunblockpass en false
                        setBlockPasswords(true);
                        setManualUnblockPass(false);
                        chrome.storage.local.set({ 'manualunblockpass': false });

                        // 2. Derivar masterKey (SIN timeToken - determinista para Drive)
                        const masterKey = await deriveMasterKey(blockPhrase);
                        // Guardar masterKey para sincronización con Drive durante la sesión
                        chrome.storage.local.set({ 'masterkey': masterKey });
                        
                        // 3. Derivar temporalsesionpass (CON timeToken - única por sesión)
                        const TIME_TOKEN = await chrome.storage.local.get('timeToken');
                        const temporalSessionPass = await deriveMasterKey(blockPhrase, TIME_TOKEN.timeToken.toString());
                        chrome.storage.local.set({ 'temporalsesionpass': temporalSessionPass });

                        // 4. Combinar passwords existentes + nuevas importadas
                        const allPasswords = [...dataCodePass.datapasswords, ...FINAL_PASSWORDS_DATA];
                        
                        // 5. Cifrar TODAS las passwords (existentes + nuevas) con temporalSessionPass
                        const encryptedPasswords = await go_to_encrypt({ 
                            passwords: allPasswords, 
                            masterKey: temporalSessionPass 
                        });
                        
                        // 6. Actualizar passwords cifradas en contexto y local
                        updateAllPasswords(encryptedPasswords);

                        // 7. Limpiar temporalimportpass después de todo el proceso
                        chrome.storage.local.remove('temporalimportpass');
                        
                        // console.log('Proceso de encriptación completado exitosamente');
                        
                        // 8. Sincronizar con Drive después de importar
                        setTimeout(() => {
                            syncPasswordsToDrive();
                        }, 1000);
                    }
                    }
                    setOnLoadImportFile(false);
                    setOnImportFile(false);
                    setIsEncrypting(false); // Resetear bandera al finalizar
                } catch (error) {
                    console.error('Error en proceso de importación:', error);
                    // Limpiar datos temporales en caso de error
                    chrome.storage.local.remove('temporalimportpass');
                    setErrorStatus(true);
                    setOnLoadImportFile(false);
                    setOnImportFile(false);
                    setIsEncrypting(false);
                }
            };
            asyncImport();
        }
    }, [dataCodePass.modalRequired, dataCodePass.datapasswords, onLoadImportFile, dataCodePass.onImportFile, setOnImportFile, dataPasswordFile, updatePasswords, setPassBlock, updateAllPasswords, setBlockPasswords, setManualUnblockPass, syncPasswordsToDrive, isEncrypting]);

    // [HOOKS & STATES]
    return {
        fileToString,
        dataPasswordFile,
        onLoadImportFile,
        errorStatus,
        setErrorStatus
    };
};

export { useImportPasswords };