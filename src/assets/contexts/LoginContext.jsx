/**
 * Context que gestiona el estado de login.
 * TRUE === LOGUEADO,  FALSE === NO LOGUEADO
 * @function LoginContext
 * @description Este context gestiona el estado de login para el componente de Google <LoginGoogle/>
  * @param {React.Provider}  - Provider que envuelve {children} para poder usar contexto
 * @returns {React.Context} - Un array con el estado de login y una función para actualizar el estado.
 */

import { createContext, useState } from 'react';
import PropTypes from 'prop-types';

const LoginContext = createContext();

const LoginProvider = ({ children }) => {

    const [loginState, setLoginState] = useState(false);

    return (
        <LoginContext.Provider value={{ loginState, setLoginState }}>
            {children}
        </LoginContext.Provider>
    );


}

// Validación de tipos para las propiedades
LoginProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export { LoginProvider, LoginContext }