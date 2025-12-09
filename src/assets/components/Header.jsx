/**
 * @component <Header />
 * @example <Header />
 * @description Muestra el header con el logo y cuenta de usuario si hay conexión
 * @description No requiere props.
 * @returns {JSX.Element} Header con logo y cuenta de usuario.
 */

import { useState, useEffect, useCallback } from 'react';
import { LogoCodepass } from '@components/LogoCodepass';
import { UserAccount } from '@components/UserAccount';
import { MESSAGE_ES } from '@utils/Message';

const Header = () => {
    const [isEasterEgg, setIsEasterEgg] = useState(false);
    const [hasShownOnMount, setHasShownOnMount] = useState(false);
    
    const onClickEasterEgg = useCallback(() => {
        if (isEasterEgg) return;
        setIsEasterEgg(true);
        setTimeout(() => {
            setIsEasterEgg(false);
        }, 6500);
    }, [isEasterEgg]);
    
    // Primera carga muestra el easter egg (solo una vez)
    useEffect(() => {
        if (!hasShownOnMount) {
            setHasShownOnMount(true);
            setIsEasterEgg(true);
            setTimeout(() => {
                setIsEasterEgg(false);
            }, 6500);
        }
    }, [hasShownOnMount]);
    return (
        <header className="flex flex-row justify-between h-1/5 w-full pl-2 pr-2 relative">
            <LogoCodepass action={onClickEasterEgg} />
            <UserAccount />
            <span className={`w-max h-6 px-4 flex-center absolute bottom-[25%] left-20 text-white bg-arcoiris text-sm font-barlownormal no-action-pointer rounded-md ${isEasterEgg ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
                {MESSAGE_ES.created}
            </span>
        </header>
    );
};

export { Header };
