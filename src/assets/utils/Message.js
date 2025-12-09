/**
 * Utilidad que retorna la información del JWT decodificada
 *
 * @description Objeto con los textos de la aplicación
 * @returns {Object} - OBJETO LANGUAGE
 */

const MESSAGE_ES = {
    title: "CODE PASS",
    account: "Cuenta",
    created: "Creado por ツ AzanoRivers",
    tips: [
        {
            description: "¡NUNCA! Pierda su Password Maestra. Sus recuerdos volaran tan lejos como un ave que escapó de su prisión...",
            autor: "... Libre - Nino Bravo ♫♪♬"
        },
        {
            description: "No se recopilan datos, contraseñas o algún tipo de información. Todos los datos son guardados en su cuenta de Google Drive.",
            autor: "... un mundo con valores es un mundo que vale la pena vivir ツ AzanoRivers"
        }
    ],
    error: {
        net: 'No es posible conectar con Google. Debe aceptar los permisos de acceso o revisar su conexión.',
        denegate: 'Acceso denegado',
        unexpected: 'Error inesperado...',
        googlemodal: 'Una nueva ventana de Google se ha abierto',
        netdisconnected: 'No hay conexión a internet',
    },
    buttons: {
        logout: "Salir",
        login: "• INGRESAR CON GOOGLE •",
        connect: "¡Conectado!",
        connecting: "CONECTANDO...",
        accept: "Aceptar",
        cancel: "Cancelar",
    },
    input: {
        title: "Crear",
        placeholder: "Nueva Password",
        placeholder2: "Repetir Password",
        placeholder3: "Password Maestra",
        placeholder4: "Ingrese la nueva Password",
        placeholder5: "¿Nombre de la nueva Password?",
    },
    display: {
        emptyboxpassword: 'Nada que mostrar',
        emptyboxpassword2: 'Aquí se mostrarán sus Passwords',
        copyPasswordOk: 'Password copiada!',
        createdok: 'Password creada correctamente',
        fieldsmandatory: 'Campo obligatorio',
        accountinfo1: 'Bloqueo',
        blockboxpassword: 'Bloqueo activado',
        blockboxpassword2: 'Debe ingresar la frase de bloqueo para ver sus passwords',
        unblockpass: 'Password bloqueada',
        eliminar: "¿Eliminar?",
        borrar: "Borrar",
        cancel: "Cancelar",
        edit: "Editar",
        unblockpassinput: "Ingrese su frase de bloqueo",
        createpassblock: "¡Rayos! Debe crear una frase de bloqueo primero...",
        searchfilter: "Buscar Password...",
    },
    modalblock: {
        title: "Frase de Bloqueo",
        content1: "Mantenga seguras sus passwords. Introduzca una palabra o frase que pueda recordar. NO LA OLVIDE, no podrá recuperar sus datos sin la frase.",
        content2: "Ingrese su frase de bloqueo para desbloquear las passwords.",
        content3: "La frase debe tener al menos 8 caracteres.",
        content4: "Ingrese su frase de bloqueo para bloquear las passwords.",
        placeholder1: "Ingrese su frase de bloqueo",
        placeholder2: "Repita su frase de bloqueo",
        close: "Cerrar",
        block: "Guardar y Bloquear",
        error: "Las frases no coinciden, están vacías o son inferiores a 8 caracteres.",
        errorunblock: "¡Rayos!, frase incorrecta...",
        unblock: "Desbloquear",
        block2: "Bloquear",
    },
    modalport: {
        title: "Importar / Exportar",
        info: "Aquí podrá importar y exportar sus contraseñas de manera rápida y segura.",
        password: "Passwords",
        importlabel: "Importar",
        exportlabel: "Exportar",
        importbutton: "IMPORTAR PASSWORDS",
        exportbutton: "EXPORTAR PASSWORDS",
        extracting: "Extrayendo espere un momento...",
        successimport: "Passwords recuperadas",
        success: "¡EXITO!",
        exportwithblock: "Exportar con bloqueo",
        yes: "Sí",
        no: "No",
        blockphraseplaceholder: "Confirme su frase de bloqueo",
        errorblockphrase: "Debe ingresar la frase de bloqueo",
        errornopasswords: "¡Rayos! No hay passwords para exportar",
        errornoblockpass: "Debe crear una frase de bloqueo para exportar",
        successexport: "¡Exportación exitosa!",
        exporterror: "Error al exportar las passwords",
        infoerror: "Password o datos incorrectos",
        warnimport: "¡Atención! Las passwords importadas se agregarán a las ya existentes.",
        warnimportdos: "Si importa un archivo con bloqueo, necesitará la frase de bloqueo para desbloquearlas o no podrá verlas.",
    },
    modalrequired: {
        required: "¡Acción Requerida! ",
        messageone: "Debe ingresar su frase de bloqueo para cargar sus passwords.",
        invalidphrase: "Frase de bloqueo inválida.",
    },
    mid_text: "••• Passwords •••",
    loading: "Cargando...",
    errorunexpected: "Error inesperado...",
    toolspassword: {
        copied: "¡Password copiada!",
        edit: "Editar Password",
        delete: "Eliminar Password",
        success: "¡Hecho! ツ",
        repeat: "Repita la Password",
        notmatch: "No coinciden",
        enternew: "Ingrese nueva Pass",
        error: "Error al copiar la pass...",
    },
}

export { MESSAGE_ES };