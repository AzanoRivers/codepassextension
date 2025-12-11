//import { useState } from "react"
import { useToolsPassword } from "@hooks/useToolsPassword";
import PropTypes from 'prop-types';
import { MESSAGE_ES } from '@utils/Message';

export function SelectConfirmation({ cancel, confirm }) {
    const { deletePassword } = useToolsPassword();
    const CANCEL_ACTION = cancel || (() => { /* //console.log('Cancelando...') */ });
    const CONFIRM_ACTION = confirm || (() => { /* //console.log('Confirmando...') */ });

    const handleDelete = (event) => {
        CONFIRM_ACTION();
        deletePassword(event);
    };

    const handleCancel = () => {
        CANCEL_ACTION();
    }

    return (
        <div className="w-60 h-full flex-center flex-row gap-2">
            <span className="w-16 text-white font-barlownormal text-base w-">{MESSAGE_ES.display.eliminar}</span>
            <button className="w-16 h-full font-barlownormal text-sm bg-red text-white rounded-sm border-lightblue" onClick={handleDelete}>{MESSAGE_ES.display.borrar}</button>
            <button className="w-16 h-full font-barlownormal text-sm border-lightblue text-white" onClick={handleCancel}>{MESSAGE_ES.display.cancel}</button>
        </div>
    )
}

SelectConfirmation.propTypes = {
    cancel: PropTypes.func,
    confirm: PropTypes.func,
};
