/**
 * @hook useTestRed
 * @description Hook personalizado que verifica si hay conexión a internet real usando el endpoint público de Google.
 * @description Modifica el contexto <CodePassContext> cambiando los valores de `net` y `modalError` según el resultado.
 * @description Se activa únicamente cuando `connect` es true. Al terminar, restablece `connect` a false para evitar loops.
 * @description Utiliza `AbortController` para cancelar la petición en caso de desmontaje o reinicio del hook.
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
            const controller = new AbortController();
            fetch('https://clients3.google.com/generate_204', {
                method: 'GET',
                signal: controller.signal
            }).then(response => {
                if (response.status === 204) {
                    // console.log('CONNECTED!');
                    setDataCodePass(data => ({ ...data, net: true, modalError: false }));
                } else {
                    console.warn('SIN NET');
                    setDataCodePass(data => ({ ...data, net: false, modalError: true }));
                }
                setConnect(false);
            }).catch(() => {
                console.warn('ERROR DE RED');
                setDataCodePass(data => ({ ...data, net: false, modalError: true }));
                setConnect(false);
            });
            return () => controller.abort();
        }
    }, [connect, setDataCodePass]);

    return [connect, setConnect];
};

export { useTestRed };
