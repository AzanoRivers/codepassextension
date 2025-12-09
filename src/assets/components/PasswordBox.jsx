import { useState } from "react";
import { EmptyPasswordBox } from "@components/EmptyPasswordBox";
import { BlockPasswordBox } from "@components/BlockPasswordBox";
import { CardPasswordBox } from "@components/CardPasswordBox";
import { useCodePass } from '@hooks/useCodePassData';
import { useEffect } from "react";

const PasswordBox = () => {
    // [STATES]
    const [dataCodePass] = useCodePass();
    const [dataPass, setDataPass] = useState(dataCodePass.datapasswords || []);
    // [EFFECTS]
    useEffect(() => {
        // Si hay Filtro no hace nada
        if (dataCodePass.filter && dataCodePass.filter.length > 0) {
            return;
        }
        // Carga inicial de passwords
        if (dataPass <= 1) {            
            document.startViewTransition(() => {
                setDataPass(dataCodePass.datapasswords || []);
            });
        } else {
            setDataPass(dataCodePass.datapasswords || []);
        }
    }, [dataPass, dataCodePass.datapasswords, dataCodePass.filter]);
    useEffect(() => {
        // Controla cuando cambia la key filter en contexto y filtrar passwords
        if (dataCodePass.filter && dataCodePass.filter.length > 0) {
            const filtered = dataCodePass.datapasswords.filter(
                item => item.name.toLowerCase().includes(dataCodePass.filter.toLowerCase())
            );
            document.startViewTransition(() => {
                setDataPass(filtered);
            });
        } else {
            document.startViewTransition(() => {
                setDataPass(dataCodePass.datapasswords || []);
            });
        }
    }, [dataCodePass.filter, dataCodePass.datapasswords]);
    // [RENDER]

    const STYLES_CONTAINER = `${(dataPass.length === 0 || dataCodePass.blockpasswords) ? 'flex-center' : 'flex justify-start items-center pt-1'} w-full h-full flex-col gap-1 mr-1 mb-16 pb-1 overflow-y-auto scroll-invisible border-action bg-lightblue-16 grid-pattern-bg transition-all`
    return (
        <div className={STYLES_CONTAINER}>
            {
                (dataCodePass.blockpasswords && !dataCodePass.manualunblockpass && dataCodePass.passblock !== "") ? (<BlockPasswordBox />) :
                    dataPass.length === 0 ? (<EmptyPasswordBox />) :
                        (dataPass.map((item, index) => (<CardPasswordBox key={`${index}-${item?.namekey}`} name={`${item?.name}`} pass={item?.password} namekey={item?.namekey} datablock={item?.block || false} />)))
            }
        </div>
    );
};

export { PasswordBox };