// hook para cambiar los datos de passblock del contexto
import { useContext, useState, useEffect } from "react";
import { CodePassContext } from "@contexts/CodepassContext";
import { encryptWithPassphrase, go_to_encrypt, deriveMasterKey } from "@utils/EncodePayload.js";
import { TRANSFORM_DATA_TO_ENCODED } from "@utils/transformDataToPasswords";

const useSetPassblock = () => {
    const { setPassBlock, dataCodePass, setBlockPasswords: contextSetBlockPasswords, updateAllPasswords } = useContext(CodePassContext);
    const [blockpass, setBlockpass] = useState(dataCodePass.passblock || '');
    if (blockpass === '' || !blockpass) {
        chrome.storage.local.get('blockdatapass').then((data) => {
            setBlockpass(data.blockdatapass || '');
        });
    }
    const setBlockPasswords = (pass) => {
        const TO_DO_ENCRYPT = async () => {
            // console.log('TO_DO_ENCRYPT');
            
            // 1. Guardar blockpass cifrado
            const encrypted = await encryptWithPassphrase(pass, pass);
            setBlockpass(encrypted);
            chrome.storage.local.set({ 'blockdatapass': encrypted });
            setPassBlock(encrypted);
            
            // 2. Derivar masterKey (SIN timeToken - determinista para Drive)
            const masterKey = await deriveMasterKey(pass);
            // console.log('MasterKey derivada (determinista para Drive)');
            
            // Guardar masterKey para usar en sync durante la sesión
            chrome.storage.local.set({ 'masterkey': masterKey });
            
            // 3. Derivar temporalsesionpass (CON timeToken - única por sesión)
            const TIME_TOKEN = await chrome.storage.local.get('timeToken');
            const temporalSessionPass = await deriveMasterKey(pass, TIME_TOKEN.timeToken.toString());
            
            // 3. SINCRONIZAR A DRIVE ANTES de cifrar con temporalsesionpass
            // Las passwords actuales están sin cifrar en el contexto
            const passwordsPlain = [...dataCodePass.datapasswords];
            const PASSWORDS_STRING = TRANSFORM_DATA_TO_ENCODED(passwordsPlain);
            const ENCRYPTED_DATA = await encryptWithPassphrase(PASSWORDS_STRING, masterKey);
            const FINAL_CONTENT = `<<<cpbh5:${ENCRYPTED_DATA}>>>`;
            
            // Enviar a Drive
            if (chrome?.runtime) {
                chrome.runtime.sendMessage(
                    { 
                        action: "update_drive_file",
                        content: FINAL_CONTENT
                    },
                    (response) => {
                        if (response?.success) {
                            // console.log('Passwords sincronizadas con blockpass a Drive');
                        } else {
                            console.error('Error sincronizando a Drive:', response?.error);
                        }
                    }
                );
            }
            
            // 4. Ahora cifrar passwords con temporalsesionpass para uso local
            const passwordsToEncrypt = [...dataCodePass.datapasswords];
            // console.log('Cifrando passwords localmente');
            const encryptedPasswords = await go_to_encrypt({ passwords: passwordsToEncrypt, masterKey: temporalSessionPass });
            // console.log('Passwords cifradas');
            
            // 5. Guardar temporalsesionpass (para descifrar localmente)
            chrome.storage.local.set({ 'temporalsesionpass': temporalSessionPass });
            
            // 6. Actualizar contexto con passwords cifradas
            updateAllPasswords(encryptedPasswords);
        };
        TO_DO_ENCRYPT();
    }
    const setPassBlockDrive = (pass) => {
        if (!pass || pass.trim() === '') return;
        setBlockpass(pass);
        chrome.storage.local.set({ 'blockdatapass': pass });
        setPassBlock(pass);
        // Solo establecer blockpasswords en true si hay passwords en el contexto
        if (dataCodePass.datapasswords.length > 0) {
            contextSetBlockPasswords(true);
        } else {
            contextSetBlockPasswords(false);
        }
    }

    useEffect(() => {
        if (blockpass !== '' || !blockpass) {
            chrome.storage.local.get('blockdatapass').then((data) => {
                setBlockpass(data.blockdatapass || '');
            });
        }
    }, [blockpass]);

    return { setBlockPasswords, blockpass, setPassBlockDrive };
};

export { useSetPassblock };