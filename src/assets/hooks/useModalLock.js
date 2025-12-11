// hook personalizado para leer el contexto CodepassContext y modificar el estado de modalLock
import { useContext, useEffect, useState } from 'react';
import { CodePassContext } from '@contexts/CodepassContext';
const useModalLock = () => {
    const context = useContext(CodePassContext);
    if (!context) {
        //console.error('useModalLock debe usarse dentro de un <CodePassProvider/>');
    }
    const { dataCodePass, setModalLock, setManualUnblockPass } = context;
    const [showModalLock, setShowModalLock] = useState(dataCodePass.modalLock);
    const toggleModalLock = () => {
        document.startViewTransition(() => {
            setModalLock(!dataCodePass.modalLock);
        });
    };
    const setModalManualUnblockPass = (status) => {
        chrome.storage.local.set({ 'manualunblockpass': status });
        setManualUnblockPass(status);
    };
    const toggleManualUnblockPass = () => {
        chrome.storage.local.get('manualunblockpass', (result) => {
            chrome.storage.local.set({ 'manualunblockpass': !result.manualunblockpass });
            setManualUnblockPass(!result.manualunblockpass);
        });
    }
    useEffect(() => {
        setShowModalLock(dataCodePass.modalLock);
    }, [dataCodePass.modalLock]);
    return { showModalLock, toggleModalLock, setModalManualUnblockPass, toggleManualUnblockPass };
};

export { useModalLock };