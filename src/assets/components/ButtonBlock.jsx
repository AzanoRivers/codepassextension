import { MESSAGE_ES } from '@utils/Message';
import { useModalLock } from '@hooks/useModalLock';


export function ButtonBlock() {
    // [STATES]
    const { toggleModalLock,  } = useModalLock();
    // [FUNCTIONS]
    const handleClick = () => {
        toggleModalLock();
    };
    
    return (<>
        <span
            className="h-max w-full text-center font-orbitron-normal text-lg no-select hover:font-bold"
            onClick={handleClick}>{MESSAGE_ES.display.accountinfo1}
        </span>
    </>

    );
}