# Política de Privacidad - CodePass Extension

**Última actualización:** 10 de diciembre de 2025

## 📧 Contacto del Desarrollador
- **Sitio web:** https://azanorivers.com
- **Developer:** AzanoRivers / AzanoLabs
- **GitHub:** https://github.com/azanoRivers/codepass-extension

---

## 1. Introducción y Compromiso de Privacidad

**CodePass** es una extensión de navegador para Chrome diseñada para la gestión segura de contraseñas con sincronización opcional mediante Google Drive. Nos comprometemos a proteger tu privacidad y a ser completamente transparentes sobre cómo manejamos tus datos.

### Principio Fundamental
**CodePass NO comparte, NO vende, NO transfiere y NO almacena tus datos en servidores externos propios.** Toda la información permanece bajo tu control exclusivo.

---

## 2. Información que Recopilamos y Cómo la Usamos

### 2.1. Datos de Autenticación de Google

**Qué recopilamos:**
- Token de acceso OAuth 2.0 de Google (temporal)
- Información básica de perfil (email, nombre)

**Cómo lo usamos:**
- Autenticar tu identidad con Google
- Acceder a Google Drive para sincronización (solo si lo autorizas)
- Validar permisos de acceso

**Dónde se almacena:**
- Localmente en tu navegador (`chrome.storage.local`)
- Temporalmente (expira en 15 minutos, debes renovarlo)
- **NUNCA** en servidores externos de CodePass

**Permisos de Google solicitados:**
- `openid`, `email`, `profile`: Identificación básica
- `https://www.googleapis.com/auth/drive`: Acceso a Google Drive

---

### 2.2. Contraseñas y Credenciales

**Qué almacenamos:**
- Contraseñas que tú decides guardar en CodePass
- Nombres de servicio/sitio web asociados
- Nombres de usuario asociados

**Cómo se protegen:**
- ✅ Cifrado **AES-GCM de 256 bits** localmente
- ✅ Derivación de claves con **PBKDF2** (310,000 iteraciones, SHA-256)
- ✅ Contraseña maestra opcional (**blockPhrase**) que **NUNCA** se guarda en texto plano
- ✅ Claves de cifrado temporales que se destruyen al cerrar sesión

**Dónde se almacenan:**
- **Localmente:** `chrome.storage.local` (cifradas)
- **Google Drive:** archivo `codepassdata.txt` en carpeta `codepassextension` (cifrado si configuras blockPhrase, o plano si lo prefieres)

**⚠️ Importante:**
- CodePass **NO puede leer tus contraseñas** si usas blockPhrase
- Si olvidas tu blockPhrase, **NO podemos recuperar tus datos**
- Solo **TÚ** tienes acceso a tus contraseñas

---

### 2.3. Datos de Configuración Local

**Qué almacenamos:**
- Preferencias de tema oscuro/claro
- Estado de bloqueo de contraseñas
- Configuración de sincronización automática

**Dónde se almacena:**
- Localmente en `chrome.storage.local`
- **NUNCA** se sincroniza con servidores externos

---

## 3. Cómo Compartimos tu Información

### 3.1. Google Drive (Solo con tu Autorización)

