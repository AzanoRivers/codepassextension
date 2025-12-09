// hook personalizado para cambiar el estado del contexto con setBlockPasswords
import { useContext, useState } from "react";
import { CodePassContext } from "@contexts/CodepassContext";
const useModalBlockpass = () => {
    const [showpasswords, setShowpasswords] = useState(false);
    const { dataCodePass, setBlockPasswords } = useContext(CodePassContext);
    const toggleBlockPass = () => {
        setBlockPasswords(!dataCodePass.blockpasswords);
        setShowpasswords(!showpasswords);
    };
    return { toggleBlockPass, showpasswords };
}
export { useModalBlockpass };