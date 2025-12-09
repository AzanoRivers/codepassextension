import randomPhrase from '@utils/randomPhrase';
import { decryptDirectly } from "@utils/EncodePayload.js";
export const TRANSFORM_DATA_TO_PASSWORDS = (data) => {
    if (!data || data === '' || typeof data !== 'string' || !data.includes('<---BEGIN--->CODEPASSEXTENSION<---BEGIN--->')) {
        return [];
    }
    let dataPass = [];
    try {
        const FIRST_SPLIT = data.replace('<---BEGIN--->CODEPASSEXTENSION<---BEGIN--->', '').replace('<---END--->CODEPASSEXTENSION<---END--->', '').split(':::@@@').join('').split('@@@:::');
        for (let index = 0; index < FIRST_SPLIT.length; index++) {
            if (FIRST_SPLIT[index] === "") {
                continue;
            }
            const RANDOM_NAME = randomPhrase(6);
            dataPass.push({ name: FIRST_SPLIT[index].split('@@-@@')[0], password: FIRST_SPLIT[index].split('@@-@@')[1], namekey: `${FIRST_SPLIT[index].split('@@-@@')[0]}-${RANDOM_NAME}` });
        }
    } catch (error) {
        dataPass = 'ERROR RECUPERANDO DATOS';
    }
    return dataPass;
};

export const TRANSFORM_DATA_TO_ENCODED = (dataPasswords = []) => {
    if (dataPasswords.length < 1) {
        return '';
    }
    let dataEncoded = '<---BEGIN--->CODEPASSEXTENSION<---BEGIN--->';
    dataPasswords.forEach((item, index) => {
        dataEncoded += `@@@:::${item.name}@@-@@${item.password}:::`;
        // Agregar separador entre passwords (excepto después de la última)
        if (index < dataPasswords.length - 1) {
            dataEncoded += '@@@';
        }
    });
    // Agregar cierre final
    dataEncoded += '@@@<---END--->CODEPASSEXTENSION<---END--->';
    return dataEncoded;
};

// Función que recibe 2 parametros, el string códigificado dentro de <<<cpbh5: y >>>, y la passphrase para descifrarlo, la passphrase debe primero pasar por deriveMasterKey y luego usar la masterkey resultante para descifrar
export const TRANSFORM_ENCODED_TO_DATA = async ({ encodedData = '', passphrase = '' }) => {
    if (encodedData === '' || passphrase === '') {
        return [];
    }
    try {
        // quitamos el <<<cpbh5: y >>> del string
        const cleanedEncodedData = encodedData.replace('<<<cpbh5:', '').replace('>>>', '');
        const DECRYPTED_STRING = await decryptDirectly({payloadBase64: cleanedEncodedData, passphrase});
        return DECRYPTED_STRING;
    } catch (error) {
        return [];
    }
};