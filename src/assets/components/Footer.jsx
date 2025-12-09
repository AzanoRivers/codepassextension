/**
 * @component <Footer />
 * @example <Footer />
 * @description Componente de pie de página fijo en la parte inferior de la pantalla.
 * @description Estilizado con fondo blanco y centrado horizontal/verticalmente.
 * @returns {JSX.Element} Un contenedor div con altura fija y posición absoluta al fondo.
 */

import { useState, useEffect, useRef } from 'react';
import { IconLock } from '@icons/IconLock';
import { IconSearch } from '@icons/IconSearch';
import { IconPort } from '@icons/IconPort';
import { useModalLock } from '@hooks/useModalLock';
import { useCodePass } from '@hooks/useCodePassData';
import { useFilterPass } from '@hooks/useFilterPass';
import { InputGeneric } from "@components/InputGeneric";
import { MESSAGE_ES } from '@utils/Message';
import { useModalPort } from '@hooks/useModalPort';

const Footer = () => {
    // [STATES & HOOKS]
    const [onFilter, setOnFilter] = useState(false);
    const [valueInputFilter, setValueInputFilter] = useState('');
    const { toggleModalLock } = useModalLock();
    const [dataCodePass] = useCodePass();
    const { updateFilter } = useFilterPass();
    const [onAnimationFilter, setOnAnimationFilter] = useState(false);
    const [onResetPosSearchIcon, setOnResetPosSearchIcon] = useState(false);
    const { toggleModalPort } = useModalPort();
    const inputRef = useRef(null);
    // [FUNCTIONS]
    const handleClick = () => {
        toggleModalLock();
    };
    const handleFilterClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
        if (!onAnimationFilter) {
            document.startViewTransition(() => {
                setOnAnimationFilter(true);
            });
        }
        setTimeout(() => {
            setOnFilter(true);
            setOnResetPosSearchIcon(true);
            updateFilter(valueInputFilter);
        }, 150);
    };
    const onChangeInputFilter = (e) => {
        const newValue = e.target.value;
        setValueInputFilter(newValue);
    };
    const keyEnterInputFilter = () => {
        updateFilter(valueInputFilter);
    };
    const closeFilter = () => {
        document.startViewTransition(() => {
            setOnFilter(false);
        });
        setTimeout(() => {
            document.startViewTransition(() => {
                setOnAnimationFilter(false);
                updateFilter('');
                setValueInputFilter('');
            });
        }, 150);
    };
    const closeESC = (e) => {
        if (e.key === 'Escape' && onFilter) {
            closeFilter();
        }
    };
    // [EFFECTS]
    useEffect(() => {
        // Primera Carga Focus
        if (onFilter && inputRef.current) {
            inputRef.current.focus();
        }
        // Limpiamos filtro si se cierra
        if (!onFilter) {
            updateFilter('');
        }
    }, [onFilter, updateFilter]);
    // [RENDER]
    const CONTAINER_STYLES = `flex-center flex-col pl-4 pr-4 h-16 w-full fixed bottom-0 left-0 bg-darkblue`;
    const CONTAINER_ICONS_STYLES = `flex justify-around items-center h-full w-full text-white`;
    return (
        <div className={CONTAINER_STYLES}>
            <div className='separator-shadow border-top-blue h-1 w-full'></div>
            <div className={CONTAINER_ICONS_STYLES} onKeyDown={closeESC}>
                <IconLock action={handleClick} className={`h-8 w-8 transition-opacity duration-150 ${onAnimationFilter ? 'opacity-0' : 'opacity-100'} ${onFilter ? 'no-action-pointer' : ''}`} />
                {!dataCodePass.blockpasswords && <IconSearch action={handleFilterClick} className={`h-8 w-8 transition-all duration-150 ${onAnimationFilter && !onResetPosSearchIcon ? 'opacity-0' : 'opacity-100'}`} />}
                {onFilter &&
                    <div className='max-w-[200px] min-w-[150px] h-full flex justify-center items-center relative pt-3 pb-3 gap-2'>
                        <InputGeneric ref={inputRef} className={`h-full w-full transition-opacity duration-150 ${onAnimationFilter ? 'opacity-100' : 'opacity-0'}`} placeholder={MESSAGE_ES.display.searchfilter}
                            value={valueInputFilter} onChange={onChangeInputFilter} keydownaction={keyEnterInputFilter}
                        />
                        <span className='absolute right-12 top-1/2 transform -translate-y-1/2 text-lg font-orbitron-normal'>↵</span>
                        <span onClick={closeFilter} className='text-lg font-orbitron-normal text-white bg-red pl-2 pr-2 rounded-sm cursor-pointer'>✖</span>
                    </div>
                }
                {!dataCodePass.blockpasswords &&
                    <IconPort
                        action={toggleModalPort}
                        className={`h-8 w-8 transition-opacity duration-150 ${onAnimationFilter ? 'opacity-0' : 'opacity-100'} ${onFilter ? 'no-action-pointer' : ''}`}
                    />
                }
            </div>
        </div>
    );
};

export { Footer };
