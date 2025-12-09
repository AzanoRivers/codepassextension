/**
 * @component <ButtonGeneric />
 * @example <ButtonGeneric text="Aceptar" action={miFuncion} />
 * @description Botón reutilizable con texto y acción personalizable mediante props.
 * @description Si no se pasan props, muestra "OK" y lanza un warning al hacer clic.
 * @returns {JSX.Element} Un botón estilizado con funcionalidad genérica o definida.
*/
import PropTypes from 'prop-types';

function ButtonGeneric({ text, action, dark = true, light = false, className }) {

    const ACTION_BUTTON = () => {
        console.warn('Set the button action with the attribute (action={func})');
    };

    const ACTION = (action) ? action : ACTION_BUTTON;
    const THEME_MODE = (dark && !light) ? 'bg-darkblue70' : (light) ? 'bg-lightblue-50' : 'bg-default';

    const TEXT_BUTTOM = (text) ? text : 'OK';

    return (

        <button
            onClick={ACTION}
            className={`w-32 h-9 multi-border-button ${THEME_MODE} text-center white1 ${className}`}>
            {TEXT_BUTTOM}
        </button>

    )
}

ButtonGeneric.propTypes = {
    text: PropTypes.string,
    action: PropTypes.func,
    dark: PropTypes.bool,
    light: PropTypes.bool,
    className: PropTypes.string
};

export { ButtonGeneric }