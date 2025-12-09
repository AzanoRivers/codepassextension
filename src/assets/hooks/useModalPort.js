// hook personalizado para leer el contexto CodepassContext y modificar el estado de modalLock
import { useContext, useState, useEffect } from 'react';
import { CodePassContext } from "@contexts/CodepassContext";
const useModalPort = () => {
    const { dataCodePass, setModalPort } = useContext(CodePassContext);
    const [showModalPort, setShowModalPort] = useState(false);
    if (!dataCodePass) {
        console.error('useModalPort debe usarse dentro de un <CodePassProvider/>');
    }
    const toggleModalPort = () => {
        document.startViewTransition(() => {
            setModalPort(!dataCodePass.modalPort);
        });
    };
    useEffect(() => {
        setShowModalPort(dataCodePass.modalPort);
    }, [dataCodePass.modalPort]);
    return { showModalPort, toggleModalPort };
};

export { useModalPort };