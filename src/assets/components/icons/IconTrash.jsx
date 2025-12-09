import PropTypes from 'prop-types';
const IconTrash = ({ color, className, action }) => {
    const actualColor = (color) ? color : 'currentColor';
    const CLASSNAME = (className) ? className : '';
    const ACTION = (action) ? action : () => { };
    return (
        <svg onClick={ACTION} viewBox="0 0 24 24" fill={actualColor} className={`cursor-pointer scale-y-90 ${CLASSNAME}`}>
            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6"></path>
        </svg>
    );
};

IconTrash.propTypes = {
    color: PropTypes.string,
    className: PropTypes.string,
    action: PropTypes.func,
};

export { IconTrash };
