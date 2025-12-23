/**
 * @component Componente <LogoCodepass/> que muestra el Logo Codepass
 * @example simplemente se llama al componente: <LogoCodepass /> 
 * @returns {JSX.Element} Un elemento JSX(div) conteniendo el Logotipo CodePass
*/

//import { useLogin } from '@hooks/useLogin';
//import { useCodePass } from '@hooks/useCodePassData';
import PropTypes from 'prop-types';

const LogoCodepass = ({ action }) => {
    const ON_ACTION = action || (() => { });
    // [HOOKS]
    //const [loginState] = useLogin();
    //const [dataCodePass] = useCodePass();


    const ACTION_TEST_DEV = () => {
        //console.log('[CODEPASS - log]: Dev');
        //console.log('LOGINSTATE: ', loginState);
        //console.log('DATACODEPASS: ', dataCodePass);
        ON_ACTION();
    }

    return (
        <div onClick={ACTION_TEST_DEV} className='relative w-70p h-full'>
            <div className='h-14 w-14 bg-white top-2 left-3 rounded-full absolute z-10'></div>
            <img className='w-20 z-20 absolute' src="/img/codelabslogo.svg" alt="Codelabs Logo" />
            <span className='top-7 left-16 font-orbitron-normal text-3xl text-white absolute z-30 no-select'>odePass</span>
        </div>
    )

}
LogoCodepass.propTypes = {
    action: PropTypes.func,
};

export { LogoCodepass };