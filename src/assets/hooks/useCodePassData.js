/**
 * @hook useCodePass
 * @description Hook personalizado para acceder al contexto global de la página <CodePass />.
 *              Retorna el estado actual del contexto y una función para modificarlo.
 *              Este hook debe usarse dentro del proveedor <CodePassProvider />.
 * @example
 * const [dataCodePass, setDataCodePass] = useCodePass();
 * console.log(dataCodePass.theme); // 'Dark'
 * setDataCodePass(prev => ({ ...prev, theme: 'Light' }));
 * @returns {[Object, Function]} Un array con el estado global `dataCodePass` y la función `setDataCodePass` para actualizarlo.
 */

import { useContext } from 'react';
import { CodePassContext } from '@contexts/CodePassContext';
import { go_to_encrypt } from "@utils/EncodePayload.js";

const useCodePass = () => {
    const context = useContext(CodePassContext);
    const { dataCodePass, updatePasswords: contextUpdatePasswords } = context;
    if (!context) {
        console.error('useCodePass debe usarse dentro de un <CodePassProvider/>');
    }
    const updatePasswords = (newPassblock) => {
        const ASYNC_GO_TO_ENCRYPT = async (newPassblock) => {
            const encryptedPasswords = await go_to_encrypt({ passwords: newPassblock });
            contextUpdatePasswords(encryptedPasswords);
        };
        ASYNC_GO_TO_ENCRYPT(newPassblock);
    };
    return [dataCodePass, updatePasswords];
};

export { useCodePass };
