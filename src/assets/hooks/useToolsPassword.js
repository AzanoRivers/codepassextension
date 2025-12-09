import { useState, useContext } from "react";
import { CodePassContext } from '@contexts/CodepassContext';
import { useSyncDrive } from '@hooks/useSyncDrive';

const useToolsPassword = () => {
    // [STATES]
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [confirmEdit, setConfirmEdit] = useState(false);
    const [confirmView, setConfirmView] = useState(false);
    const [blockConfirm, setBlockConfirm] = useState(false);
    const context = useContext(CodePassContext);
    const { removePasswordContext, updatePasswordByName, blockPassword, getPassBlock } = context;
    const { syncPasswordsToDrive } = useSyncDrive(context);
    // [FUNCTIONS]
    const setDeleteConfirmation = (value) => {
        // Activamos o desactivamos la confirmacion de borrado
        setConfirmDelete((prev) => (typeof value === "boolean" ? value : prev));
    };
    const deletePassword = (event) => {
        const ELEMENT_EVENT = typeof event.composedPath === "function"
            ? event.composedPath()[0]
            : event.target;
        if (ELEMENT_EVENT && ELEMENT_EVENT.textContent?.trim() === "Borrar") {
            const container = ELEMENT_EVENT instanceof Element ? ELEMENT_EVENT.closest("[data-name]") : null;
            if (container) {
                const NAME_PASS = container.getAttribute("data-name");
                // Logica de borrado
                if (NAME_PASS) {
                    document.startViewTransition?.(() => {
                        removePasswordContext(NAME_PASS);
                    });
                    setConfirmDelete(false);
                    // Sincronizar con Drive después de eliminar
                    setTimeout(() => {
                        syncPasswordsToDrive();
                    }, 500);
                } else {
                    // console.log('NO HAY PASSWORD PARA ELIMINAR');
                }
            } else {
                console.warn("No se encontró ningún ancestro con [data-name].");
            }
        }
    };
    const setEditConfirmation = (value) => {
        // Activamos o desactivamos la confirmacion de edicion
        setConfirmEdit((prev) => (typeof value === "boolean" ? value : prev));
    };
    const setPassword = (params) => {
        const { namekey, newPassword } = params;
        // Actualiza la contraseña de un password existente
        if (!namekey || !newPassword) {
            // console.log('setPassword: Nombre o nueva contraseña no proporcionados');
            return;
        }
        updatePasswordByName({ namekey, newPassword });
        
        // Sincronizar con Drive después de editar
        setTimeout(() => {
            syncPasswordsToDrive();
        }, 500);
    };
    const setViewConfirmation = (value) => {
        // Activamos o desactivamos la confirmacion de vista
        setConfirmView((prev) => (typeof value === "boolean" ? value : prev));
    };
    const getNamekeyPasswordElement = (event) => {
        const ELEMENT_EVENT = typeof event.composedPath === "function"
            ? event.composedPath()[0]
            : event.target;
        if (ELEMENT_EVENT) {
            const container = ELEMENT_EVENT instanceof Element ? ELEMENT_EVENT.closest("[data-name]") : null;
            if (container) {
                return container.getAttribute("data-name") || '';
            } else {
                console.warn("No se encontró ningún ancestro con [data-name].");
                return '';
            }
        }
        return '';
    };
    const setBlockPassword = (params) => {
        const { namekey, status } = params;
        // Actualiza el estado de bloqueo de una contraseña
        if (!namekey) {
            // console.log('setBlockPassword: Nombre no proporcionado');
            return;
        }
        blockPassword({ namekey, status });
    };
    const validateNotEmptyPassBlock = () => {
        const CONTEXT_PASS = getPassBlock();
        return CONTEXT_PASS.trim() !== '';
    }
    const setBlockConfirmation = (value) => {
        // Activamos o desactivamos la confirmacion de bloqueo
        setBlockConfirm((prev) => (typeof value === "boolean" ? value : prev));
    };
    // [HOOKS & STATES]
    return {
        confirmDelete, setDeleteConfirmation, deletePassword, confirmEdit, setEditConfirmation,
        setPassword, confirmView, setViewConfirmation, setBlockPassword, getNamekeyPasswordElement,
        blockConfirm, setBlockConfirmation, validateNotEmptyPassBlock, getPassBlock
    };

};
export { useToolsPassword };