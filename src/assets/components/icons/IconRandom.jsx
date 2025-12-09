import PropTypes from 'prop-types';
const IconRandom = ({ color, className, action }) => {
    const actualColor = (color) ? color : 'currentColor';
    const CLASSNAME = (className) ? className : '';
    const ACTION = (action) ? action : () => { };
    return (
        <svg onClick={ACTION} viewBox="0 0 48 48" fill={actualColor} className={`cursor-pointer scale-90 ${CLASSNAME}`}>
            <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.5 5.5h29c2.216 0 4 1.784 4 4v29c0 2.216-1.784 4-4 4h-29c-2.216 0-4-1.784-4-4v-29c0-2.216 1.784-4 4-4"
            ></path>
            <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.852 13.644a4.213 4.213 0 1 1-8.426 0a4.213 4.213 0 0 1 8.426 0m12.296 20.712a4.213 4.213 0 0 1 4.213-4.213h0a4.213 4.213 0 1 1-4.213 4.213M19.787 24A4.213 4.213 0 0 1 24 19.787h0A4.213 4.213 0 0 1 28.213 24h0A4.213 4.213 0 0 1 24 28.213h0A4.213 4.213 0 0 1 19.787 24"
            ></path>
        </svg>
    );
};
IconRandom.propTypes = {
    color: PropTypes.string,
    className: PropTypes.string,
    action: PropTypes.func,
};
export { IconRandom };