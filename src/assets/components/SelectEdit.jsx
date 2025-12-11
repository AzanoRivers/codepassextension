import { useState, useRef, useEffect } from "react"
import PropTypes from 'prop-types';
import { InputGeneric } from '@components/InputGeneric';
import { MESSAGE_ES } from '@utils/Message';
import { encryptWithPassphrase } from "@utils/EncodePayload.js";


export function SelectEdit({ cancel, confirm, dataName }) {
    // [STATES & REFS]
    const [inputEditPassValue, setInputEditPassValue] = useState([]);
    const [inputChanged, setInputChanged] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successPassword, setSuccessPassword] = useState(false);
    const inputRef = useRef(null);
    // [FUNCTIONS]
    const CANCEL_ACTION = cancel || (() => { /* //console.log('Cancelando...') */ });
    const CONFIRM_ACTION = confirm || (() => { /* //console.log('Confirmando...') */ });
    const handleEdit = () => {
        // Validamos que el input tenga valor valido
        if (inputChanged.length === 0) {
            setErrorMessage(MESSAGE_ES.toolspassword.enternew);
            inputRef.current.focus();
            return;
        } else {
            if (inputEditPassValue.length < 1) {
                setInputEditPassValue([...inputEditPassValue, inputChanged]);
                setInputChanged('');
                inputRef.current.focus();
            }
            if (inputEditPassValue.length >= 1) {
                setInputEditPassValue([...inputEditPassValue, inputChanged]);
                if (inputEditPassValue[0] !== inputChanged) {
                    setErrorMessage(MESSAGE_ES.toolspassword.notmatch);
                    setInputEditPassValue([]);
                }
                if (inputEditPassValue[0] === inputChanged) {
                    setSuccessPassword(true);
                    setErrorMessage('');
                    setInputEditPassValue([]);
                    const ASYNC_ENCRYPT = async () => {
                        const TEMPORAL_SESSION = await chrome.storage.local.get('temporalsesionpass');
                        const encryptedPassword = await encryptWithPassphrase(inputChanged, TEMPORAL_SESSION.temporalsesionpass);
                        CONFIRM_ACTION({ newPassword: encryptedPassword, namekey: dataName });
                        setTimeout(() => {
                            setSuccessPassword(false);
                        }, 1000);
                    };
                    ASYNC_ENCRYPT();
                }
                setInputChanged('');
            }
        }
    };
    const handleCancel = () => {
        CANCEL_ACTION();
    };
    const handleChange = (e) => {
        const VALUE = e.target.value;
        if (VALUE !== '') {
            setSuccessPassword(false);
            setErrorMessage('');
        }
        setInputChanged(VALUE);
    };
    // [EFFECTS]
    useEffect(() => {
        // Focus en carga
        if (inputRef.current) {
            inputRef.current.focus();
        }
        // Desmontaje
        return () => {
            setInputEditPassValue([]);
            setInputChanged('');
            setErrorMessage('');
            setSuccessPassword(false);
        };
    }, []);
    // [RENDER]
    return (
        <div className="min-w-64 w-64 h-full flex justify-start items-center flex-row p-1 relative">
            <div className='w-3/5 h-full pr-3'>
                <InputGeneric className={`w-full h-full max-h-10 text-sm ${errorMessage === '' ? (successPassword) ? 'text-white placeholder:text-green-400 font-bold' : 'text-white' : 'text-white font-bold placeholder:text-red-700'}`} type="password"
                    placeholder={(errorMessage !== '') ? errorMessage : (inputEditPassValue.length <= 0 ? (!successPassword) ? MESSAGE_ES.toolspassword.edit : MESSAGE_ES.toolspassword.success : MESSAGE_ES.toolspassword.repeat)}
                    value={inputChanged} ref={inputRef} onChange={handleChange} keydownaction={handleEdit}
                />
            </div>
            <div className='w-2/5 h-full pr-3 flex-center gap-1 absolute right-2 top-0'>
                <div className='w-1/2 h-full text-center text-white font-bold text-base pb-1 border-lightblue' onClick={handleEdit}>✓</div>
                <div className='w-1/2 h-full text-center text-white bg-red font-bold text-base pb-1 border-lightblue' onClick={handleCancel}>✖</div>
            </div>
        </div>
    );
}

SelectEdit.propTypes = {
    cancel: PropTypes.func,
    confirm: PropTypes.func,
    dataPss: PropTypes.string,
    dataName: PropTypes.string,
};
