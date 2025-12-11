// hook personalizado para leer el contexto CodepassContext y modificar el estado de modalLock
import { useContext, useState, useEffect } from 'react';
import { CodePassContext } from "@contexts/CodepassContext";

const useModalRequired = () => {
    const { dataCodePass, setModalRequired, setOnImportFile, setOnDriveFile } = useContext(CodePassContext);
    const [showModalRequired, setShowModalRequired] = useState(false);
    if (!dataCodePass) {
        //console.error('useModalRequired debe usarse dentro de un <CodePassProvider/>');
    }
    const toggleModalRequired = () => {
        document.startViewTransition(() => {
            setModalRequired(!dataCodePass.modalRequired);
        });
    };
    useEffect(() => {
        setShowModalRequired(dataCodePass.modalRequired);
    }, [dataCodePass.modalRequired]);
    return { showModalRequired, toggleModalRequired, setOnImportFile, setOnDriveFile, dataCodePass };
};

export { useModalRequired };