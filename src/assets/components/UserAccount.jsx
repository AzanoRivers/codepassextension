
import { useState } from 'react';
import { IconRobotN } from '@icons/IconRobotN';
import { ButtonBlock } from '@components/ButtonBlock';
import { LogoutButton } from '@components/LogoutButton'
import { MESSAGE_ES } from '@utils/Message';

const UserAccount = () => {
    // [STATES]
    const [inModal, setInModal] = useState(false);
    const [showBtn, setShowBtn] = useState(inModal);
    const [optionsVisibility, setOptionsVisibility] = useState(false);
    // [FUNCTIONS]
    const mouseEnterLeave = (event) => {
        const NAME_EVENT = event.type.toLowerCase();
        const TARGET_ID = event.target.id;
        if (NAME_EVENT === 'mouseenter' || NAME_EVENT === 'click') {
            if (TARGET_ID === 'containerAccount' || NAME_EVENT === 'click') {
                setOptionsVisibility(true); setInModal(true);
                setTimeout(() => {
                    setShowBtn(true)
                }, 120);
            }
        }
        if (NAME_EVENT === 'mouseleave') {
            setInModal(false);
            setShowBtn(false)
            setTimeout(() => {
                setOptionsVisibility(false)
            }, 120);
        }
    };

    const CLASS_CONTAINER = 'flex justify-evenly items-center flex-col transition-opacity duration-100 absolute top-[15%] w-28 h-20 max-h-20 border-action generic-shadow bg-modal-90 text-white';

    return (
        <div id='containerAccount' onMouseEnter={mouseEnterLeave} onMouseLeave={mouseEnterLeave} onClick={mouseEnterLeave}
            className='relative flex flex-col items-center justify-center w-30p h-auto  cursor-pointer'>
            <IconRobotN color="#FFF" />
            <span className='text-white font-barlownormal no-select text-base'>{MESSAGE_ES.account}</span>
            <div className={`${optionsVisibility ? 'block' : 'hidden'} ${CLASS_CONTAINER} h-full w-full gap-1 ${inModal ? 'opacity-100' : 'opacity-0'}`}>
                {showBtn && <ButtonBlock />}
                {showBtn && <LogoutButton />}
            </div>
        </div>
    )
}

export { UserAccount }