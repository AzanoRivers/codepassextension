import { IconRobotWh } from "@icons/IconRobotWh";
import { MESSAGE_ES } from "@utils/Message";
const EmptyPasswordBox = () => {

    return (
        <>
            <IconRobotWh className='text-white w-32 h-32' />
            <span className="font-orbitron-normal text-2xl text-white no-select">{MESSAGE_ES.display.emptyboxpassword}</span>
            <span className="font-orbitron-normal text-sm text-white mt-1 text-center no-select">{MESSAGE_ES.display.emptyboxpassword2}</span>
        </>
    );
};

export { EmptyPasswordBox };