import { IconLock } from '@icons/IconLock';
import { useRef, useState, useEffect, useCallback } from 'react';
import { IconUnlock } from '@icons/IconUnlock';
import { ModalGeneric } from '@components/ModalGeneric';
import { InputGeneric } from '@components/InputGeneric';
import { MESSAGE_ES } from '@utils/Message';
import { useModalRequired } from '@hooks/useModalRequired';
import toast from 'react-hot-toast';

export const ModalRequired = () => {
    // [STATES & HOOKS]
    const { showModalRequired, toggleModalRequired, setOnImportFile, dataCodePass } = useModalRequired();
    const [okValidation, setOkValidation] = useState(false);
    const [inputBlockPhrase, setInputBlockPhrase] = useState('');
    const [isPulsing, setIsPulsing] = useState(false);
    const inputBlockPhraseRef = useRef(null);
    // [FUNCTIONS]
    const onUnlockPasswords = () => {
        // Aquí se debería validar la frase de bloqueo y desbloquear las passwords
        //console.log('onUnlockPasswords');
        if (inputBlockPhrase === '' || !inputBlockPhrase) {
            toast.error(MESSAGE_ES.modalrequired.invalidphrase, { position: 'bottom-center', duration: 3000 });
            return;
        }
        // Sección de validación OK
        // Detectar si viene de Drive o Import
        const isDriveFile = dataCodePass.onDriveFile;
        
        //console.log('isDriveFile:', isDriveFile);
        
        if (isDriveFile) {
            //console.log('Guardando temporaldrivepass');
            chrome.storage.local.set({ temporaldrivepass: inputBlockPhrase }, () => {
                //console.log('temporaldrivepass guardado');
            });
            // Ya está en true, no necesitamos setOnDriveFile(true) aquí
        } else {
            //console.log('Guardando temporalimportpass');
            chrome.storage.local.set({ temporalimportpass: inputBlockPhrase });
            setOnImportFile(true);
        }
        
        setInputBlockPhrase('');
        setOkValidation(true);
        // Creamos temporalblockpass en el storage para usar en la importación/drive
        setTimeout(() => {
            toggleModalRequired();
            resetStates();
        }, 1000);
    };
    const onOveraction = () => {
        toast.error(MESSAGE_ES.modalrequired.required, { position: 'bottom-center', duration: 3000 });
        inputBlockPhraseRef.current.focus();
        // Activar pulso solo si no está activo
        setIsPulsing(prev => {
            if (prev) return prev;
            return true;
        });
        setTimeout(() => {
            setIsPulsing(false);
        }, 500);    }
    const resetStates = useCallback(() => {
        setInputBlockPhrase('');
        setIsPulsing(false);
        setOkValidation(false);
    }, []);
    // [EFFECTS]
    useEffect(() => {
        if (showModalRequired) {
            inputBlockPhraseRef.current.focus();
        } else {
            // Limpiar estados cuando el modal se cierra
            setInputBlockPhrase('');
            setIsPulsing(false);
            setOkValidation(false);
        }
    }, [showModalRequired]);

    return (
        (showModalRequired) && (
            <ModalGeneric action={onUnlockPasswords} show={showModalRequired} mode={"small"} className={`${isPulsing ? 'pulse-mandatory' : ''}`}
                type={(!okValidation) ? "warn" : "success"} buttonText={MESSAGE_ES.modalblock.unblock} overaction={onOveraction}>
                <div className={`h-[18%] w-full flex flex-col items-center justify-between gap-2`}>
                    <header className='min-h-14 h-14 w-full flex-center relative'>
                        <IconLock className={`h-10 w-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${okValidation ? 'opacity-0' : 'opacity-100'}`} />
                        <IconUnlock className={`text-green-500 h-10 w-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${okValidation ? 'opacity-100' : 'opacity-0'}`} />
                    </header>
                </div>
                <article className="h-[75%] w-full flex-center flex-col">
                    <h5 className='text-white font-orbitron-title text-center text-base'>
                        {MESSAGE_ES.modalrequired.required}
                    </h5>
                    <p className='text-white barlownormal text-left text-sm mt-2'>
                        {MESSAGE_ES.modalrequired.messageone}
                    </p>
                    <div className={`w-full h-8 max-h-8 mt-2`}>
                        <InputGeneric
                            ref={inputBlockPhraseRef}
                            type="password"
                            value={inputBlockPhrase}
                            onChange={(e) => setInputBlockPhrase(e.target.value)}
                            keydownaction={onUnlockPasswords}
                            className={`w-full h-full text-sm`}
                            placeholder={MESSAGE_ES.modalport.blockphraseplaceholder}
                        />
                    </div>
                </article>
            </ModalGeneric>
        )
    )
}
