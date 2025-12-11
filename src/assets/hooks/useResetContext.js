/**
 * @hook useCodePass
 * @description Hook personalizado para acceder al contexto global de la página <CodePass />.
 *              Retorna el estado actual del contexto y una función para modificarlo.
 *              Este hook debe usarse dentro del proveedor <CodePassProvider />.
 * @example
 * const [dataCodePass, setDataCodePass] = useCodePass();
 * //console.log(dataCodePass.theme); // 'Dark'
 * setDataCodePass(prev => ({ ...prev, theme: 'Light' }));
 * @returns {[Object, Function]} Un array con el estado global `dataCodePass` y la función `setDataCodePass` para actualizarlo.
 */

import { useContext } from 'react';
import { CodePassContext } from '@contexts/CodePassContext';

const useResetContext = () => {
    const context = useContext(CodePassContext);
    if (!context) {
        //console.error('useResetContext debe usarse dentro de un <CodePassProvider/>');
    }

    const { resetContext } = context;

    return { resetContext };
};

export { useResetContext };
