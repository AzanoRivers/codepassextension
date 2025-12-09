/**
 * Hook personalizado que gestiona el estado de tema
 *
 * @function useDarkMode
 * @description Este hook gestiona un estado de carga y lo cambia a `false` después de 3 segundos.
 * @returns {[string, Function]} - Un array con el estado de carga y una función para actualizar el estado.
*/


import { useEffect, useState } from "react";

const useDarkMode = () => {
    const [theme, setTheme] = useState('light');
    useEffect(() => {
        const ROOT = window.document.documentElement;
        const OLD_THEME = (theme === 'dark') ? 'light' : 'dark';
        ROOT.classList.remove(OLD_THEME);
        ROOT.classList.add(theme);
    }, [theme]);
    return [theme, setTheme]
}

export { useDarkMode }