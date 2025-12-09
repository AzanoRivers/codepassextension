/**
 * @component Componente que muestra una pantalla inicial de carga y login con componente <LoginGoogle/>
 * @example simplemente se llama al componente: <Login /> 
 * @description Se usa el provider <GoogleOAuthProvider> para poder usar el botón-login <LoginGoogle/>
 * @returns {JSX.Element} Un elemento JSX que muestra el contenido de carga (consejos) y login con google
*/

import { useEffect } from "react";
import { LoginGoogle } from "@components/LoginGoogle";
import { useLoading } from "@hooks/useLoading";
import { useOpacity } from "@hooks/useOpacity";
import { MESSAGE_ES } from "@utils/Message";

const Login = () => {
    const [loading, setLoading] = useLoading();
    const [opacity, setOpacity] = useOpacity();

    // Effect Loading
    useEffect(() => {
        document.startViewTransition(() => {
            // Simulamos una carga de 3 segundos
            setLoading(true);
        });
    }, [setLoading, setOpacity]);

    // Effect Opacity, controla los tiempos de opacidad para cambios de estado suaves
    useEffect(() => {
        let timerout;
        document.startViewTransition(() => {
            if (loading) {
                timerout = setTimeout(() => {
                    setOpacity(true);
                }, 500);
                timerout = setTimeout(() => {
                    setOpacity(false);
                }, 3500);
            } else {
                timerout = setTimeout(() => {
                    setOpacity(true);
                }, 500);
            }
        });

        return () => clearTimeout(timerout);
    }, [loading, setOpacity])

    return (
        <div className={`h-full w-full bg-darkblue p-4`}>
            <h1 className={`flex-center h-1/5 text-white font-orbitron-title text-4xl animate-fadeIn`}>{MESSAGE_ES.title}</h1>
            <figure className="h-1/4 w-full flex-center animate-fadeIn">
                <img className="w-40 h-auto" src="./img/codelabsv1.svg" alt="Logo CodePass" />
            </figure>
            <div className={`flex-center h-1/5 w-full pt-2 transition-opacity ${loading ? "opacity-0 no-action-pointer" : "opacity-100"}`}>
                <LoginGoogle />
            </div>
            <div className="h-35p flex flex-col gap-8 w-full items-end justify-end">
                <span className={`h-3/5 w-full pt-5 font-barlownormal text-xl text-white transition-opacity duration-500 ${opacity ? "opacity-100" : "opacity-0"}`}>
                    {loading ? MESSAGE_ES.tips[0].description : MESSAGE_ES.tips[1].description}
                </span>
                <span className={`flex h-1/5 w-2/3 rtl text-right items-start font-barlownormal text-base text-white transition-opacity ${opacity ? "opacity-100" : "opacity-0"}`}>
                    {loading ? MESSAGE_ES.tips[0].autor : MESSAGE_ES.tips[1].autor}
                </span>
                <span className={`h-1/5 w-full font-barlownormal text-white transition-opacity duration-500 ${loading ? "opacity-100" : "opacity-0"}`}>
                    {MESSAGE_ES.loading}
                </span>
            </div>
        </div>
    );
};

export { Login };