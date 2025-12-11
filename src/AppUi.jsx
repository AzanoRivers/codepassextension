/**
 * @component <AppUi/>
 * @example simplemente se llama al componente: <AppUi/>
 * @description Se debe insertar dentro del provider <LoginProvider> por uso de Contexto <LoginContext>
 * @description Mediante el uso del Contexto <LoginContext> y estados locales, renderiza la página de Login o CodePass
 * @returns {JSX.Element} Un elemento JSX(React.Fragment) conteniendo la página de Login o CodePass
 */

import './tailwind.css';
import { useContext, useEffect, useState } from 'react';
import { Login } from "@pages/Login";
import { CodePass } from '@pages/CodePass';
import { useLogin } from "@hooks/useLogin";
import { LoginContext } from '@contexts/LoginContext';
import { Toaster } from 'react-hot-toast';
import { useResetContext } from '@hooks/useresetContext';

function AppUi() {
  // [STATES]
  const [smooth, setSmooth] = useState(true);
  const { loginState } = useContext(LoginContext);
  const [, setLogin] = useLogin();
  const { resetContext } = useResetContext();
  // [EFFECTS]
  useEffect(() => {
    if (loginState) return; // evita el loop si ya está logueado
    if (chrome?.storage?.local) {
      chrome.storage.local.get(["accountToken", "timeToken", "codepassdata"], (result) => {
        if (result?.accountToken && result?.timeToken && result?.codepassdata) {
          const NOW_UNIX_TIME = Math.floor(Date.now() / 1000);
          if (NOW_UNIX_TIME < result.timeToken) {
            //console.log('LOGUEADO SESSION...');
            setLogin(true);
          } else {
            // session expirada, limpiamos todo
            chrome.storage.local.remove("accountToken", () => {
              chrome.storage.local.remove("timeToken", () => {
                chrome.storage.local.remove("codepassdata", () => {
                  chrome.storage.local.remove("blockdatapass", () => {
                    chrome.storage.local.remove("manualunblockpass", () => {
                      chrome.storage.local.remove("temporalsesionpass", () => {
                        chrome.storage.local.remove("masterkey", () => {
                          resetContext();
                          //console.log("Session disconnected");
                        });
                      });
                    });
                  });
                });
              });
            });
          }
        }
      });
    }
  }, [loginState, setLogin, resetContext]);
  useEffect(() => { // Control de opacidad suave al cambiar el estado de login
    let timerout;
    if (loginState) {
      setSmooth(true);
    } else {
      timerout = setTimeout(() => {
        setSmooth(false);
      }, 500);
    }
    return () => clearTimeout(timerout);
  }, [loginState]);
  useEffect(() => {
    // Desactivamos cerrar extension con ESC
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  // [RENDER]
  const effectOpacity = `transition-opacity duration-500`;
  return (
    <>
      {
        !loginState
          ? <div className={`${effectOpacity} ${smooth ? "opacity-0" : "opacity-100"} w-screen h-screen min-wh-custom`}><Login /></div>
          : <div className={`${effectOpacity} ${!smooth ? "opacity-0" : "opacity-100"} w-screen h-screen min-wh-custom`}><CodePass /></div>
      }
      <Toaster />
    </>
  );
}

export { AppUi };
