import { IconLock } from "@icons/IconLock";
import { MESSAGE_ES } from "@utils/Message";
import { useModalLock } from '@hooks/useModalLock';

const BlockPasswordBox = () => {
    const { toggleModalLock, showModalLock } = useModalLock();
    const handleBlock = () => {
        if (!showModalLock) {
            toggleModalLock();
        }
    };
    return (
        <>
            <IconLock action={handleBlock} className='text-white w-24 h-24' />
            <span className="font-orbitron-normal text-2xl text-white no-select">{MESSAGE_ES.display.blockboxpassword}</span>
            <span className="font-orbitron-normal text-sm text-white mt-1 text-center no-select">{MESSAGE_ES.display.blockboxpassword2}</span>
        </>
    );
};

export { BlockPasswordBox };