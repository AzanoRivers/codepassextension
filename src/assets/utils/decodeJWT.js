/**
 * Utilidad que retorna la información del JWT decodificada
 *
 * @function decodeJWT
 * @description Ingresa la data codigicada 
 * @param {string} token - El token JWT codificado en base 64
 * @returns {Object} - Los datos del JWT
 */
function decodeJWT(jwtdata) {
    try {
        const [HEADER, PAYLOAD, SIGNATURE] = jwtdata.credential.split('.');
        const DATA_USER = {
            HEADER,
            payload: JSON.parse(atob(PAYLOAD)),
            SIGNATURE
        };
        return DATA_USER;
    } catch (error) {
        //console.error('Error al decodificar el JWT:', error);
        return false;
    }
}

export { decodeJWT };