/**
 * Hook personalizado para integrarse con la API de Google Drive mediante la extensión de Chrome.
 * 
 * Se conecta a Google Drive usando los tokens de autenticación almacenados para obtener datos de contraseñas
 * desde un archivo o carpeta específica. La comunicación con la API de Google Drive se maneja a través
 * del script background.js de la extensión mediante mensajería con chrome.runtime.
 * 
 * @returns {Object} Interfaz del hook
 * @returns {Function} tryGetDataGoogleDrive - Función para obtener datos desde Google Drive
 * @returns {string} dataFilePasswords - Datos de contraseñas obtenidos del archivo en Drive
 * @returns {boolean} isLoadingDataGoogle - Estado de carga durante las operaciones en Drive
*/
import { useCallback, useState, useContext } from "react";
import { CodePassContext } from '@contexts/CodepassContext';
import { TRANSFORM_DATA_TO_PASSWORDS, TRANSFORM_ENCODED_TO_DATA } from '@utils/transformDataToPasswords';
import { useLogin } from "@hooks/useLogin";
import { encryptWithPassphrase, go_to_encrypt, deriveMasterKey } from '@utils/EncodePayload';
import toast from "react-hot-toast";
import { MESSAGE_ES } from "@utils/Message";

const useDataDriveGoogle = () => {
    // [STATES]
    const [isLoadingDataGoogle, setIsLoadingDataGoogle] = useState(false);
    const [, setLogin] = useLogin();
    const { updateAllPasswords, setPassBlock, setBlockPasswords, setManualUnblockPass, setModalRequired, setOnDriveFile } = useContext(CodePassContext);
    // [FUNCTIONS]
    const tryGetDataGoogleDrive = useCallback(async (blockPhrase, onPermissionError) => {
        try {
            setIsLoadingDataGoogle(true);
            if (!chrome?.runtime) {
                throw new Error('Chrome runtime no disponible');
            }

            chrome.runtime.sendMessage(
                { action: "get_drive_files" },
                async (response) => {
                    try {
                        if (response?.error !== '' && !response.success) {
                            // Detectar error de permisos insuficientes
                            if (response.errorType === 'permissions' || response.error === 'INSUFFICIENT_PERMISSIONS') {
                                //console.error('Permisos insuficientes de Drive');
                                // Hacer logout automático
                                chrome.runtime.sendMessage({ action: "logout_google" }, () => {
                                    setLogin(false);
                                    // Llamar al callback de error si existe
                                    if (onPermissionError && typeof onPermissionError === 'function') {
                                        onPermissionError();
                                    }
                                });
                                setIsLoadingDataGoogle(false);
                                return;
                            }
                            //console.error('Error obteniendo datos de Drive:', response.error);
                            toast.error(MESSAGE_ES.errorunexpected, { position: 'bottom-center', duration: 3000 });
                            setIsLoadingDataGoogle(false);
                            return;
                        }

                        const fileContent = response.content || '';
                        
                        // Verificar si el archivo tiene passwords cifradas con blockPhrase
                        const hasCipheredData = fileContent.includes('<<<cpbh5:') && fileContent.includes('>>>');
                        
                        // Si hay datos cifrados pero NO hay blockPhrase, activar modal
                        if (hasCipheredData && !blockPhrase) {
                            //console.log('Archivo cifrado detectado - requiere blockPhrase');
                            chrome.storage.local.set({ 'temporaldrivecontent': fileContent });
                            
                            // Establecer onDriveFile primero
                            setOnDriveFile(true);
                            //console.log('setOnDriveFile(true) llamado');
                            
                            // Cambiar a página CodePass
                            setLogin(true);
                            //console.log('setLogin(true) llamado');
                            
                            // Activar modal con un pequeño delay
                            setTimeout(() => {
                                setModalRequired(true);
                                //console.log('setModalRequired(true) llamado');
                            }, 300);
                            
                            setIsLoadingDataGoogle(false);
                            return;
                        }
                        
                        if (hasCipheredData && blockPhrase) {
                            // Flujo similar a importación: descifrar con blockPhrase
                            const ENCRYPTED_DATA = fileContent.match(/<<<cpbh5:(.*?)>>>/)?.[1] || '';
                            
                            if (ENCRYPTED_DATA) {
                                // Descifrar con blockPhrase del usuario
                                const DECRYPTED_STRING = await TRANSFORM_ENCODED_TO_DATA({ 
                                    encodedData: `<<<cpbh5:${ENCRYPTED_DATA}>>>`, 
                                    passphrase: blockPhrase 
                                });

                                if (DECRYPTED_STRING?.error) {
                                    toast.error('Frase de bloqueo incorrecta', { position: 'bottom-center', duration: 3000 });
                                    setIsLoadingDataGoogle(false);
                                    return;
                                }

                                const PASSWORDS_ARRAY = TRANSFORM_DATA_TO_PASSWORDS(DECRYPTED_STRING);

                                // Cifrar blockpass con sí misma
                                const encryptedBlockPass = await encryptWithPassphrase(blockPhrase, blockPhrase);
                                setPassBlock(encryptedBlockPass);
                                chrome.storage.local.set({ 'blockdatapass': encryptedBlockPass });

                                // Establecer estados de bloqueo
                                setBlockPasswords(true);
                                setManualUnblockPass(false);
                                chrome.storage.local.set({ 'manualunblockpass': false });

                                // Derivar temporalsesionpass (CON timeToken - para cifrar passwords localmente)
                                const TIME_TOKEN = await chrome.storage.local.get('timeToken');
                                const temporalSessionPass = await deriveMasterKey(blockPhrase, TIME_TOKEN.timeToken.toString());
                                chrome.storage.local.set({ 'temporalsesionpass': temporalSessionPass });

                                // Cifrar todas las passwords con temporalSessionPass para uso local
                                const encryptedPasswords = await go_to_encrypt({ 
                                    passwords: PASSWORDS_ARRAY, 
                                    masterKey: temporalSessionPass 
                                });

                                // Actualizar en contexto y local
                                updateAllPasswords(encryptedPasswords);

                                toast.success(MESSAGE_ES.buttons.connect, { position: 'bottom-center', duration: 3000 });
                            }
                        } else {
                            // Archivo sin cifrar o vacío
                            const PASSWORDS_ARRAY = fileContent ? TRANSFORM_DATA_TO_PASSWORDS(fileContent) : [];

                            // Siempre actualizar passwords en contexto (aunque sea array vacío)
                            updateAllPasswords(PASSWORDS_ARRAY);

                            // Siempre guardar en storage local (aunque sea array vacío)
                            // Esto asegura que la sesión se preserve correctamente
                            chrome.storage.local.set({ codepassdata: PASSWORDS_ARRAY });

                            // No hay blockpass, así que blockpasswords debe ser false
                            setBlockPasswords(false);
                            setManualUnblockPass(true); // Marcar como desbloqueado manualmente
                            chrome.storage.local.set({ 'manualunblockpass': true });
                            chrome.storage.local.remove('blockdatapass');
                            chrome.storage.local.remove('masterkey');
                            chrome.storage.local.remove('temporalsesionpass');

                            toast.success(MESSAGE_ES.buttons.connect, { position: 'bottom-center', duration: 3000 });
                        }

                        setLogin(true);
                        setIsLoadingDataGoogle(false);

                    } catch (innerError) {
                        //console.error('Error procesando datos de Drive:', innerError);
                        toast.error(MESSAGE_ES.errorunexpected, { position: 'bottom-center', duration: 3000 });
                        // Limpiar datos temporales en caso de error
                        chrome.storage.local.remove('temporaldrivepass');
                        chrome.storage.local.remove('temporaldrivecontent');
                        setIsLoadingDataGoogle(false);
                    }
                }
            );
        } catch (error) {
            //console.error("Error conectando con Google Drive:", error);
            toast.error(MESSAGE_ES.errorunexpected, { position: 'bottom-center', duration: 3000 });
            // Limpiar datos temporales en caso de error
            chrome.storage.local.remove('temporaldrivepass');
            chrome.storage.local.remove('temporaldrivecontent');
            setIsLoadingDataGoogle(false);
        }
    }, [setLogin, updateAllPasswords, setPassBlock, setBlockPasswords, setManualUnblockPass, setModalRequired, setOnDriveFile]);

    // [HOOKS & STATES]
    return {
        tryGetDataGoogleDrive,
        isLoadingDataGoogle
    };
};

export { useDataDriveGoogle };