// crypto-passphrase.js (ESM para navegador/ extensiones, CIFRA y DESCIFRA con frase)
// EJEMPLO DE USO
/**
import { encryptWithPassphrase, decryptWithPassphrase } from "./crypto-passphrase.js";

const pass = "MiPalabraClave123";
const secreto = "mensaje ultra secreto";

(async () => {
    const token = await encryptWithPassphrase(secreto, pass);
    //console.log("TOKEN (base64):", token);

    const original = await decryptWithPassphrase(token, pass);
    //console.log("PLANO:", original); // "mensaje ultra secreto"
})();
*/

const te = new TextEncoder();
const td = new TextDecoder();

const PBKDF2_ITERS = 310_000; // iteraciones recomendadas
const SALT_BYTES = 16;
const IV_BYTES = 12; // AES-GCM recomienda 12 bytes
const VERSION = 1;   // por si cambias el formato en el futuro

const u8 = (n) => new Uint8Array(n);
const b64encode = (bytes) => btoa(String.fromCharCode(...bytes));
const b64decode = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function deriveKey(passphrase, salt) {
    const baseKey = await crypto.subtle.importKey(
        "raw",
        te.encode(passphrase),
        "PBKDF2",
        false,
        ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
        { name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITERS },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

export async function encryptWithPassphrase(plaintext, passphrase) {
    const salt = crypto.getRandomValues(u8(SALT_BYTES));
    const iv = crypto.getRandomValues(u8(IV_BYTES));
    const key = await deriveKey(passphrase, salt);

    const ciphertext = new Uint8Array(
        await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            te.encode(plaintext)
        )
    );

    // Paquete: [version(1) | salt(16) | iv(12) | ciphertext(n)]
    const out = new Uint8Array(1 + SALT_BYTES + IV_BYTES + ciphertext.length);
    out[0] = VERSION;
    out.set(salt, 1);
    out.set(iv, 1 + SALT_BYTES);
    out.set(ciphertext, 1 + SALT_BYTES + IV_BYTES);

    return b64encode(out);
}

export async function decryptWithPassphrase(payloadBase64, passphrase) {
    // Verificamos que exista en chrome.storage.loca temporalsesionpass si no existe solo devuelve el payloadBase64
    const datatemporalsesion = await chrome.storage.local.get('temporalsesionpass');
    const blockdatapass = await chrome.storage.local.get('blockdatapass');
    if (!datatemporalsesion.temporalsesionpass && !blockdatapass.blockdatapass) {
        return payloadBase64;
    }
    const data = b64decode(payloadBase64);
    const version = data[0];
    if (version !== VERSION) return ("Formato/versión no soportado");

    const salt = data.slice(1, 1 + SALT_BYTES);
    const iv = data.slice(1 + SALT_BYTES, 1 + SALT_BYTES + IV_BYTES);
    const ct = data.slice(1 + SALT_BYTES + IV_BYTES);

    const key = await deriveKey(passphrase, salt);

    const plainBuf = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        ct
    );

    return td.decode(plainBuf);
}

/**
 * Deriva una clave maestra determinista a partir de una password y datos adicionales
 * IMPORTANTE: Mismo input → mismo output (determinista)
 * @param {string} blockPassword - Contraseña de bloqueo
 * @param {string} additionalData - Datos adicionales (ej: timestamp unix)
 * @returns {Promise<string>} Clave derivada en base64 (siempre la misma para los mismos inputs)
 */
export async function deriveMasterKey(blockPassword, additionalData = "") {
    const combinedInput = blockPassword + additionalData;
    const hash = await crypto.subtle.digest("SHA-256", te.encode(combinedInput));
    return b64encode(new Uint8Array(hash));
}

export const go_to_encrypt = async ({ passwords = [], masterKey = "" }) => {
    // Test del array que llega: [{"name": "test","password": "A@@BhjrEdJjPXYb5Bi","namekey": "test-hYm64d", "block": false}]
    // Estructura updatePasswords([{ name: inputRef.current.value, password: inputRefPass.current.value, namekey: `${inputRef.current.value}-${RANDOM_NAME}`, block: false }]);
    if (passwords.length < 1) {
        return [];
    }
    try {
        const datatemporalsesion = await chrome.storage.local.get('temporalsesionpass');
        if (!datatemporalsesion.temporalsesionpass && masterKey.trim() === "") {
            return passwords;
        }
        const passphrase = datatemporalsesion.temporalsesionpass || masterKey;
        const encryptedPasswords = [];
        for (const pass of passwords) {
            const encrypted = await encryptWithPassphrase(pass.password, passphrase);
            encryptedPasswords.push({
                name: pass.name,
                password: encrypted,
                namekey: pass.namekey,
                block: pass.block !== undefined ? pass.block : false  // Preservar la key block
            });
        }
        return encryptedPasswords;
    } catch (error) {
        //console.log("Error encrypting block password:", error);
        return [];
    }
};

/**
 * Descifra contenido cifrado directamente con una frase, sin validar chrome.storage
 * @param {string} payloadBase64 - Contenido cifrado en base64
 * @param {string} passphrase - Frase para descifrar
 * @returns {Promise<string>} Texto plano descifrado
 * @throws {Error} Si el formato es inválido o la frase es incorrecta
 */
export async function decryptDirectly({payloadBase64, passphrase}) {
    if (payloadBase64 === '' || passphrase === '') {
        return 'Invalid input parameters';
    }
    const data = b64decode(payloadBase64);
    const version = data[0];
    if (version !== VERSION) {
        return "Formato/versión no soportado";
    }

    const salt = data.slice(1, 1 + SALT_BYTES);
    const iv = data.slice(1 + SALT_BYTES, 1 + SALT_BYTES + IV_BYTES);
    const ct = data.slice(1 + SALT_BYTES + IV_BYTES);

    const key = await deriveKey(passphrase, salt);

    try {
        const plainBuf = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            ct
        );
        return td.decode(plainBuf);
    } catch (error) {
        return {data: false, error: 'Decryption failed. Possible incorrect passphrase.'};
    }
}
