import PropTypes from 'prop-types';
const IconSearch = ({ color, className, action }) => {
    const actualColor = (color) ? color : 'currentColor';
    const CLASSNAME = (className) ? className : '';
    const ACTION = (action) ? action : () => { };
    return (
        <svg onClick={ACTION} viewBox="0 0 24 24" fill={actualColor} className={`cursor-pointer scale-95 ${CLASSNAME}`}>
            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21l-4.3-4.3"></path>
            </g>
        </svg>
    )
};

IconSearch.propTypes = {
    color: PropTypes.string,
    className: PropTypes.string,
    action: PropTypes.func,
};

export { IconSearch };