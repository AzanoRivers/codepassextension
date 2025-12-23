chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case "login_with_google": {
            // Usar getAuthToken que es el método nativo para extensiones con oauth2 en manifest
            chrome.identity.getAuthToken({ interactive: true }, (token) => {
                if (chrome.runtime.lastError) {
                    //console.error('❌ Error en autenticación:', chrome.runtime.lastError.message);
                    sendResponse({ success: false, error: chrome.runtime.lastError.message });
                } else if (token) {
                    //console.log('✅ Token obtenido exitosamente');
                    sendResponse({ success: true, token: token });
                } else {
                    //console.error('❌ No se obtuvo token');
                    sendResponse({ success: false, error: 'No se pudo obtener el token' });
                }
            });
            return true;
        }
        case "logout_google": {
            // 1. Obtener el token actual
            chrome.storage.local.get("accountToken", ({ accountToken }) => {
                const cleanupAllData = () => {
                    // Eliminar TODOS los datos de sesión según README
                    const keysToRemove = [
                        "accountToken",
                        "timeToken",
                        "codepassdata",
                        "blockdatapass",
                        "temporalsesionpass",
                        "masterkey",
                        "manualunblockpass",
                        "temporaldrivecontent",
                        "temporaldrivepass"
                    ];
                    chrome.storage.local.remove(keysToRemove, () => {
                        sendResponse({ success: true, message: "Sesión cerrada completamente" });
                    });
                };

                if (accountToken) {
                    // 2. Remover el token del caché de Chrome
                    chrome.identity.removeCachedAuthToken({ token: accountToken }, () => {
                        // 3. Revocar el token completamente en Google
                        // Esto fuerza que siempre pida seleccionar cuenta
                        fetch(`https://accounts.google.com/o/oauth2/revoke?token=${accountToken}`, {
                            method: 'POST'
                        }).then(() => {
                            // 4. Limpiar todos los datos locales
                            cleanupAllData();
                        }).catch((error) => {
                            // Aunque falle la revocación, eliminamos todo localmente
                            console.log(error);
                            cleanupAllData();
                        });
                    });
                } else {
                    // No hay token, pero limpiamos todo igual
                    cleanupAllData();
                }
            });
            return true;
        }
        case "get_drive_files":
            chrome.storage.local.get("accountToken").then(({ accountToken: userToken }) => {
                const targetFolderName = message.folderName || "codepassextension";
                const targetFileName = message.fileName || "codepassdata.txt";
                if (!userToken) { sendResponse({ success: false, error: "Token requerido" }); return; }
                // 1) Buscar carpeta por nombre en raíz (o crearla)
                const folderQuery = [
                    "mimeType='application/vnd.google-apps.folder'",
                    "trashed=false",
                    "'root' in parents",
                    `name='${targetFolderName.replace(/'/g, "\\'")}'`
                ].join(" and ");
                fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(folderQuery)}&fields=files(id,name)&pageSize=1`, {
                    headers: { Authorization: "Bearer " + userToken }
                }).then((folderResponse) => {
                    // Verificar errores de autenticación/permisos
                    if (folderResponse.status === 401 || folderResponse.status === 403) {
                        sendResponse({ success: false, error: "INSUFFICIENT_PERMISSIONS", errorType: "permissions" });
                        return null;
                    }
                    if (!folderResponse.ok) {
                        sendResponse({ success: false, error: `Drive API error: ${folderResponse.status}` });
                        return null;
                    }
                    return folderResponse.json();
                }).then((folderData) => {
                    if (!folderData) return; // Ya se envió la respuesta de error

                    // Verificar si la respuesta contiene un error de permisos de Google
                    if (folderData.error) {
                        const isPermissionError =
                            folderData.error.code === 403 ||
                            folderData.error.code === 401 ||
                            folderData.error.status === "PERMISSION_DENIED" ||
                            (folderData.error.errors && folderData.error.errors.some(e => e.reason === "insufficientPermissions"));

                        if (isPermissionError) {
                            sendResponse({ success: false, error: "INSUFFICIENT_PERMISSIONS", errorType: "permissions" });
                            return;
                        }
                        sendResponse({ success: false, error: folderData.error.message || "Error en Drive API" });
                        return;
                    }

                    const existingFolder = folderData.files && folderData.files[0];
                    if (existingFolder) return existingFolder;
                    // Crear carpeta si no existe
                    return fetch("https://www.googleapis.com/drive/v3/files?fields=id,name", {
                        method: "POST",
                        headers: {
                            Authorization: "Bearer " + userToken,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            name: targetFolderName,
                            mimeType: "application/vnd.google-apps.folder",
                            parents: ["root"]
                        })
                    }).then((createFolderResponse) => {
                        // Verificar errores de permisos al crear carpeta
                        if (createFolderResponse.status === 401 || createFolderResponse.status === 403) {
                            sendResponse({ success: false, error: "INSUFFICIENT_PERMISSIONS", errorType: "permissions" });
                            return null;
                        }
                        if (!createFolderResponse.ok) {
                            sendResponse({ success: false, error: `Error creando carpeta: ${createFolderResponse.status}` });
                            return null;
                        }
                        return createFolderResponse.json();
                    }).then((createdFolderData) => {
                        if (!createdFolderData) return null; // Ya se envió la respuesta de error
                        // Verificar si hay error de permisos en la respuesta JSON
                        if (createdFolderData.error) {
                            const isPermissionError =
                                createdFolderData.error.code === 403 ||
                                createdFolderData.error.code === 401 ||
                                createdFolderData.error.status === "PERMISSION_DENIED" ||
                                (createdFolderData.error.errors && createdFolderData.error.errors.some(e => e.reason === "insufficientPermissions"));

                            if (isPermissionError) {
                                sendResponse({ success: false, error: "INSUFFICIENT_PERMISSIONS", errorType: "permissions" });
                                return null;
                            }
                            sendResponse({ success: false, error: createdFolderData.error.message || "Error creando carpeta" });
                            return null;
                        }
                        return createdFolderData;
                    });
                }).then(async (folderInfo) => {
                    if (!folderInfo) return null; // Ya se envió la respuesta de error

                    // 2) Buscar archivo por nombre dentro de la carpeta
                    const fileQuery = [
                        `'${folderInfo.id}' in parents`,
                        "trashed=false",
                        "'me' in owners",
                        `name='${targetFileName.replace(/'/g, "\\'")}'`
                    ].join(" and ");
                    const fileSearchResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(fileQuery)}&fields=files(id,name,mimeType,modifiedTime,size)&pageSize=1`, {
                        headers: { Authorization: "Bearer " + userToken }
                    });

                    // Verificar errores de permisos al buscar archivos
                    if (fileSearchResponse.status === 401 || fileSearchResponse.status === 403) {
                        sendResponse({ success: false, error: "INSUFFICIENT_PERMISSIONS", errorType: "permissions" });
                        return null;
                    }
                    if (!fileSearchResponse.ok) {
                        sendResponse({ success: false, error: `Error buscando archivo: ${fileSearchResponse.status}` });
                        return null;
                    }

                    const fileSearchData = await fileSearchResponse.json();

                    // Verificar si hay error de permisos en la respuesta JSON
                    if (fileSearchData.error) {
                        const isPermissionError =
                            fileSearchData.error.code === 403 ||
                            fileSearchData.error.code === 401 ||
                            fileSearchData.error.status === "PERMISSION_DENIED" ||
                            (fileSearchData.error.errors && fileSearchData.error.errors.some(e => e.reason === "insufficientPermissions"));

                        if (isPermissionError) {
                            sendResponse({ success: false, error: "INSUFFICIENT_PERMISSIONS", errorType: "permissions" });
                            return null;
                        }
                        sendResponse({ success: false, error: fileSearchData.error.message || "Error buscando archivo" });
                        return null;
                    }
                    const existingFile = fileSearchData.files && fileSearchData.files[0];
                    // 3) Si existe, leer contenido y retornar
                    if (existingFile) {
                        return fetch(`https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`, {
                            headers: { Authorization: "Bearer " + userToken }
                        }).then((fileContentResponse) => {
                            // Verificar errores de permisos al leer contenido
                            if (fileContentResponse.status === 401 || fileContentResponse.status === 403) {
                                sendResponse({ success: false, error: "INSUFFICIENT_PERMISSIONS", errorType: "permissions" });
                                return null;
                            }
                            if (!fileContentResponse.ok) {
                                sendResponse({ success: false, error: `Error leyendo contenido: ${fileContentResponse.status}` });
                                return null;
                            }
                            return fileContentResponse.text();
                        }).then((rawContent) => {
                            if (rawContent === null) return null; // Ya se envió la respuesta de error
                            return {
                                folder: folderInfo,
                                file: existingFile,
                                content: rawContent || ""
                            };
                        });
                    }
                    // 4) Si no existe, crear archivo de texto vacío (multipart)
                    const metadata = {
                        name: targetFileName,
                        parents: [folderInfo.id],
                        mimeType: "text/plain"
                    };
                    const boundary = "codepass_boundary_" + Math.random().toString(36).slice(2);
                    const delimiter = "\r\n--" + boundary + "\r\n";
                    const closeDelim = "\r\n--" + boundary + "--";
                    const multipartBody = delimiter +
                        "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
                        JSON.stringify(metadata) +
                        delimiter +
                        "Content-Type: text/plain; charset=UTF-8\r\n\r\n" +
                        "" + // contenido vacío inicial
                        closeDelim;
                    const createFileResponse = await fetch(`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name`, {
                        method: "POST",
                        headers: {
                            Authorization: "Bearer " + userToken,
                            "Content-Type": `multipart/related; boundary=${boundary}`
                        },
                        body: multipartBody
                    });

                    // Verificar errores de permisos al crear archivo
                    if (createFileResponse.status === 401 || createFileResponse.status === 403) {
                        sendResponse({ success: false, error: "INSUFFICIENT_PERMISSIONS", errorType: "permissions" });
                        return null;
                    }
                    if (!createFileResponse.ok) {
                        sendResponse({ success: false, error: `Error creando archivo: ${createFileResponse.status}` });
                        return null;
                    }

                    const createdFile = await createFileResponse.json();

                    // Verificar si el JSON contiene error de permisos
                    if (createdFile.error) {
                        const isPermissionError =
                            createdFile.error.code === 403 ||
                            createdFile.error.code === 401 ||
                            createdFile.error.status === "PERMISSION_DENIED" ||
                            (createdFile.error.errors && createdFile.error.errors.some(e => e.reason === "insufficientPermissions"));

                        if (isPermissionError) {
                            sendResponse({ success: false, error: "INSUFFICIENT_PERMISSIONS", errorType: "permissions" });
                            return null;
                        }
                        sendResponse({ success: false, error: createdFile.error.message || "Error creando archivo" });
                        return null;
                    }

                    return ({
                        folder: folderInfo,
                        file: createdFile,
                        content: "" // recién creado, vacío
                    });
                }).then((result) => {
                    if (!result) return; // Ya se envió la respuesta de error
                    const { folder, file, content } = result;
                    sendResponse({ success: true, folder, file, content });
                }).catch((error) => {
                    sendResponse({ success: false, error: String(error) });
                });
            });
            return true;
        case "update_drive_file":
            (async () => {
                try {
                    const { accountToken: userToken } = await chrome.storage.local.get("accountToken");
                    const targetFolderName = message.folderName || "codepassextension";
                    const targetFileName = message.fileName || "codepassdata.txt";
                    const fileContent = message.content || "";
                    
                    if (!userToken) { 
                        sendResponse({ success: false, error: "Token requerido" }); 
                        return; 
                    }
                    
                    // 1) Buscar carpeta
                    const folderQuery = [
                        "mimeType='application/vnd.google-apps.folder'",
                        "trashed=false",
                        "'root' in parents",
                        `name='${targetFolderName.replace(/'/g, "\\'")}'`
                    ].join(" and ");
                    
                    const folderSearchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(folderQuery)}&fields=files(id,name)&pageSize=1`, {
                        headers: { Authorization: "Bearer " + userToken }
                    });
                    
                    if (!folderSearchRes.ok) {
                        sendResponse({ success: false, error: `Error buscando carpeta: ${folderSearchRes.status}` });
                        return;
                    }
                    
                    const folderData = await folderSearchRes.json();
                    let folderId = folderData.files?.[0]?.id;
                    
                    // Crear carpeta si no existe
                    if (!folderId) {
                        const createFolderRes = await fetch("https://www.googleapis.com/drive/v3/files?fields=id,name", {
                            method: "POST",
                            headers: {
                                Authorization: "Bearer " + userToken,
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                name: targetFolderName,
                                mimeType: "application/vnd.google-apps.folder",
                                parents: ["root"]
                            })
                        });
                        
                        if (!createFolderRes.ok) {
                            sendResponse({ success: false, error: `Error creando carpeta: ${createFolderRes.status}` });
                            return;
                        }
                        
                        const folderInfo = await createFolderRes.json();
                        folderId = folderInfo.id;
                    }
                    
                    // 2) Buscar archivo en la carpeta
                    const fileQuery = [
                        `'${folderId}' in parents`,
                        "trashed=false",
                        `name='${targetFileName.replace(/'/g, "\\'")}'`
                    ].join(" and ");
                    
                    const fileSearchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(fileQuery)}&fields=files(id,name)&pageSize=1`, {
                        headers: { Authorization: "Bearer " + userToken }
                    });
                    
                    if (!fileSearchRes.ok) {
                        sendResponse({ success: false, error: `Error buscando archivo: ${fileSearchRes.status}` });
                        return;
                    }
                    
                    const fileData = await fileSearchRes.json();
                    let fileId = fileData.files?.[0]?.id;
                    
                    // 3) Actualizar o crear archivo
                    if (fileId) {
                        // Actualizar archivo existente
                        const updateRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
                            method: "PATCH",
                            headers: {
                                Authorization: "Bearer " + userToken,
                                "Content-Type": "text/plain"
                            },
                            body: fileContent
                        });
                        
                        if (updateRes.ok) {
                            sendResponse({ success: true, message: "Archivo actualizado" });
                        } else {
                            const errorText = await updateRes.text();
                            sendResponse({ success: false, error: `Error actualizando archivo: ${errorText}` });
                        }
                    } else {
                        // Crear nuevo archivo
                        const metadata = {
                            name: targetFileName,
                            parents: [folderId],
                            mimeType: "text/plain"
                        };
                        const boundary = "codepass_boundary_" + Math.random().toString(36).slice(2);
                        const delimiter = "\r\n--" + boundary + "\r\n";
                        const closeDelim = "\r\n--" + boundary + "--";
                        const multipartBody = delimiter +
                            "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
                            JSON.stringify(metadata) +
                            delimiter +
                            "Content-Type: text/plain; charset=UTF-8\r\n\r\n" +
                            fileContent +
                            closeDelim;
                        
                        const createRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name`, {
                            method: "POST",
                            headers: {
                                Authorization: "Bearer " + userToken,
                                "Content-Type": `multipart/related; boundary=${boundary}`
                            },
                            body: multipartBody
                        });
                        
                        if (createRes.ok) {
                            sendResponse({ success: true, message: "Archivo creado" });
                        } else {
                            const errorText = await createRes.text();
                            sendResponse({ success: false, error: `Error creando archivo: ${errorText}` });
                        }
                    }
                } catch (error) {
                    sendResponse({ success: false, error: String(error) });
                }
            })();
            return true;
        case "testbackground":
            sendResponse({ success: true, data: "Test background" });
            return true;
    }
});

