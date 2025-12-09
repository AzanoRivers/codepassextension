/**
 * @component <LogoutButton />
 * @example <LogoutButton />
 * @description Botón que elimina los tokens guardados en chrome.storage.local y cierra la sesión.
 * @description Usa el hook useLogin() para cambiar el estado global de login al hacer logout.
 * @returns {JSX.Element} Un botón con estilo y texto de cierre de sesión.
*/
import { MESSAGE_ES } from "@utils/Message";
import { useLogin } from "@hooks/useLogin";

const LogoutButton = () => {
    const [, setLogin] = useLogin();
    const disconnectGoogle = () => {
        setLogin(false);
    }
    return (
        <button onClick={disconnectGoogle} className="w-full h-max font-orbitron-normal text-xl hover:font-bold no-select">
            {MESSAGE_ES.buttons.logout}
        </button>
    );
};
export { LogoutButton }