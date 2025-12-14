# Justificación de Permisos - Permission Justification

### 🌐 Language / Idioma

**[🇪🇸 Español](#español)** | **[🇬🇧 English](#english)**

---

<a name="español"></a>
## 🇪🇸 ESPAÑOL

## Justificación de Permisos Solicitados

CodePass requiere los siguientes permisos para funcionar correctamente. A continuación se detalla el uso específico y la justificación de cada uno:

### 1. `identity` (Identidad)

**¿Para qué se utiliza?**
- Autenticar usuarios mediante Google OAuth 2.0
- Obtener tokens de acceso de forma segura sin almacenar credenciales del usuario
- Gestionar el flujo de autenticación con Google de manera nativa en Chrome

**Justificación:**
Este permiso es esencial para que los usuarios puedan iniciar sesión con su cuenta de Google de forma segura. Utilizamos `chrome.identity.launchWebAuthFlow` para manejar todo el proceso de autenticación sin que la extensión nunca tenga acceso a las credenciales reales del usuario. El token obtenido expira automáticamente y debe renovarse periódicamente, garantizando seguridad adicional.

**Alternativas consideradas:**
No hay alternativas viables para implementar autenticación OAuth 2.0 segura en una extensión de Chrome sin este permiso.

---

### 2. `storage` (Almacenamiento)

**¿Para qué se utiliza?**
- Almacenar temporalmente el token de sesión del usuario de forma local en el navegador
- Guardar preferencias de configuración del usuario (modo oscuro, preferencias de UI)
- Mantener el estado de la sesión mientras el navegador está abierto

**Justificación:**
El permiso de storage es necesario para mantener la sesión del usuario activa y no requerir autenticación en cada apertura de la extensión. Todos los datos se almacenan localmente en el dispositivo del usuario mediante `chrome.storage.local`. **NUNCA se envían datos a servidores externos de CodePass.** El token de sesión expira automáticamente y debe renovarse periódicamente.

**Datos almacenados localmente:**
- Token de acceso OAuth (temporal, expira en 15 minutos)
- Información básica de perfil (email, nombre)
- Preferencias de usuario (configuración de interfaz)

**Alternativas consideradas:**
Sin este permiso, los usuarios tendrían que autenticarse en cada sesión, degradando significativamente la experiencia de usuario.

---

### 3. `https://www.googleapis.com/auth/drive` (Acceso a Google Drive)

**¿Para qué se utiliza?**
- Sincronizar las contraseñas del usuario en su propio Google Drive personal
- Crear y gestionar una carpeta específica llamada "codepassextension" en el Drive del usuario
- Leer y escribir un archivo de texto plano con las contraseñas en esa carpeta

**Justificación:**
Este es el permiso OAuth 2.0 scope que permite a CodePass acceder al Google Drive del usuario. Es fundamental para la funcionalidad principal de la extensión: permitir que los usuarios hagan backup de sus contraseñas en su propio espacio de almacenamiento en la nube de Google. 

**Importante:**
- Los datos NUNCA pasan por servidores de CodePass
- Los datos se almacenan directamente en el Google Drive del usuario
- El usuario tiene control total sobre sus datos
- El usuario puede revocar este acceso en cualquier momento desde su cuenta de Google
- La sincronización es automática y obligatoria cuando hay conexión a internet

**Alternativas consideradas:**
- Almacenamiento solo local: No permitiría sincronización entre dispositivos ni backup en la nube
- Otros servicios de almacenamiento: Requerirían crear cuentas adicionales y servidores propios, comprometiendo la privacidad

---

### 4. `host_permissions` (Permisos de Host)

**Hosts permitidos:**
- `https://accounts.google.com/*`
- `https://www.googleapis.com/*`

**¿Para qué se utiliza?**
- `accounts.google.com`: Necesario para el flujo de autenticación OAuth 2.0 con Google
- `www.googleapis.com`: Necesario para comunicarse con la API de Google Drive

**Justificación:**
Estos permisos de host son estrictamente necesarios para comunicarse con los servicios de Google durante la autenticación y sincronización. No se realizan peticiones a ningún otro dominio externo.

**Alternativas consideradas:**
No hay alternativas para comunicarse con los servicios de Google sin acceso a estos dominios específicos.

---

## 🔒 Compromiso de Privacidad

CodePass se compromete a:
- ✅ NO almacenar datos en servidores propios
- ✅ NO vender ni compartir información del usuario
- ✅ NO realizar seguimiento o analytics del comportamiento del usuario
- ✅ Mantener todos los datos bajo el control exclusivo del usuario
- ✅ Usar permisos solo para las funcionalidades descritas
- ✅ Ser transparente sobre el uso de permisos

Para más información, consulta nuestra [Política de Privacidad completa](PRIVACY_POLICY.md).

---

<a name="english"></a>
## 🇬🇧 ENGLISH

## Requested Permissions Justification

CodePass requires the following permissions to function properly. Below is a detailed explanation of the specific use and justification for each one:

### 1. `identity` (Identity)

**What is it used for?**
- Authenticate users through Google OAuth 2.0
- Obtain access tokens securely without storing user credentials
- Manage the Google authentication flow natively in Chrome

**Justification:**
This permission is essential for users to securely log in with their Google account. We use `chrome.identity.launchWebAuthFlow` to handle the entire authentication process without the extension ever having access to the user's actual credentials. The obtained token automatically expires and must be renewed periodically, ensuring additional security.

**Alternatives considered:**
There are no viable alternatives to implement secure OAuth 2.0 authentication in a Chrome extension without this permission.

---

### 2. `storage` (Storage)

**What is it used for?**
- Temporarily store the user's session token locally in the browser
- Save user configuration preferences (dark mode, UI preferences)
- Maintain session state while the browser is open

**Justification:**
The storage permission is necessary to keep the user's session active and not require authentication every time the extension is opened. All data is stored locally on the user's device through `chrome.storage.local`. **Data is NEVER sent to external CodePass servers.** The session token automatically expires and must be renewed periodically.

**Data stored locally:**
- OAuth access token (temporary, expires in 15 minutes)
- Basic profile information (email, name)
- User preferences (interface settings)

**Alternatives considered:**
Without this permission, users would have to authenticate in every session, significantly degrading the user experience.

---

### 3. `https://www.googleapis.com/auth/drive` (Google Drive Access)

**What is it used for?**
- Sync the user's passwords in their own personal Google Drive
- Create and manage a specific folder called "codepassextension" in the user's Drive
- Read and write a plain text file with passwords in that folder

**Justification:**
This is the OAuth 2.0 scope permission that allows CodePass to access the user's Google Drive. It is fundamental to the extension's main functionality: allowing users to back up their passwords in their own Google cloud storage space.

**Important:**
- Data NEVER passes through CodePass servers
- Data is stored directly in the user's Google Drive
- The user has complete control over their data
- The user can revoke this access at any time from their Google account
- Synchronization is automatic and mandatory when there is an internet connection

**Alternatives considered:**
- Local-only storage: Would not allow synchronization between devices or cloud backup
- Other storage services: Would require creating additional accounts and own servers, compromising privacy

---

### 4. `host_permissions` (Host Permissions)

**Allowed hosts:**
- `https://accounts.google.com/*`
- `https://www.googleapis.com/*`

**What is it used for?**
- `accounts.google.com`: Necessary for the OAuth 2.0 authentication flow with Google
- `www.googleapis.com`: Necessary to communicate with the Google Drive API

**Justification:**
These host permissions are strictly necessary to communicate with Google services during authentication and synchronization. No requests are made to any other external domain.

**Alternatives considered:**
There are no alternatives to communicate with Google services without access to these specific domains.

---

## 🔒 Privacy Commitment

CodePass commits to:
- ✅ NOT store data on own servers
- ✅ NOT sell or share user information
- ✅ NOT track or analyze user behavior
- ✅ Keep all data under the user's exclusive control
- ✅ Use permissions only for the described functionalities
- ✅ Be transparent about the use of permissions

For more information, see our [complete Privacy Policy](PRIVACY_POLICY.md).
