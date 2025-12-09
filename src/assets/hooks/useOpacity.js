/**
 * Hook personalizado que gestiona el estado de visibilidad de componentes. Evita render brusco
 *
 * @function useOpacity
 * @description Este hook gestiona un estado de visibilidad cuando loading es true y lo cambia a `true` después de 500 milisegundos.
 * @returns {[boolean, Function]} - Un array con el estado de carga y una función para actualizar el estado.
 */
import { useEffect, useState } from "react";

const useOpacity = () => {
    const [opacity, setOpacity] = useState(false);
    useEffect(() => {
        let timer;
        if (opacity) {
            const returnOpacityTrue = new Promise((resolve) => {
                timer = setTimeout(() => {
                    resolve(true);
                }, 500);
            });
            // Consumimos promise timer
            returnOpacityTrue.then(() => {
                setOpacity(true);
            });
        }
        return () => clearTimeout(timer);
    }, [opacity])

    return [opacity, setOpacity];
}

export { useOpacity };