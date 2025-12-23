/**
 * @component <InputCodepass />
 * @example <InputCodepass />
 * @description Campo de entrada personalizado con borde estilizado, título y placeholder definidos desde mensajes.
 * @description Diseñado para introducir contraseñas, con estilo visual de interfaz CodePass.
 * @returns {JSX.Element} Un contenedor con etiqueta superior e input tipo password.
*/

import { MESSAGE_ES } from '@utils/Message';
import { useRef, useState, useContext } from 'react';
import { IconRandom } from '@icons/IconRandom';
import { IconEye } from '@icons/IconEye';
import { useCodePass } from '@hooks/useCodePassData';
import { useTestRed } from '@hooks/useTestRed';
import { useSyncDrive } from '@hooks/useSyncDrive';
import { CodePassContext } from '@contexts/CodepassContext';
import randomPhrase from '@utils/randomPhrase';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
const generatePassword = (length = 12) => {
    const chars = '@1aK4m#YycRpVl7=5HOPMbDzJ69CXUxqLIkg0ns8BwjouNhrQt2TZfEeAvF+GSiWd3';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randIndex = Math.floor(Math.random() * chars.length);
        password += chars[randIndex];
    }
    return password;
};
const InputCodepass = ({ onFocus }) => {
    // [STATES]
    const [, setConnect] = useTestRed();
    const inputRef = useRef(null);
    const inputRefPass = useRef(null);
    const activeAccept = useRef(false);
    const [invisibleButtonsState, setInvisibleButtonsState] = useState(true);
    const [placeholderState, setPlaceholderState] = useState(MESSAGE_ES.input.placeholder);
    const [createPassword, setCreatePassword] = useState(false);
    const [, updatePasswords] = useCodePass();
    const context = useContext(CodePassContext);
    const { syncPasswordsToDrive } = useSyncDrive(context);
    let onFocusFunction = onFocus || (() => console.warn('onFocus no es una función válida'));
    if (typeof onFocus !== 'function') {
        onFocusFunction = () => console.warn('onFocus no es una función válida');
    }
    // [FUNCTIONS]
    const generateNameRandom = () => {
        return `input-codepass-${Math.random().toString(36).substring(2, 15)}`;
    }
    const onInputEnter = () => {
        if (inputRef.current) {
            setInvisibleButtonsState(false);
            inputRef.current.focus();
        }
    }
    const activeFocus = () => {
        setInvisibleButtonsState(false);
        onFocusFunction(true);
        setCreatePassword(true);
        setPlaceholderState(MESSAGE_ES.input.placeholder5);
    }
    const clearFocus = () => {
        onFocusFunction(false);
        setCreatePassword(false);
        // Limpiamos los campos
        inputRef.current.value = '';
        inputRefPass.current.value = '';
        inputRefPass.current.type = 'password';
        setPlaceholderState(MESSAGE_ES.input.placeholder)
        setTimeout(() => {
            setInvisibleButtonsState(true);
        }, 300);
    }
    const onVisualPass = () => {
        const inputType = inputRefPass.current.type;
        inputRefPass.current.type = (inputType === 'password') ? 'text' : 'password';
    }

    const createPassworld = () => {
        setConnect(true);  // Activamos testeo de red, si no hay conexión se mostrará el modal de error
        // validamos que los campos no estén vacíos
        if (!inputRef.current.value || !inputRefPass.current.value) {
            toast.error(MESSAGE_ES.display.fieldsmandatory, { position: 'bottom-center', duration: 2000, });
            (!inputRef.current.value) ? inputRef.current.focus() : inputRefPass.current.focus();
            return;
        }
        if (activeAccept.current) {
            return;
        }
        activeAccept.current = true;
        const RANDOM_NAME = randomPhrase(6);
        updatePasswords([{
            name: inputRef.current.value,
            password: inputRefPass.current.value,
            namekey: `${inputRef.current.value}-${RANDOM_NAME}`,
            block: false  // Nueva password siempre empieza desbloqueada
        }]);
        toast.success(MESSAGE_ES.display.createdok, { position: 'bottom-center', duration: 2000, });
        
        // Sincronizar con Drive después de crear password
        setTimeout(() => {
            syncPasswordsToDrive();
        }, 500);
        
        setTimeout(() => {
            clearFocus();
        }, 200);
        setTimeout(() => {
            activeAccept.current = false;
        }, 1000);
    }
    const onEnterKey = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            createPassworld();
        }
    }
    const randomAction = () => {
        inputRefPass.current.focus();
        const randomPassword = generatePassword(18);
        inputRefPass.current.value = randomPassword;
    }
    // [RENDER]
    return (
        <div className="w-full h-full flex flex-col justify-start items-start border-left-blue border-bottom-blue">
            <header className='flex justify-start items-start w-full h-6 gap-1'>
                <span onClick={onInputEnter} className='flex text-start justify-start items-center h-6 w-28 text-white font-barlow-bold text-lg bg-lightblue p-1 rounded-e-sm no-select'>
                    {MESSAGE_ES.input.title}
                </span>
                <div className={`flex justify-end items-center gap-1 w-full h-max transition-opacity duration-200 ${(createPassword) ? 'opacity-100' : 'opacity-0'} ${invisibleButtonsState ? 'invisible' : ''}`}>
                    <span onClick={clearFocus} className='flex text-center justify-start items-center h-6 w-20 text-white font-barlow-bold text-lg bg-red p-1 rounded-e-sm no-select cursor-pointer'>
                        {MESSAGE_ES.buttons.cancel}
                    </span>
                    <span onClick={createPassworld} className='flex text-center justify-start items-center h-6 w-20 text-white font-barlow-bold text-lg bg-yellow p-1 rounded-e-sm no-select cursor-pointer'>
                        {MESSAGE_ES.buttons.accept}
                    </span>
                </div>
            </header>
            <div id='containerInputs' className='w-full h-full flex flex-col justify-start items-start gap-2 pl-2 pr-2 pt-1'>
                <input ref={inputRef}
                    className={`input-codepass w-full text-white text-lg `} type="text"
                    autoComplete="off"
                    placeholder={placeholderState}
                    onFocus={activeFocus}
                    onKeyDown={onEnterKey}
                    name={generateNameRandom()}
                />
                <div onFocus={activeFocus} className={`flex justify-start items-center w-full h-full gap-2 transition-opacity duration-200 ${(createPassword) ? 'opacity-100' : 'opacity-0'} ${invisibleButtonsState ? 'invisible' : ''}`}>
                    <input
                        ref={inputRefPass}
                        onKeyDown={onEnterKey}
                        className={`input-codepass w-full text-white text-lg`} type="password"
                        placeholder={MESSAGE_ES.input.placeholder4}
                        name={generateNameRandom()}
                    />
                    <div className='flex-center h-7 w-7'>
                        <IconRandom action={randomAction} className="h-7 w-7 white-1" />
                    </div>
                    <div className='flex-center h-7 w-7'>
                        <IconEye action={onVisualPass} className="h-6 w-6 text-gray-600" />
                    </div>
                </div>
            </div>
        </div>
    );
};
InputCodepass.propTypes = {
    onFocus: PropTypes.func,
};

export { InputCodepass };
