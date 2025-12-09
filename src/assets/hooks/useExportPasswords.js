/**
 * @hook useExportPasswords
 * @description Hook para exportar contraseñas a archivo .txt en formato de importación.
 * Soporta exportación con y sin protección de frase de bloqueo.
 * 
 * @returns {Object} Funciones y estados para exportar passwords
 * @returns {Function} exportWithBlockPasswords - Exporta passwords validando la frase de bloqueo
 * @returns {Function} exportWithoutBlockPasswords - Exporta passwords sin protección (descifradas)
 * @returns {boolean} isLoadingExport - Estado de carga durante la exportación
 * 
 * Flujo con bloqueo:
 * 1. Valida que existan passwords y frase de bloqueo configurada
 * 2. Verifica la frase de bloqueo del usuario
 * 3. Exporta las passwords en formato cifrado
 * 
 * Flujo sin bloqueo:
 * 1. Valida que existan passwords
 * 2. Descifra passwords si están cifradas (usando temporalsesionpass)
 * 3. Exporta las passwords en texto plano
 * 
 * El archivo generado incluye timestamp en el nombre: codepass_export_YYYYMMDDTHHMMSS.txt
 */

import { useContext, useState } from 'react';
import { CodePassContext } from '@contexts/CodepassContext';
import { MESSAGE_ES } from '@utils/Message';
import { decryptWithPassphrase, encryptWithPassphrase } from "@utils/EncodePayload.js";
import { TRANSFORM_DATA_TO_ENCODED } from '@utils/transformDataToPasswords.js';
import { createFile } from '@utils/createFile.js';
import toast from 'react-hot-toast';

const useExportPasswords = () => {
    // [STATES - CONTEXT]
    const [isLoadingExport, setIsLoadingExport] = useState(false);
    const context = useContext(CodePassContext);
    const { dataCodePass } = context;
    // [FUNCTIONS]
    const exportWithBlockPasswords = ({ blockPhrase }) => {
        setIsLoadingExport(true);
        if (isLoadingExport) {
            return;
        }
        if (dataCodePass.datapasswords.length < 1) {
            toast.error(MESSAGE_ES.modalport.errornopasswords, { position: 'bottom-center', duration: 3000 });
            okButton();
            return;
        }
        if (dataCodePass.passblock === '' || !dataCodePass.passblock) {
            toast.error(MESSAGE_ES.modalport.errornoblockpass, { position: 'bottom-center', duration: 3000 });
            okButton();
            return;
        }
        const GO_TO_VALIDATE = async ({ phrase }) => {
            try {
                const DATA_BLOCKPASS_DECODED = await decryptWithPassphrase(dataCodePass.passblock, phrase);
                if (DATA_BLOCKPASS_DECODED !== phrase) {
                    toast.error(MESSAGE_ES.errorunexpected, { position: 'bottom-center', duration: 3000 });
                    return;
                }
                // console.log('ExportWithBlock');
                // 1. Obtener temporalsesionpass del storage
                const datatemporalsesion = await chrome.storage.local.get('temporalsesionpass');
                if (!datatemporalsesion.temporalsesionpass) {
                    toast.error(MESSAGE_ES.errorunexpected, { position: 'bottom-center', duration: 3000 });
                    return;
                }
                // 2. Descifrar todas las passwords con temporalsesionpass
                let passwordsDecrypted = [];
                for (let i = 0; i < dataCodePass.datapasswords.length; i++) {
                    const pwdItem = dataCodePass.datapasswords[i];
                    const decryptedPassword = await decryptWithPassphrase(pwdItem.password, datatemporalsesion.temporalsesionpass);
                    passwordsDecrypted.push({ ...pwdItem, password: decryptedPassword });
                }
                // 3. Convertir el array a string en formato de exportación
                const PASSWORDS_STRING = TRANSFORM_DATA_TO_ENCODED(passwordsDecrypted);
                // 4. Cifrar todo el string con la blockPhrase del usuario
                const ENCRYPTED_DATA = await encryptWithPassphrase(PASSWORDS_STRING, phrase);
                // 5. Crear archivo con la data cifrada
                const DAY = new Date().toISOString().split('.')[0].replaceAll('-', '').replaceAll('_', '');
                const FINAL_CONTENT = `<<<cpbh5:${ENCRYPTED_DATA}>>>`;
                const fileCreated = createFile({ filename: `codepass_export_${DAY}_blocked.txt`, content: FINAL_CONTENT });
                if (fileCreated) {
                    toast.success(MESSAGE_ES.modalport.successexport, { position: 'bottom-center', duration: 3000 });
                } else {
                    toast.error(MESSAGE_ES.modalport.exporterror, { position: 'bottom-center', duration: 3000 });
                }
            } catch (error) {
                console.error('Error en exportWithBlock:', error);
                toast.error(MESSAGE_ES.modalblock.errorunblock, { position: 'bottom-center', duration: 3000 });
            } finally {
                okButton();
            }
        }
        GO_TO_VALIDATE({ phrase: blockPhrase });
    }
    const exportWithoutBlockPasswords = () => {
        setIsLoadingExport(true);
        if (isLoadingExport) {
            return;
        }
        if (dataCodePass.datapasswords.length < 1) {
            toast.error(MESSAGE_ES.modalport.errornopasswords, { position: 'bottom-center', duration: 3000 });
            okButton();
            return;
        } else {
            // console.log('ExportWithoutBlock');
            const goToCreateFileAsync = async () => {
                let passwordsDecrypted = [];
                const datatemporalsesion = await chrome.storage.local.get('temporalsesionpass');
                const blockdatapass = await chrome.storage.local.get('blockdatapass');
                if (datatemporalsesion.temporalsesionpass && blockdatapass.blockdatapass) {
                    for (let i = 0; i < dataCodePass.datapasswords.length; i++) {
                        const pwdItem = dataCodePass.datapasswords[i];
                        const decryptedPassword = await decryptWithPassphrase(pwdItem.password, datatemporalsesion.temporalsesionpass);
                        passwordsDecrypted.push({ ...pwdItem, password: decryptedPassword });
                    }
                } else {
                    passwordsDecrypted = dataCodePass.datapasswords;
                }
                const DAY = new Date().toISOString().split('.')[0].replaceAll('-', '').replaceAll('_', '');
                const PASSWORDS_ENCODED = TRANSFORM_DATA_TO_ENCODED(passwordsDecrypted);
                const fileCreated = createFile({ filename: `codepass_export_${DAY}.txt`, content: PASSWORDS_ENCODED });
                if (fileCreated) {
                    toast.success(MESSAGE_ES.modalport.successexport, { position: 'bottom-center', duration: 3000 });
                } else {
                    toast.error(MESSAGE_ES.modalport.exporterror, { position: 'bottom-center', duration: 3000 });
                }
                okButton();
            }
            goToCreateFileAsync();
        }
    }
    const okButton = () => {
        setIsLoadingExport(false);
    }
    // [RETURN HOOKS]
    return { exportWithBlockPasswords, exportWithoutBlockPasswords, isLoadingExport };
}

export { useExportPasswords };