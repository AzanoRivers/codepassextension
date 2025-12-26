import { useRef, useEffect, useState } from "react"
import toast from "react-hot-toast";
import PropTypes from 'prop-types';
import { MESSAGE_ES } from '@utils/Message';
import { decryptWithPassphrase } from "@utils/EncodePayload.js";

// funcion utilitaria para encontarr en el padre más cercano un elemento con atributo data-pss y retornar su valor
const findClosestDataPss = (element) => {
    const MAX_DEPTH = 10;
    let depth = 0;
    while (element && depth < MAX_DEPTH) {
        if (element.hasAttribute('data-pss')) {
            return element.getAttribute('data-pss');
        }
        element = element.parentElement;
        depth++;
    }
    return null;
};

export function SelectView({ cancel, action, encryptedPassword }) {
    // [STATES & REFS]
    const [password, setPassword] = useState('');
    const elementRef = useRef(null);
    // [FUNCTIONS]
    const CANCEL_ACTION = cancel || (() => { /* //console.log('Cancelando...') */ });
    const ACTION = action || (() => { });
    const handleCancel = () => {
        CANCEL_ACTION();
    };
    const handleAction = () => {
        const DECRYPT_PASS = async (password) => {
            try {                
                if (password) {
                    navigator.clipboard.writeText(password).then(() => {
                        toast.success(MESSAGE_ES.display.copyPasswordOk, { position: 'bottom-center', duration: 1000, });
                    }).catch(err => {
                        console.log('Error en Copy', err);
                    });
                } else {
                    toast.error('Error en Copy', { position: 'bottom-center', duration: 2000, });
                }
            } catch (error) {
                //console.log("Error decrypting password:", error);
                return null;
            }
        };
        DECRYPT_PASS(password);
        ACTION();
    };

    // [EFFECTS]
    useEffect(() => {
        // Desencriptamos la password recibida como prop
        const decryptPassword = async (encryptedPwd) => {
            try {
                if (!encryptedPwd) {
                    // Si no hay password cifrada como prop, intentar buscarla en el DOM (fallback)
                    if (elementRef.current) {
                        const foundPassword = findClosestDataPss(elementRef.current);
                        encryptedPwd = foundPassword;
                    }
                }
                
                if (!encryptedPwd) {
                    setPassword('');
                    return;
                }
                
                const TIME_TOKEN = await chrome.storage.local.get('temporalsesionpass');
                const decrypted = await decryptWithPassphrase(encryptedPwd, TIME_TOKEN.temporalsesionpass);
                setPassword(decrypted || '');
            } catch (error) {
                //console.log("Error decrypting password:", error);
                setPassword('');
            }
        };
        decryptPassword(encryptedPassword || '');
    }, [encryptedPassword]);

    // [RENDER]
    return (
        <div ref={elementRef} className="min-w-64 w-64 h-full flex justify-start items-center flex-row p-1 relative">
            <div className='w-[72%] h-full pr-3'>
                <span onClick={handleAction}
                    className="block w-full h-full max-h-10 text-sm text-white overflow-hidden whitespace-nowrap text-ellipsis pr-2">
                    {password}
                </span>
            </div>
            <div className='w-[28%] h-full pr-3 flex-center gap-1 absolute right-2 top-0'>
                <div className='w-1/2 h-full text-center text-white bg-red font-bold text-base pb-1 border-lightblue' onClick={handleCancel}>✖</div>
            </div>
        </div>
    );
}

SelectView.propTypes = {
    cancel: PropTypes.func,
    action: PropTypes.func,
    encryptedPassword: PropTypes.string,
};
