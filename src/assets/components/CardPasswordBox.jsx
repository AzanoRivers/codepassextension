import { useState, useRef, useEffect } from "react";
import { IconMenuPoints } from "@icons/IconMenuPoints";
import { IconEye } from "@icons/IconEye";
import { IconEdit } from "@icons/IconEdit";
import { IconLock } from "@icons/IconLock";
import { IconTrash } from "@icons/IconTrash";
import { SelectConfirmation } from "@components/SelectConfirmation";
import { SelectEdit } from "@components/SelectEdit";
import { SelectView } from "@components/SelectView";
import { SelectBlock } from "@components/SelectBlock";
import { MESSAGE_ES } from '@utils/Message';
import { useToolsPassword } from "@hooks/useToolsPassword";
import { decryptWithPassphrase } from "@utils/EncodePayload.js";
import toast from "react-hot-toast";
import PropTypes from 'prop-types';
const CardPasswordBox = ({ name, pass, namekey, datablock }) => {
    const [swapState, setSwapState] = useState(false);
    const [blockCard, setBlockCard] = useState(datablock || false);
    const refCopySuccess = useRef(false);
    const refSwap = useRef(false);
    const NAME = `${name}` || "TestXxX";
    const PSS = `${pass}` || "";
    const {
        confirmDelete,
        setDeleteConfirmation,
        confirmEdit,
        setEditConfirmation,
        setPassword,
        confirmView,
        setViewConfirmation,
        getNamekeyPasswordElement,
        setBlockPassword,
        blockConfirm,
        setBlockConfirmation,
        getPassBlock,
        validateNotEmptyPassBlock
    } = useToolsPassword();
    const NAME_DISPLAY = NAME.length > 27 ? `${NAME.slice(0, 25)}...` : NAME;
    // [FUNCTIONS]
    const clickCard = (event) => {
        if (blockCard || blockConfirm) {
            //console.log('Bloqueado, no se hace nada 1', blockCard, '---', blockConfirm);
            return;
        }
        // Hace swap de la tarjeta y copia la contraseña al portapapeles
        if (refCopySuccess.current) {
            //console.log('Bloqueado, no se hace nada 2 por swap');
            return;
        }
        refCopySuccess.current = true;
        const MAX_DEPTH = 5;
        let currentNode = event.target;
        let articleElement = false;
        if (event.target.classList?.contains("iconAction")) {
            //console.log('Bloqueado, no se hace nada 3 por iconAction');
            return;
        }
        for (let i = 0; i < MAX_DEPTH && currentNode; i++) {
            if (currentNode.nodeName === "ARTICLE") {
                articleElement = true;
                break;
            }
            if (currentNode.classList?.contains("iconAction")) {
                return;
            }
            currentNode = currentNode.parentNode;
        }
        if (!articleElement || swapState) {
            return;
        }
        // Rescatamos atributo  data-pss y luego lo copiamos al portapapeles
        const password = event.currentTarget.getAttribute("data-pss");
        // desencriptamos la contraseña antes de copiar
        const decryptPassword = async (password) => {
            try {
                const TIME_TOKEN = await chrome.storage.local.get('temporalsesionpass');
                const decrypted = await decryptWithPassphrase(password, TIME_TOKEN.temporalsesionpass);
                return decrypted || '';
            } catch (error) {
                //console.log("Error decrypting password:", error);
                return '';
            }
        };
        if (password) {
            decryptPassword(password).then(decryptedPassword => {
                navigator.clipboard.writeText(decryptedPassword).then(() => {
                    toast.success(MESSAGE_ES.display.copyPasswordOk, { position: 'bottom-center', duration: 1000, });
                }).catch(err => {
                    //console.error("Error al copiar la contraseña:", err);
                    console.log(err);
                    
                });
            });
        } else {
            //console.log("No se encontró el atributo data-pss en el elemento.");
        }
        setTimeout(() => {
            refCopySuccess.current = false;
        }, 500);
    }
    const onClickIcon = (event) => {
        // Identifica el icono que se ha pulsado y ejecuta la acción correspondiente
        event.stopPropagation();
        const menuSwapNode = event.target.closest(".menuSwap");
        if (menuSwapNode) {
            if (refSwap.current) return;
            refSwap.current = true;
            setSwapState(prev => !prev);
            setDeleteConfirmation(false)
            setEditConfirmation(false);
            setViewConfirmation(false);
            setTimeout(() => {
                refSwap.current = false;
                refCopySuccess.current = false; // Fix Bug en copy
            }, 290);
        } else {
            const iconActionNode = event.target.closest(".iconAction");
            switch (iconActionNode.classList.length > 0) {
                case iconActionNode.classList.contains("iconEye"):
                    if (!confirmView) {
                        setViewConfirmation(true);
                    }
                    break;
                case iconActionNode.classList.contains("iconEdit"):
                    if (!confirmEdit) {
                        setEditConfirmation(true);
                    }
                    break;
                case iconActionNode.classList.contains("iconLock"):
                    onBlockPass(event);
                    break;
                case iconActionNode.classList.contains("iconTrash"):
                    if (!confirmDelete) {
                        setDeleteConfirmation(true);
                    }
                    break;
            }
        }
    };
    const onDeletePass = () => {
        refCopySuccess.current = null;
        refSwap.current = null;
        setDeleteConfirmation(false);
        setSwapState(false);
    }
    const onEditPass = (params) => {
        const { namekey, newPassword } = params;
        setPassword({ namekey, newPassword });
        setTimeout(() => {
            refCopySuccess.current = null;
            refSwap.current = null;
            setEditConfirmation(false);
            setSwapState(false);
        }, 1200);
    }
    const onBlockPass = (event) => {
        const isValirPassBlock = validateNotEmptyPassBlock();
        if (!isValirPassBlock) {
            toast.error(MESSAGE_ES.display.createpassblock, { position: 'bottom-center', duration: 2000, });
            return;
        }
        const ELEMENT_PASSWORD = getNamekeyPasswordElement(event);
        setBlockConfirmation(true);
        setBlockPassword({ namekey: ELEMENT_PASSWORD, status: true });
    }
    const onUnblockPass = ({ namePass = "", passInput = "" }) => {
        if (namePass === "" || passInput === "") {
            return;
        }
        const GO_TO_VALIDATE = async () => {
            // Desencriptamos la passblock para comparar
            try {
                const CONTEXT_BLOCK_PASS_64 = getPassBlock();
                const decrypted = await decryptWithPassphrase(CONTEXT_BLOCK_PASS_64, passInput);
                const isValid = passInput === decrypted;
                if (isValid) {
                    setBlockConfirmation(false);
                    setSwapState(false);
                    refCopySuccess.current = null;
                    refSwap.current = null;
                    setBlockPassword({ namekey: namePass, status: false });
                    setBlockCard(false);
                } else {
                    toast.error(MESSAGE_ES.modalblock.errorunblock, { position: 'bottom-center', duration: 2000, });
                }
            } catch (error) {
                toast.error(MESSAGE_ES.modalblock.errorunblock, { position: 'bottom-center', duration: 2000, });
            }
        };
        GO_TO_VALIDATE();
    }
    // [EFFECTS Desmontaje]
    useEffect(() => {
        // Desmontaje
        return () => {
            refSwap.current = null;
            refCopySuccess.current = null;
        }
    }, []);
    useEffect(() => {
        if (datablock) {
            setBlockCard(datablock || false);
            setSwapState(false);
        }
    }, [datablock]);
    // [STYLES]
    const STYLES_CARD = `w-95p max-w-95p h-12 min-h-12 bg-lightblue-50 border-action p-2 group cursor-pointer overflow-hidden relative`;
    const SWAP_CONTAINER = `${(confirmDelete || confirmEdit || confirmView) ? ((!confirmEdit && !confirmView) ? 'translate-x-[-80%]' : (confirmEdit && !confirmView) ? 'translate-x-[-70%]' : 'translate-x-[-61%]') : 'translate-x-[-53%]'}`;
    // [RENDER]
    return (
        <article onClick={clickCard} data-pss={(!blockCard) ? PSS : ''} data-name={namekey} className={STYLES_CARD}>
            <div className="w-full h-full overflow-hidden">
                {/* Wrapper desplazable */}
                {(!blockCard) && (
                    <div className={`flex w-[200%] h-full transition-transform duration-300 ${(swapState) ? SWAP_CONTAINER : ''}`}>
                        <div className="flex items-center justify-start min-w-[280px] max-w-[280px] w-[100%] h-full border-action-right pr-4">
                            <span className="font-barlownormal text-xl white-1 group-hover:scale-95 transition-all duration-300 select-none">
                                {NAME_DISPLAY}
                            </span>
                        </div>
                        <div className={`flex items-center justify-start w-[100%] h-full gap-6 pl-4 transition-opacity duration-300 ${(swapState) ? 'opacity-100' : 'opacity-0'}`}>
                            <IconLock className="h-6 w-6 white-1 iconAction iconLock hover:scale-[80%]" action={onClickIcon} />
                            {/* <IconEye className="h-6 w-6 white-1 iconAction iconEye hover:scale-90" action={onClickIcon} /> */}
                            {confirmView
                                ? <SelectView cancel={() => setViewConfirmation(false)} encryptedPassword={PSS} />
                                : <IconEye className="h-6 w-6 white-1 iconAction iconEye hover:scale-90" action={onClickIcon} />
                            }
                            {confirmEdit
                                ? <SelectEdit dataName={namekey} confirm={onEditPass} cancel={() => setEditConfirmation(false)} />
                                : <IconEdit className="h-6 w-6 white-1 iconAction iconEdit hover:scale-90" action={onClickIcon} />
                            }
                            {!confirmDelete
                                ? <IconTrash className="h-6 w-6 white-1 iconAction iconTrash hover:scale-90" action={onClickIcon} />
                                : <SelectConfirmation confirm={() => onDeletePass()} cancel={() => setDeleteConfirmation(false)} />
                            }
                        </div>
                    </div>
                )}
                {(blockCard) && (
                    <SelectBlock action={onUnblockPass} />
                )}
            </div>
            {(!blockCard) && (
                <div className={`absolute right-2 top-1/2 transition-transform duration-200 transform -translate-y-1/2 ${swapState ? 'rotate-[-30deg]' : ''}`}>
                    <IconMenuPoints className={`h-10 w-10 white-1 iconAction menuSwap`} action={onClickIcon} />
                </div>
            )}
        </article>
    );


};
CardPasswordBox.propTypes = {
    name: PropTypes.string.isRequired,
    pass: PropTypes.string,
    namekey: PropTypes.string.isRequired,
    datablock: PropTypes.bool,
};
export { CardPasswordBox };