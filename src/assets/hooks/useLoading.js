/**
 * Hook personalizado que gestiona el estado de carga.
 *
 * @function useLoading
 * @description Este hook gestiona un estado de carga y lo cambia a `false` después de 3 segundos.
 * @returns {[boolean, Function]} - Un array con el estado de carga y una función para actualizar el estado.
 */

import { useEffect, useState } from "react";

const useLoading = () => {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let timer;
        if (loading) {
            const returnLoadingTrue = new Promise((resolve) => {
                timer = setTimeout(() => {
                    resolve(true);
                }, 4000);
            });

            returnLoadingTrue.then(() => {
                setLoading(false);
            });
        }

        // Limpiar el temporizador si el componente se desmonta o si loading cambia
        return () => clearTimeout(timer);
    }, [loading]);
    return [loading, setLoading];
};

export { useLoading };