- Tu archivo de contraseñas se sincroniza **ÚNICAMENTE** con **TU** cuenta de Google Drive personal
- Nadie más tiene acceso (ni siquiera nosotros)
- Puedes revocar el acceso en cualquier momento desde tu [cuenta de Google](https://myaccount.google.com/permissions)
- El archivo se almacena en: `Google Drive > codepassextension > codepassdata.txt`

### 3.2. NO Compartimos con Terceros

CodePass **NO comparte, vende, alquila ni transfiere** tus datos personales a terceros bajo ninguna circunstancia, excepto:

- **Cumplimiento Legal:** Si la ley lo requiere (orden judicial, etc.)
- **Protección de Derechos:** Para proteger nuestros derechos legales

---

## 4. Servicios de Terceros Utilizados

### 4.1. Google OAuth 2.0 y Google Drive API

- **Proveedor:** Google LLC
- **Propósito:** Autenticación y almacenamiento en Drive
- **Política de Privacidad:** [Google Privacy Policy](https://policies.google.com/privacy)
- **Revocar acceso:** [Google Account Permissions](https://myaccount.google.com/permissions)

### 4.2. Google Fonts (Solo para UI)

- **Proveedor:** Google LLC
- **Propósito:** Cargar fuentes tipográficas (Orbitron, Barlow Condensed)
- **URL:** `https://fonts.googleapis.com/`
- **Datos recopilados:** Dirección IP (para entrega de fuentes - estándar web)
- **Política:** [Google Fonts Privacy](https://developers.google.com/fonts/faq/privacy)

---

## 5. Seguridad de tus Datos

### 5.1. Medidas de Seguridad Implementadas

✅ Cifrado de extremo a extremo con AES-GCM 256 bits  
✅ Derivación de claves con PBKDF2 (310,000 iteraciones, SHA-256)  
✅ Claves temporales que se eliminan al cerrar sesión  
✅ Contraseña maestra (blockPhrase) cifrada consigo misma  
✅ Tokens de autenticación con expiración (15 minutos)  
✅ Sin almacenamiento en servidores propios  
✅ Sin registro de actividad o logs externos  

### 5.2. Responsabilidad del Usuario

- Mantén tu blockPhrase segura y privada
- Usa contraseñas fuertes para tu cuenta de Google
- Revisa regularmente los permisos de tu cuenta de Google
- Cierra sesión en dispositivos compartidos

---

## 6. Tus Derechos de Privacidad

Tienes derecho a:

✅ **Acceder** a tus datos (están en tu Google Drive y `chrome.storage.local`)  
✅ **Modificar** tus datos (edita o elimina passwords en cualquier momento)  
✅ **Eliminar** tus datos:
   - Cierra sesión → se eliminan datos locales automáticamente
   - Elimina el archivo de Drive manualmente si lo deseas
   - Desinstala la extensión → se eliminan todos los datos locales
   
✅ **Exportar** tus datos (función de exportación disponible en la extensión)  
✅ **Revocar** permisos de Google Drive en cualquier momento

---

## 7. Retención y Eliminación de Datos

| Tipo de Dato | Retención |
|--------------|-----------|
| **Datos Locales** | Se eliminan automáticamente al cerrar sesión o desinstalar |
| **Google Drive** | Permanecen hasta que TÚ los elimines manualmente |
| **Tokens de Acceso** | Expiran automáticamente en 15 minutos |
| **Claves de Cifrado** | Se eliminan al bloquear o cerrar sesión |

---

## 8. Privacidad de Menores de Edad

CodePass **NO** está diseñado para menores de 13 años. No recopilamos intencionalmente información de menores. Si eres padre/tutor y descubres que tu hijo nos proporcionó información, contáctanos para eliminarla.

---

## 9. Cambios a esta Política de Privacidad

Podemos actualizar esta política ocasionalmente. Te notificaremos de cambios significativos mediante:

- Actualización de la fecha en la parte superior
- Notificación en la extensión (si aplica)

Recomendamos revisar esta política periódicamente.

---

## 10. Transparencia Técnica

### 10.1. Permisos de Chrome Solicitados

| Permiso | Propósito |
|---------|-----------|
| `storage` | Guardar configuración y datos cifrados localmente |
| `identity` | Autenticación con Google OAuth 2.0 |

### 10.2. Datos que NO Recopilamos

❌ Historial de navegación  
❌ Sitios web visitados  
❌ Datos de tarjetas de crédito  
❌ Información de ubicación  
❌ Análisis de uso o telemetría  
❌ Publicidad o tracking  
❌ Información de dispositivos  

---

## 11. Contacto y Soporte

Si tienes preguntas sobre esta Política de Privacidad o sobre cómo manejamos tus datos:

- 📧 **Email:** [TU_EMAIL_AQUI]
- 🌐 **Web:** [TU_WEB_AQUI]
- 💻 **GitHub:** [https://github.com/azanoRivers/codepass-extension](https://github.com/azanoRivers/codepass-extension)

---

## 12. Cumplimiento Legal

Esta extensión cumple con:

- ✅ **Chrome Web Store Developer Program Policies**
- ✅ **GDPR** (Reglamento General de Protección de Datos - UE)
- ✅ **CCPA** (California Consumer Privacy Act - EE.UU.)

---

## English Version

### 1. Introduction and Privacy Commitment

**CodePass** is a Chrome browser extension designed for secure password management with optional synchronization via Google Drive. We are committed to protecting your privacy and being completely transparent about how we handle your data.

**Fundamental Principle:** CodePass does NOT share, sell, transfer, or store your data on our own external servers. All information remains under your exclusive control.

### 2. Information We Collect

**2.1. Google Authentication Data**
- Temporary OAuth 2.0 access token
- Basic profile information (email, name)
- Stored locally in browser (`chrome.storage.local`)
- NEVER on external CodePass servers

**2.2. Passwords and Credentials**
- Encrypted with 256-bit AES-GCM locally
- Optional master password (blockPhrase) never stored in plain text
- Stored locally and optionally in YOUR Google Drive
- We CANNOT read your passwords if you use blockPhrase

**2.3. Local Configuration**
- Theme preferences, lock state, sync settings
- Stored locally only, never synchronized externally

### 3. Data Sharing

- **Google Drive:** Only YOUR personal account (if you authorize)
- **Third Parties:** We do NOT share, sell, or transfer your data
- **Exceptions:** Legal compliance (court orders) only

### 4. Third-Party Services

**4.1. Google OAuth & Drive API**
- Provider: Google LLC
- Privacy Policy: [https://policies.google.com/privacy](https://policies.google.com/privacy)

**4.2. Google Fonts (UI only)**
- Standard web service for typography
- Privacy: [https://developers.google.com/fonts/faq/privacy](https://developers.google.com/fonts/faq/privacy)

### 5. Security Measures

✅ End-to-end 256-bit AES-GCM encryption  
✅ PBKDF2 key derivation (310,000 iterations)  
✅ Temporary keys deleted on logout  
✅ No external server storage  
✅ No activity logging  

### 6. Your Rights

✅ Access, modify, delete, and export your data anytime  
✅ Revoke Google Drive permissions anytime  
✅ Data automatically deleted on logout/uninstall  

### 7. Children's Privacy

Not designed for children under 13. We do not knowingly collect data from minors.

### 8. Contact

- 📧 Email: [TU_EMAIL_AQUI]
- 🌐 Web: [TU_WEB_AQUI]
- 💻 GitHub: [https://github.com/azanoRivers/codepass-extension](https://github.com/azanoRivers/codepass-extension)

### 9. Compliance

✅ Chrome Web Store Policies  
✅ GDPR (EU)  
✅ CCPA (USA)  

---

**Last Updated:** December 10, 2025
