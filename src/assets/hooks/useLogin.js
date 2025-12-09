/**
 * Hook personalizado que gestiona el contexto de Login
 * @function useLogin
 * @description Este hook gestiona el contexto de login , se debe usar la función setLogin()
 * @description Sí loginState es === true, la app ingresa a codepass, si nó muestra vista de login
 * @returns {[boolean, Function]} - Un array con el estado de login y una función para actualizar el estado.
 */

import { useContext } from 'react';
import { LoginContext } from '@contexts/LoginContext';
import { CodePassContext } from '@contexts/CodepassContext';

const useLogin = () => {
    const { loginState, setLoginState } = useContext(LoginContext);
    const {
        setDataCodePass, resetContext, initPasswords, setPassBlock, setManualUnblockPass,
        setBlockPasswords
    } = useContext(CodePassContext);

    // Centraliza el cambio de estado
    const setLogin = (isLoggedIn) => {
        const localPasswords = [];
        setLoginState(isLoggedIn);
        setDataCodePass(data => ({
            ...data,
            page: isLoggedIn ? data.pages.codepass : data.pages.initial,
            net: false,
            modalError: false
        }));
        chrome.storage.local.get('codepassdata').then((data) => {
            localPasswords.push(...(data.codepassdata || []));
            initPasswords(localPasswords);
            chrome.storage.local.get('blockdatapass').then((data) => {
                let dataStorePass = data.blockdatapass;
                setPassBlock(dataStorePass || '');
                chrome.storage.local.get('manualunblockpass').then((data) => {
                    let manualUnblockPass = data?.manualunblockpass || false;
                    setManualUnblockPass(manualUnblockPass);
                    // Solo establecer blockpasswords en true si hay blockpass Y hay passwords
                    if (!manualUnblockPass && dataStorePass !== '' && localPasswords.length > 0) {
                        setBlockPasswords(true);
                    } else {
                        setBlockPasswords(false);
                    }
                });
            });
        });

        if (!isLoggedIn) {
            resetContext();
        }
    };

    return [loginState, setLogin];
};


export { useLogin };