/**
 * @component Componente <ModalGeneric/> que muestra el marco de un modal generico 
 * @example simplemente se llama al componente: <ModalGeneric /> 
 * @description Debe encapsular los componentes o componente {JSX.Elements} que se deseen mostrar en el modal
 * @description Es un frame generico que recibe propiedades de Height, Width, y los Childs que se mostraran 
 * @returns {JSX.Element} Un elemento JSX(div)
*/
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react'
import { ButtonGeneric } from '@components/ButtonGeneric'
//import { IconRobotX } from '@components/icons/IconRobotX'

const ModalGeneric = ({ show, mode, type, children, buttonText, action, overaction, className }) => {
    // [STATES]
    const [showModal, setShowModal] = useState(show);
    const [showContent, setShowContent] = useState(false);
    const [bigSizeContent, setBigSizeContent] = useState(false);
    // [EFFECTS]
    useEffect(() => {
        if (show) {
            setTimeout(() => {
                setBigSizeContent(true);
            }, 200);

            document.startViewTransition(() => {
                setShowModal(true);
                setTimeout(() => {
                    setShowContent(true);
                }, 500);
            });
        } else {
            setBigSizeContent(false);
            document.startViewTransition(() => {
                setShowContent(false);
                setShowModal(false);
            });
        }

    }, [show]);
    // [FUNCIONTS]
    const actionButton = () => {
        if (action) {
            action();
        } else {
            console.log('No action defined in ModalGeneric');
        }
    };
    const actionOverBack = (event) => {
        const CLASS_ELEMENT = event?.target?.className || '';
        if (event?.target.nodeName === 'DIV' && CLASS_ELEMENT?.includes('overbackmodal')) {
            if (overaction) {
                overaction();
            } else {
                console.log('Overaction No action defined in ModalGeneric');
            }
        }
    }

    // [DEFINITIONS]
    const VISIBILITY = (showModal) ? 'visible' : 'hidden',
        NODE_CONTENT = (children) ? children : <h2>GENERIC MODAL</h2>,
        BTN_INFO = (buttonText) ? buttonText : 'OK',
        CENTER_ABSOLUTE = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
        MODE = {
            'small': 'w-3/5 h-1/2',
            'middle': 'w-3/4 h-3/4',
            'large': 'w-11/12 h-95',
        },
        TYPE = {
            'info': 'border-action',
            'error': 'border-error',
            'warn': 'border-warn',
            'success': 'border-success',
        };
    const INIT_W_H = 'w-14 h-14';
    const OVER_BACK = `${VISIBILITY} overbackmodal h-full w-full bg-black bg-opacity-50 fixed top-0 left-0 z-50`;
    const GENERIC_CLASS = `flex flex-col justify-between items-center generic-shadow bg-modal text-white p-3`;

    return (
        <div className={OVER_BACK} onClick={actionOverBack}>
            <div className={`${CENTER_ABSOLUTE} ${(!bigSizeContent) ? INIT_W_H : MODE[mode]} ${TYPE[type]} ${GENERIC_CLASS} transition-all duration-200 ${className || ''}`}>
                <div className={`h-full w-full overflow-auto scrollbar ${(showContent) ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
                    {NODE_CONTENT}
                </div>
                <div className={`h-10p w-full flex-center ${(showContent) ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
                    <ButtonGeneric action={actionButton} text={BTN_INFO} />
                </div>
            </div>
        </div>
    )

}

ModalGeneric.propTypes = {
    mode: PropTypes.string,
    type: PropTypes.string,
    children: PropTypes.node,
    buttonText: PropTypes.string,
    show: PropTypes.bool,
    action: PropTypes.func,
    overaction: PropTypes.func,
    className: PropTypes.string,
};

export { ModalGeneric };