/**
 * @hook useTestRed
 * @description Hook personalizado que verifica si hay conexión a internet usando navigator.onLine.
 * @description Modifica el contexto <CodePassContext> cambiando los valores de `net` y `modalError` según el resultado.
 * @description Se activa únicamente cuando `connect` es true. Al terminar, restablece `connect` a false para evitar loops.
 * @returns {[boolean, Function]} - Devuelve un array con el estado [connect] y una función [setConnect] para iniciar la verificación.
 * @example
 * const [connect, setConnect] = useTestRed();
 * setConnect(true); // Activa el chequeo de red
 */
import { useState, useEffect, useContext } from "react";
import { CodePassContext } from '@contexts/CodepassContext';

const useTestRed = () => {
    const { setDataCodePass } = useContext(CodePassContext);
    const [connect, setConnect] = useState(false);

    useEffect(() => {
        if (connect) {
            // Verificar estado de conexión usando navigator.onLine
            const isOnline = navigator.onLine;
            
            if (isOnline) {
                // console.log('CONNECTED!');
                setDataCodePass(data => ({ ...data, net: true, modalError: false }));
            } else {
                console.warn('SIN CONEXIÓN');
                setDataCodePass(data => ({ ...data, net: false, modalError: true }));
            }
            
            setConnect(false);
        }
    }, [connect, setDataCodePass]);

    // Listeners para cambios de conexión
    useEffect(() => {
        const handleOnline = () => {
            setDataCodePass(data => ({ ...data, net: true, modalError: false }));
        };
        
        const handleOffline = () => {
            setDataCodePass(data => ({ ...data, net: false, modalError: true }));
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [setDataCodePass]);

    return [connect, setConnect];
};

export { useTestRed };
