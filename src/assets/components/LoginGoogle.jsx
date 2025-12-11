/**
 * @component Componente <GoogleLogin/> que muestra botón de autentificaciín con Google 
 * @example simplemente se llama al componente: <GoogleLogin /> 
 * @description Se debe insertar dentro del provider <GoogleOAuthProvider>
 * @description Usa el @hook useLogin() para gestionar el contexto del Login <LoginContext/>
 * @returns {JSX.Element} Un elemento JSX(div) conteniendo el botón-componente <GoogleLogin/> junto con sus funciones manejadoras
*/

import { useState, useRef } from "react";
import { useDataDriveGoogle } from '@hooks/useDataDriveGoogle';
import { MESSAGE_ES } from "@utils/Message";
import { ModalGeneric } from '@components/ModalGeneric';
import { IconRobotX } from '@icons/IconRobotX';
import toast from "react-hot-toast";

const LoginGoogle = () => {
    // [STATES]

    const [textLogin, setTextLogin] = useState(MESSAGE_ES.buttons.login);
    const [errorLogin, setErrorLogin] = useState(false);
    const refWaiting = useRef(false);
    const { tryGetDataGoogleDrive } = useDataDriveGoogle();
    // [FUNCTIONS]
    const ACTION_BTN = () => {
        setErrorLogin(false);
        setErrorLogin(false);
        refWaiting.current = false;
    }
    const ACTION_OVER = () => {
        setErrorLogin(false);
        refWaiting.current = false;
    }

    const loginWithGoogle = () => {
        if (refWaiting.current) {
            toast.error(MESSAGE_ES.error.googlemodal, { position: 'bottom-center', duration: 2000, });
            return;
        }
        refWaiting.current = true;
        try {
            if (chrome?.runtime) {
                setTextLogin(MESSAGE_ES.buttons.connecting);
                chrome.runtime.sendMessage(
                    { action: "login_with_google" },
                    (response) => {
                        if ((response?.error !== '' && !response.success) || !response.token) {
                            //console.log(response);
                            
                            toast.error(MESSAGE_ES.error.denegate, { position: 'bottom-center', duration: 3000, });
                            setErrorLogin(true);
                            setTextLogin(MESSAGE_ES.buttons.login);
                        } else {
                            if (response?.token) {
                                const unixTimestamp = Math.floor(Date.now() / 1000);
                                const futureTimestamp = unixTimestamp + 15 * 60; // 15 minutes
                                chrome.storage.local.set({
                                    accountToken: response?.token, timeToken: futureTimestamp
                                }, () => {
                                    tryGetDataGoogleDrive();
                                });
                            }
                        }
                    }
                );
            }
        } catch (error) {
            refWaiting.current = false;
            setErrorLogin(true);
            //console.log(error.message);
            setTextLogin(MESSAGE_ES.buttons.login);
            toast.error(MESSAGE_ES.error.unexpected, { position: 'bottom-center', duration: 3000, });
        }
    }
    // [RENDER]
    return (
        <>
            <div className="w-full flex-center pl-8 pr-8">
                <button
                    className="w-full h-max border-action text-white text-2xl font-barlow-bold pt-1 pb-1 bg-codelabs"
                    onClick={loginWithGoogle}>
                    {textLogin}
                </button>
            </div>
            {
                <ModalGeneric action={ACTION_BTN} show={errorLogin} mode="middle" overaction={ACTION_OVER} type="error">
                    <header className='flex-center flex-col h-3/5 w-full'>
                        <IconRobotX ww="150" />
                        <h3 className='font-orbitron-title text-3xl'>Error</h3>
                    </header>
                    <article className='h-2/5 w-full pt-4 text-left'>
                        <span className='font-barlownormal text-xl'>
                            {MESSAGE_ES.error.net}
                        </span>
                    </article>
                </ModalGeneric>
            }
        </>

    )
}

export { LoginGoogle };