/**
 * Context que almacena los datos de la APP para la página <CodePass/>
 * @function SessionLogin
 * @description Este context <CodepassContext/> comparte los estados e información reactiva para toda la pagina <CodePass/>
 * @param {React.Provider}  - Provider que envuelve {children} para poder usar contexto
 * @returns {React.Context} - Estados requeridos para el componente <CodePass/>
 */

import { createContext, useState } from "react";
import PropTypes from 'prop-types';
import { PAGE_NAMES } from '@utils/PageNames'
const CodePassContext = createContext();

const data = {
    net: false,
    theme: 'Dark',
    page: PAGE_NAMES.initial,
    pages: PAGE_NAMES,
    modal: false,
    modalLock: false,
    modalPort: false,
    modalError: false,
    datapasswords: [],
    blockpasswords: false,
    passblock: '',
    filter: '',
    manualunblockpass: false,
    modalRequired: false,
    onImportFile: false,
    onDriveFile: false,
}

const CodePassProvider = ({ children }) => {
    const [dataCodePass, setDataCodePass] = useState({ ...data });
    const updatePasswords = (newPasswords) => {
        if (!Array.isArray(newPasswords)) {
            //console.log('updatePasswords: El valor debe ser un array');
            //console.log('INTENTANDO ACTUALIZAR CON:', newPasswords);
            return;
        }
        setDataCodePass(prevData => ({
            ...prevData,
            datapasswords: [...prevData.datapasswords, ...newPasswords]
        }));
        // actualizamos datos en local
        chrome.storage.local.get('codepassdata').then((data) => {
            chrome.storage.local.set({ 'codepassdata': [...(data.codepassdata || []), ...newPasswords] });
        });
    };
    const updateAllPasswords = (newPasswords) => {
        //console.log('Proceso updateAllPasswords');
        if (!Array.isArray(newPasswords)) {
            //console.log('updateAllPasswords: El valor debe ser un array');
            return;
        }
        setDataCodePass(prevData =>
        ({
            ...prevData,
            datapasswords: [...newPasswords]
        }));
        // actualizamos datos en local
        chrome.storage.local.set({ 'codepassdata': newPasswords });
    };
    const initPasswords = (newPasswords) => {
        if (!Array.isArray(newPasswords)) {
            //console.log('initPasswords: El valor debe ser un array');
            return;
        }
        setDataCodePass(prevData => ({
            ...prevData,
            datapasswords: [...newPasswords]
        }));
    };
    const resetContext = () => {
        chrome.storage.local.remove("accountToken", () => {
            chrome.storage.local.remove("timeToken", () => {
                chrome.storage.local.remove("codepassdata", () => {
                    chrome.storage.local.remove("blockdatapass", () => {
                        chrome.storage.local.remove("manualunblockpass", () => {
                            chrome.storage.local.remove("temporalsesionpass", () => {
                                chrome.storage.local.remove("masterkey", () => {
                                    //console.log("Session disconnected");
                                });
                            });
                        });
                    });
                });
            });
        });
        setDataCodePass({ ...data });
        // reseteamos array de passwords del contexto no de chrome
        setDataCodePass(prevData => ({
            ...prevData,
            datapasswords: []
        }));
    }
    const setModalLock = (status) => {
        setDataCodePass(prevData => ({
            ...prevData,
            modalLock: status
        }));
        chrome.storage.local.set({ 'modalLock': status });
    }
    const setModalRequired = (status) => {
        setDataCodePass(prevData =>
        ({
            ...prevData,
            modalRequired: status
        }));
    }
    const setManualUnblockPass = (status) => {
        setDataCodePass(prevData => ({
            ...prevData,
            manualunblockpass: status
        }));
    }
    const setBlockPasswords = (status) => {
        setDataCodePass(prevData => ({
            ...prevData,
            blockpasswords: status
        }));
    }
    const setPassBlock = (pass) => {
        setDataCodePass(prevData => ({
            ...prevData,
            passblock: pass
        }));
    }
    const removePasswordContext = (name) => {
        setDataCodePass(prevData => ({
            ...prevData,
            datapasswords: prevData.datapasswords.filter(pss => pss.namekey !== name)
        }));
        // actualizamos datos en local
        chrome.storage.local.get('codepassdata').then((data) => {
            const updatedPasswords = (data.codepassdata || []).filter(pss => pss.namekey !== name);
            chrome.storage.local.set({ 'codepassdata': updatedPasswords });
        });
    }
    const updatePasswordByName = (params) => {
        const { namekey, newPassword } = params;
        setDataCodePass(prevData => ({
            ...prevData,
            datapasswords: prevData.datapasswords.map(pss =>
                pss.namekey === namekey ? { ...pss, password: newPassword } : pss
            )
        }));
        // actualizamos datos en local
        chrome.storage.local.get('codepassdata').then((data) => {
            const updatedPasswords = (data.codepassdata || []).map(pss =>
                pss.namekey === namekey ? { ...pss, password: newPassword } : pss
            );
            chrome.storage.local.set({ 'codepassdata': updatedPasswords });
        });
    }
    const blockPassword = (params) => {
        const { namekey, status } = params;
        // buscamos la password en el array de passwords por namekey, luego la actualizamos poniendo  una nueva key llamada block
        setDataCodePass(prevData => ({
            ...prevData,
            datapasswords: prevData.datapasswords.map(pss =>
                pss.namekey === namekey ? { ...pss, block: status } : pss
            )
        }));
        // actualizamos datos en local
        chrome.storage.local.get('codepassdata').then((data) => {
            const updatedPasswords = (data.codepassdata || []).map(pss =>
                pss.namekey === namekey ? { ...pss, block: status } : pss
            );
            chrome.storage.local.set({ 'codepassdata': updatedPasswords });
        });
    }
    const getPassBlock = () => {
        let dataStorePass = '';
        chrome.storage.local.get('blockdatapass').then((data) => {
            dataStorePass = data.blockdatapass;
        });
        if (dataStorePass !== "") {
            setPassBlock(dataStorePass);
            return dataStorePass;
        }
        return dataCodePass.passblock;
    }
    const setFilter = (filter) => {
        setDataCodePass(prevData =>
        ({
            ...prevData,
            filter: filter
        }));
    }
    const getFilter = () => {
        return dataCodePass.filter;
    }
    const setModalPort = (status) => {
        setDataCodePass(prevData => ({
            ...prevData,
            modalPort: status
        }));
    }
    const setOnImportFile = (status) => {
        setDataCodePass(prevData => ({
            ...prevData,
            onImportFile: status
        }));
    }
    const setOnDriveFile = (status) => {
        setDataCodePass(prevData => ({
            ...prevData,
            onDriveFile: status
        }));
    }
    return (
        <CodePassContext.Provider value={{
            dataCodePass, setDataCodePass, updatePasswords, resetContext, setModalLock,
            setBlockPasswords, setPassBlock, removePasswordContext, updatePasswordByName,
            blockPassword, getPassBlock, setFilter, getFilter, setModalPort, setManualUnblockPass,
            initPasswords, updateAllPasswords, setModalRequired, setOnImportFile, setOnDriveFile
        }}>
            {children}
        </CodePassContext.Provider>
    );

}

// Validación de tipos para las propiedades
CodePassProvider.propTypes = {
    children: PropTypes.node.isRequired,
};


export { CodePassProvider, CodePassContext }