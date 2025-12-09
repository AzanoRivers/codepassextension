import PropTypes from 'prop-types';
import { useState, forwardRef, useEffect } from 'react';

const InputGeneric = forwardRef(({ placeholder = "Input Placeholder", value = "", onChange, keydownaction, type = "text", className = "" }, ref) => {
    const [inputValue, setInputValue] = useState(value);
    const KEYDOWN_ACTION = keydownaction || (() => { /* console.log('No action defined for Enter key'); */ });
    const CLASS_NAME = `input-codepass w-full h-10 text-base ${className}`;
    const generateNameRandom = () => {
        return `input-generic-${Math.random().toString(36).substring(2, 15)}`;
    }
    const handleChange = (e) => {
        setInputValue(e.target.value);
        if (onChange) onChange(e);
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            KEYDOWN_ACTION();
        }
    };
    // [useEffects]
    useEffect(() => {
        if (value !== inputValue) {
            setInputValue(value);
        }
    }, [value, inputValue]);
    return (
        <input
            ref={ref}
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            type={type}
            className={CLASS_NAME}
            placeholder={placeholder}
            name={generateNameRandom()}
        />
    );
});

InputGeneric.displayName = 'InputGeneric';

InputGeneric.propTypes = {
    placeholder: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    keydownaction: PropTypes.func,
    type: PropTypes.string,
    className: PropTypes.string,
};

export { InputGeneric };