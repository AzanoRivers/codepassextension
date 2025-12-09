/**
 * @hook useSyncDrive
 * @description Hook para sincronizar automáticamente las passwords con Google Drive.
 * Se encarga de cifrar las passwords con la masterKey y subirlas al Drive.
 * 
 * @returns {Object} Funciones para sincronización
 * @returns {Function} syncPasswordsToDrive - Sincroniza passwords al Drive
 * @returns {boolean} isSyncing - Estado de sincronización en progreso
 * 
 * Flujo de sincronización:
 * 1. Obtiene masterKey del storage local
 * 2. Descifra passwords actuales con temporalsesionpass
 * 3. Convierte a formato de exportación
 * 4. Cifra con masterKey (usando misma lógica que exportación)
 * 5. Sube a Drive en formato <<<cpbh5:ENCRYPTED_DATA>>>
 */

import { useState, useCallback } from 'react';
import { decryptWithPassphrase, encryptWithPassphrase, deriveMasterKey } from '@utils/EncodePayload';
import { TRANSFORM_DATA_TO_ENCODED } from '@utils/transformDataToPasswords';

const useSyncDrive = () => {
    const [isSyncing, setIsSyncing] = useState(false);

    /**
     * Sincroniza las passwords al Google Drive
     * @returns {Promise<boolean>} true si la sincronización fue exitosa
     */
    const syncPasswordsToDrive = useCallback(async () => {
        if (isSyncing) {
            // console.log('Sincronización ya en progreso');
            return false;
        }

        try {
            setIsSyncing(true);

            // Leer passwords directamente desde storage (más confiable que el contexto)
            const { codepassdata } = await chrome.storage.local.get('codepassdata');
            const currentPasswords = codepassdata || [];

            // Verificar que hay passwords para sincronizar
            if (currentPasswords.length === 0) {
                // console.log('No hay passwords para sincronizar');
                setIsSyncing(false);
                return false;
            }

            // Verificar si hay blockpass configurado
            const { temporalsesionpass, blockdatapass } = await chrome.storage.local.get(['temporalsesionpass', 'blockdatapass']);

            let FINAL_CONTENT;

            // Si no hay temporalsesionpass ni blockdatapass, significa que no hay blockpass configurado
            // Sincronizar en formato plano (sin cifrar)
            if (!temporalsesionpass || !blockdatapass) {
                // console.log('Sin blockpass configurado - sincronizando en formato plano');
                
                // Las passwords desde storage ya están en formato plano cuando no hay blockpass
                const PASSWORDS_STRING = TRANSFORM_DATA_TO_ENCODED(currentPasswords);
                FINAL_CONTENT = PASSWORDS_STRING;
            } else {
                // Hay blockpass configurado - sincronizar cifrado
                // console.log('Con blockpass configurado - sincronizando cifrado');

                // 1. Descifrar todas las passwords con temporalsesionpass
                let passwordsDecrypted = [];
                for (const pwdItem of currentPasswords) {
                    const decryptedPassword = await decryptWithPassphrase(pwdItem.password, temporalsesionpass);
                    passwordsDecrypted.push({ ...pwdItem, password: decryptedPassword });
                }

                // 2. Convertir a formato de exportación
                const PASSWORDS_STRING = TRANSFORM_DATA_TO_ENCODED(passwordsDecrypted);

                // 3. Obtener masterKey (SIN timeToken) desde storage o derivarla
                let masterKey;
                const { masterkey } = await chrome.storage.local.get('masterkey');
                
                if (masterkey) {
                    // console.log('Usando masterKey desde storage');
                    masterKey = masterkey;
                } else {
                    // console.log('Derivando masterKey desde blockdatapass');
                    // Descifrar blockdatapass para obtener el blockPhrase original
                    const blockPhrase = await decryptWithPassphrase(blockdatapass, blockdatapass);
                    masterKey = await deriveMasterKey(blockPhrase);
                    // Guardar para próximas sincronizaciones en esta sesión
                    chrome.storage.local.set({ 'masterkey': masterKey });
                }

                // 4. Cifrar con masterKey
                const ENCRYPTED_DATA = await encryptWithPassphrase(PASSWORDS_STRING, masterKey);

                // 5. Formato final con marcadores
                FINAL_CONTENT = `<<<cpbh5:${ENCRYPTED_DATA}>>>`;
            }

            // 5. Enviar a Drive
            if (chrome?.runtime) {
                return new Promise((resolve) => {
                    chrome.runtime.sendMessage(
                        { 
                            action: "update_drive_file",
                            content: FINAL_CONTENT
                        },
                        (response) => {
                            if (chrome.runtime.lastError) {
                                console.error('Error en chrome.runtime:', chrome.runtime.lastError);
                                setIsSyncing(false);
                                resolve(false);
                                return;
                            }

                            if (response?.success) {
                                // console.log('Passwords sincronizadas con Drive exitosamente');
                                setIsSyncing(false);
                                resolve(true);
                            } else {
                                console.error('Error sincronizando con Drive:', response?.error);
                                setIsSyncing(false);
                                resolve(false);
                            }
                        }
                    );
                });
            } else {
                console.error('Chrome runtime no disponible');
                setIsSyncing(false);
                return false;
            }

        } catch (error) {
            console.error('Error en sincronización con Drive:', error);
            setIsSyncing(false);
            return false;
        }
    }, [isSyncing]);

    return {
        syncPasswordsToDrive,
        isSyncing
    };
};

export { useSyncDrive };
