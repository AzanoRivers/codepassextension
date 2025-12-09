import { useState, useRef, useEffect } from "react"
import { IconLock } from "@icons/IconLock";
import { InputGeneric } from "@components/InputGeneric";
import { MESSAGE_ES } from '@utils/Message';
import PropTypes from 'prop-types';

export function SelectBlock({ action }) {
    // [STATES & REFS]
    const [unBlock, setUnBlock] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);
    // [FUNCTIONS]
    const handleAction = () => {
        if (!unBlock) {
            setUnBlock(true);
            return;
        }
    };
    const handleEnterPress = () => {
        const NAME_KEY = inputRef.current?.closest("[data-name]")?.getAttribute("data-name");
        if (inputValue === '' || !NAME_KEY) {
            return;
        }
        action({ namePass: NAME_KEY, passInput: inputValue });
    };
    const handleMouseLeave = () => {
        setUnBlock(false);
        setInputValue('');
    };
    // [EFFECTS]
    useEffect(() => {
        if (unBlock) {
            inputRef.current.focus();
        }
    }, [unBlock]);
    // [RENDER]
    return (
        <div onMouseLeave={handleMouseLeave} className="flex flex-row justify-start items-center w-full h-full relative">
            <IconLock action={handleAction} className="h-8 w-8 text-white hover:scale-[80%] transition-transform duration-200" />
            {(!unBlock)
                ?
                <span onClick={handleAction} className="font-barlownormal text-xl white-1 select-none min-w-[180px] max-w-[230px] text-center">
                    {MESSAGE_ES.display.blockboxpassword}
                </span>
                : <>
                    <InputGeneric value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                        ref={inputRef} className="min-w-[180px] max-w-[230px] text-white" placeholder={MESSAGE_ES.display.unblockpassinput}
                        type="password" keydownaction={handleEnterPress}
                    />
                    <span className="text-white font-bold text-2xl absolute right-0 top-0">↵</span>
                </>

            }
        </div>
    );
}

SelectBlock.propTypes = {
    action: PropTypes.func,
};