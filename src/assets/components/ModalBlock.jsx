import { useState, useEffect, useRef, useContext } from 'react';
import { InputGeneric } from '@components/InputGeneric';
import { ButtonGeneric } from '@components/ButtonGeneric'
import { IconRobotHappy } from '@icons/IconRobotHappy';
import { IconRobotWh } from '@icons/IconRobotWh';
import { ModalGeneric } from '@components/ModalGeneric';
import { useModalLock } from '@hooks/useModalLock';
import { useModalBlockpass } from '@hooks/useModalBlockpass';
import { useSetPassblock } from '@hooks/useSetPassblock';
import { decryptWithPassphrase, deriveMasterKey } from "@utils/EncodePayload.js";
import { MESSAGE_ES } from '@utils/Message';
import { CodePassContext } from '@contexts/CodepassContext';

const GO_TO_ENCRYPT_REMOVE = async (valuepass, shouldCreateKey) => {
    try {
        if (shouldCreateKey) {
            // Desbloquear: Crear/actualizar temporalsesionpass y masterKey
            const TIME_TOKEN = await chrome.storage.local.get('timeToken');
            const encrypted = await deriveMasterKey(valuepass, TIME_TOKEN.timeToken.toString());
            
            // Derivar masterKey (sin timeToken) para Drive sync
            const masterKey = await deriveMasterKey(valuepass);
            
            // Guardar con promesas para asegurar que se completen
            await new Promise((resolve) => {
                chrome.storage.local.set({ 
                    'temporalsesionpass': encrypted,
                    'masterkey': masterKey 
                }, resolve);
            });
        } else {
            // Bloquear: Eliminar temporalsesionpass y masterkey
            await new Promise((resolve) => {
                chrome.storage.local.remove(['temporalsesionpass', 'masterkey'], resolve);
            });
        }
    } catch (error) {
        //console.error("Error en GO_TO_ENCRYPT_REMOVE:", error);
    }
};

