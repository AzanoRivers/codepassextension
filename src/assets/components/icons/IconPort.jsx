import PropTypes from 'prop-types';
const IconPort = ({ color, className, action }) => {
    const actualColor = (color) ? color : 'currentColor';
    const CLASSNAME = (className) ? className : '';
    const ACTION = (action) ? action : () => { };
    return (
        <svg onClick={ACTION} viewBox="0 0 24 24" fill={actualColor} className={`cursor-pointer ${CLASSNAME}`}>
            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m12 21l-8-4.5v-9L12 3l8 4.5V12m-8 0l8-4.5M12 12v9m0-9L4 7.5M15 18h7m-3-3l3 3l-3 3">
            </path>
        </svg>
    );
};

IconPort.propTypes = {
    color: PropTypes.string,
    className: PropTypes.string,
    action: PropTypes.func,
};

export { IconPort };