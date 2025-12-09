import PropTypes from 'prop-types';
const IconMenuPoints = ({ className, action }) => {
    const CLASSNAME = (className) ? className : '';
    const ACTION = (action) ? action : () => { };
    return (
        <svg viewBox="0 0 24 24" onClick={ACTION} className={`cursor-pointer ${CLASSNAME}`}>
            <path fill="currentColor" d="M7 12a2 2 0 1 1-4 0a2 2 0 0 1 4 0m7 0a2 2 0 1 1-4 0a2 2 0 0 1 4 0m7 0a2 2 0 1 1-4 0a2 2 0 0 1 4 0"></path>
        </svg>
    );
};

IconMenuPoints.propTypes = {
    className: PropTypes.string,
    action: PropTypes.func,
};

export { IconMenuPoints };