export const ModalBlock = () => {
    const [inputValue1, setInputValue1] = useState('');
    const [inputValue2, setInputValue2] = useState('');
    const [inputValue3, setInputValue3] = useState('');
    const { toggleModalLock, showModalLock, setModalManualUnblockPass, toggleManualUnblockPass } = useModalLock();
    const { toggleBlockPass, showpasswords } = useModalBlockpass();
    const [showInputError, setShowInputError] = useState(false);
    const [errorPassBlock, setErrorPassBlock] = useState(false);
    const { setBlockPasswords, blockpass } = useSetPassblock();
    const { dataCodePass } = useContext(CodePassContext);
    const inputRefOne = useRef(null);
    const inputRefTwo = useRef(null);
    // [FUNCTIONS]
    const validateInputs = (val1, val2) => {
        // también validamos que la longitud sea mayor a 7 caracteres
        return (val1.trim().length > 7 && val2.trim().length > 7 && val1 === val2);
    }
    const saveBlock = () => {
        const isValid = validateInputs(inputValue1, inputValue2);
        if (isValid) {
            setShowInputError(false);
            setModalManualUnblockPass(false);
            setBlockPasswords(inputValue1);
            toggleModalLock();
            setInputValue1('');
            setInputValue2('');
            setTimeout(() => {
                toggleBlockPass();
            }, 500);
        } else {
            setShowInputError(true);
        }
    }
    const saveUnblock = () => {
        const GO_TO_VALIDATE = async () => {
            // Desencriptamos la passblock para comparar
            try {
                const decrypted = await decryptWithPassphrase(blockpass, inputValue3);
                const isValid = inputValue3 === decrypted;
                if (isValid) {
                    // Si blockpasswords es true, estamos desbloqueando (crear keys)
                    // Si blockpasswords es false, estamos bloqueando (eliminar keys)
                    const shouldCreateKeys = dataCodePass.blockpasswords;
                    
                    await GO_TO_ENCRYPT_REMOVE(inputValue3, shouldCreateKeys);
                    
                    toggleModalLock();
                    setInputValue3('');
                    setErrorPassBlock(false);
                    toggleBlockPass();
                    toggleManualUnblockPass();
                } else {
                    setErrorPassBlock(true);
                }
            } catch (error) {
                setErrorPassBlock(true);
            }
        };
        GO_TO_VALIDATE();
    }
    const closeModal = () => {
        toggleModalLock();
        setErrorPassBlock(false);
        setShowInputError(false);
        setInputValue1('');
        setInputValue2('');
        setInputValue3('');
    }
    // EFFECT PRIMERA CARGA FOCUS EN INPUT 1
    useEffect(() => {
        if (showModalLock) {
            setTimeout(() => {
                if (inputRefOne.current) {
                    inputRefOne.current.focus();
                }
                if (inputRefTwo.current) {
                    inputRefTwo.current.focus();
                }
            }, 500);
        }
    }, [showModalLock]);
    const MODAL_ACTION = (!blockpass) ? () => { saveBlock() } : () => { saveUnblock() };    
    return (
        (showModalLock) && (
            <ModalGeneric action={MODAL_ACTION} show={showModalLock} mode={(!blockpass) ? "large" : "middle"} type="warn" buttonText={`${(!blockpass) ? MESSAGE_ES.modalblock.block : (showpasswords) ? MESSAGE_ES.modalblock.block2 : MESSAGE_ES.modalblock.unblock}`}>
                {(!blockpass)
                    ?
                    (<>
                        <header className="flex-center flex-col h-[20%] w-full">
                            <IconRobotHappy ww="60" />
                            <h3 className="font-orbitron-normal text-xl">{MESSAGE_ES.modalblock.title}</h3>
                        </header>
                        <article className="h-[80%] w-full pt-1 text-left flex flex-col justify-start items-start gap-4">
                            <span className="font-barlownormal text-base">
                                {MESSAGE_ES.modalblock.content1}
                            </span>
                            <span className="font-barlownormal text-base">
                                {MESSAGE_ES.modalblock.content3}
                            </span>
                            <InputGeneric type="password" ref={inputRefOne} value={inputValue1} keydownaction={MODAL_ACTION} onChange={(e) => setInputValue1(e.target.value)} placeholder={MESSAGE_ES.modalblock.placeholder1} />
                            <InputGeneric type="password" value={inputValue2} keydownaction={MODAL_ACTION} onChange={(e) => setInputValue2(e.target.value)} placeholder={MESSAGE_ES.modalblock.placeholder2} />
                            {(showInputError) && (
                                <span className='font-barlownormal text-sm text-red-500'>{MESSAGE_ES.modalblock.error}</span>
                            )}
                            <div className='w-full flex justify-center items-end h-full pb-3'>
                                <ButtonGeneric action={() => { closeModal() }} text={MESSAGE_ES.modalblock.close} />
                            </div>
                        </article>
                    </>)
                    : (
                        <>
                            <header className="flex-center flex-col h-[40%] w-full">
                                <IconRobotWh ww="80" />
                                <h3 className="font-orbitron-normal text-xl">{MESSAGE_ES.modalblock.title}</h3>
                            </header>
                            <article className="h-[60%] w-full pt-1 text-left flex flex-col justify-start items-start gap-4">
                                <span className="font-barlownormal text-base">
                                    {(showpasswords) ? MESSAGE_ES.modalblock.content2 : MESSAGE_ES.modalblock.content4}
                                </span>
                                <InputGeneric type="password" ref={inputRefTwo} value={inputValue3} keydownaction={MODAL_ACTION} onChange={(e) => setInputValue3(e.target.value)} placeholder={MESSAGE_ES.modalblock.placeholder1} />
                                {(errorPassBlock) && (
                                    <span className='font-barlownormal text-sm text-red-500'>{MESSAGE_ES.modalblock.errorunblock}</span>
                                )}
                                <div className='w-full flex justify-center items-end h-full pb-3'>
                                    <ButtonGeneric action={() => { closeModal() }} text={MESSAGE_ES.modalblock.close} />
                                </div>
                            </article>
                        </>
                    )}
            </ModalGeneric>
        )
    )
}