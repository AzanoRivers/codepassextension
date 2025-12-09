import { useState, useEffect, useRef, useCallback } from 'react';
import { IconRobotHappy } from '@icons/IconRobotHappy';
import { ModalGeneric } from '@components/ModalGeneric';
import { LoaderGeneric } from '@components/LoaderGeneric';
import { useModalPort } from '@hooks/useModalPort';
import { useImportPasswords } from '@hooks/useImportPasswords';
import { ButtonGeneric } from '@components/ButtonGeneric';
import { useExportPasswords } from '@hooks/useExportPasswords';
import { InputGeneric } from '@components/InputGeneric';
import { MESSAGE_ES } from '@utils/Message';
import toast from 'react-hot-toast';


export const ModalPort = () => {
    // [STATES & HOOKS]
    const { showModalPort, toggleModalPort } = useModalPort();

    const [importSuccess, setImportSuccess] = useState(false);
    const [exportWithBlock, setExportWithBlock] = useState(false);
    const [fileName, setFileName] = useState('');
    const [invalidFile, setInvalidFile] = useState(false);
    const [actionType, setActionType] = useState('import'); // 'import' o 'export'
    const [isLoading, setIsLoading] = useState(false);
    const [inputBlockPhrase, setInputBlockPhrase] = useState('');
    const { fileToString, dataPasswordFile, onLoadImportFile, errorStatus, setErrorStatus } = useImportPasswords();
    const { exportWithBlockPasswords, exportWithoutBlockPasswords, isLoadingExport } = useExportPasswords();
    const inputBlockPhraseRef = useRef(null);
    const fileInputRef = useRef(null);
    // [FUNCTIONS]
    //const MODAL_ACTION = () => { console.log('Acción Modal Port') };
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setImportSuccess(false);
        setErrorStatus(false); // Resetear error al cargar nuevo archivo
        if (file) {
            let fileName = file.name;
            if (file.type !== 'text/plain') {
                fileName = 'Archivo inválido, solo .txt';
                setInvalidFile(true);
            } else {
                if (fileName.length > 14) {
                    fileName = fileName.slice(0, 15) + '...[txt]';
                    const nameWithoutExtension = fileName.slice(0, fileName.lastIndexOf('.'));
                    const extension = fileName.slice(fileName.lastIndexOf('.'));
                    fileName = nameWithoutExtension.slice(0, 12) + '...' + extension;
                }
                fileToString(file);
                setInvalidFile(false);
                setIsLoading(true);
            }
            setFileName(fileName);
        }
        // Resetear el input para permitir cargar el mismo archivo nuevamente
        if (event.target) {
            event.target.value = '';
        }
    };
    const onLabelAction = (event) => {
        if (isLoading) {
            return;
        }
        setIsLoading(false);
        setImportSuccess(false);
        const action = event.currentTarget.getAttribute('data-action');
        setActionType(action);
    };
    const resetStates = useCallback(() => {
        setFileName('');
        setInvalidFile(false);
        setActionType('import');
        setIsLoading(false);
        setInputBlockPhrase('');
        setExportWithBlock(false);
        setErrorStatus(false);
        setImportSuccess(false);
    }, [setErrorStatus]);
    const onExportPasswords = () => {
        // Lógica para exportar passwords
        // console.log('Exportando...');
        if (exportWithBlock) {
            if (!inputBlockPhrase) {
                toast.error(MESSAGE_ES.modalport.errorblockphrase, { position: 'bottom-center', duration: 3000, });
                inputBlockPhraseRef.current.focus();
                return;
            } else {
                exportWithBlockPasswords({ blockPhrase: inputBlockPhrase });
                setInputBlockPhrase('');
            }
        } else {
            exportWithoutBlockPasswords();
        }
    };
    const onChangeExportRadios = (event) => {
        const value = event.target.value;
        if (value === 'yes') {
            setExportWithBlock(true);
            inputBlockPhraseRef.current.focus();
        } else {
            setExportWithBlock(false);
        }
        setInputBlockPhrase('');
    };
    // [EFFECTS]
    useEffect(() => {
        if (!showModalPort) {
            resetStates();
        }
    }, [showModalPort, resetStates]);
    useEffect(() => {
        if (!onLoadImportFile && isLoading && dataPasswordFile !== '') {
            setIsLoading(false);
            if (!errorStatus) {
                setImportSuccess(true);
            } else {
                // Si hay error, limpiar fileName para permitir reintento
                setFileName('');
            }
        }
    }, [onLoadImportFile, isLoading, dataPasswordFile, errorStatus]);
    // efecto para vigilar el cambio de actionType, cuando cambie de import a export reinicia el estado de export
    useEffect(() => {
        if (actionType === 'import') {
            setExportWithBlock(false);
        }
        setErrorStatus(false);
    }, [actionType, setErrorStatus]);
    // [RENDER]
    return (
        (showModalPort) && (
            <ModalGeneric action={toggleModalPort} show={showModalPort} mode={"middle"}
                type="info" buttonText={`Cerrar`} overaction={toggleModalPort} >
                <div className='h-full w-full flex flex-col items-center justify-between gap-2'>
                    <header className='h-[20%] w-full flex-center'>
                        <IconRobotHappy className="h-full w-auto mb-4" />
                    </header>
                    <div className='flex-center h-[15%] w-full flex-col gap-0'>
                        <h5 className='text-white font-orbitron-normal text-center text-lg'>
                            {MESSAGE_ES.modalport.title}
                        </h5>
                        <h4 className='text-white font-orbitron-normal text-center text-lg'>
                            {MESSAGE_ES.modalport.password}
                        </h4>
                    </div>
                    <span className='flex-center h-[20%] w-full text-white font-barlownormal text-center text-base'>
                        {MESSAGE_ES.modalport.info}
                    </span>
                    <div className='flex h-[45%] w-full justify-start flex-col items-center gap-1'>
                        <div className='w-full h-max flex justify-start items-center relative flex-col'>
                            {/* centrado en x absoluto*/}
                            <label data-action="import" onClick={onLabelAction}
                                className={`absolute min-h-8 top-0 left-3 w-max text-lg text-center font-barlownormal px-6 cursor-pointer transition-all ${actionType !== 'import' ? 'border-transparent border-2 text-gray-400' : 'border-action-nobottom'}`}
                            >
                                {MESSAGE_ES.modalport.importlabel}
                            </label>
                            <label data-action="export" onClick={onLabelAction}
                                className={`absolute min-h-8 top-0 right-3 w-max text-lg text-center font-barlownormal px-6 cursor-pointer transition-all ${actionType !== 'export' ? 'border-transparent border-2 text-gray-400' : 'border-action-nobottom'}`}>
                                {MESSAGE_ES.modalport.exportlabel}
                            </label>
                            {actionType === 'import'
                                ? (<input ref={fileInputRef} id="file-upload" name="file-upload" type="file" accept=".txt" required
                                    className="peer block mt-8 w-full max-w-[90%] text-transparent file:min-w-full file:min-h-10 file:text-sm file:font-medium border-action"
                                    placeholder='Importar Passwords'
                                    {...(isLoading && { disabled: true })}
                                    onChange={handleFileChange} />)
                                : (
                                    <div className='w-full h-max mt-8 flex-center flex-col border-action max-w-[90%] py-2 transition-all duration-300'>
                                        <div className='w-100 h-max max-h-12 flex-center flex-col mb-2 transition-all duration-300 overflow-hidden'>
                                            <div className='h-full w-full flex-center gap-1 mb-2'>
                                                <span className='text-white font-barlownormal text-center text-sm mr-2'>{MESSAGE_ES.modalport.exportwithblock}</span>
                                                <input type="radio" id="exportNo" name="exportOption" value="no" defaultChecked onChange={onChangeExportRadios} />
                                                <label htmlFor="exportNo" className='text-white font-barlownormal text-center text-base px-1'>{MESSAGE_ES.modalport.no}</label>
                                                <input type="radio" id="exportYes" name="exportOption" value="yes" onChange={onChangeExportRadios} />
                                                <label htmlFor="exportYes" className='text-white font-barlownormal text-center text-base px-1'>{MESSAGE_ES.modalport.yes}</label>
                                            </div>
                                            <div className={`w-full transition-all duration-300 overflow-hidden ${!exportWithBlock ? 'h-0 max-h-0' : 'h-10 max-h-10'}`}>
                                                <InputGeneric
                                                    keydownaction={onExportPasswords}
                                                    ref={inputBlockPhraseRef}
                                                    type="password"
                                                    value={inputBlockPhrase}
                                                    onChange={(e) => setInputBlockPhrase(e.target.value)}
                                                    className={`w-full h-full text-sm transition-opacity duration-300 ${(exportWithBlock) ? 'opacity-100' : 'opacity-0'}`}
                                                    placeholder={MESSAGE_ES.modalport.blockphraseplaceholder}
                                                />
                                            </div>
                                        </div>
                                        <ButtonGeneric
                                            text={(isLoadingExport) ? MESSAGE_ES.loading : MESSAGE_ES.modalport.exportbutton}
                                            className="py-1 px-3 w-max min-w-[170px]" light={true} action={onExportPasswords}
                                        />
                                    </div>
                                )}
                            <p className={`w-full text-center truncate text-sm ${invalidFile ? 'invisible' : 'visible'} peer-valid:visible ${invalidFile ? 'text-red-500' : 'text-green-400'}`}>{`${fileName}`}</p>
                            {/* loader */}
                            {isLoading && (
                                <div className='flex-center flex-col gap-2 w-full h-max pt-1 text-yellow-300'>
                                    <LoaderGeneric />
                                    <span className='text-sm'>{MESSAGE_ES.modalport.extracting}</span>
                                </div>
                            )}
                            {/* success */}
                            {importSuccess && (
                                <div className='flex-center flex-col w-full h-max pt-1 text-green-400'>
                                    <span className='text-lg font-barlow-bold'>{MESSAGE_ES.modalport.success}</span>
                                    <span className='text-sm'>{MESSAGE_ES.modalport.successimport}</span>
                                </div>
                            )}
                            {errorStatus && (
                                <div className='flex-center flex-col w-full h-max pt-1 text-red-500'>
                                    <span className='text-lg font-barlow-bold'>{MESSAGE_ES.modalport.exporterror}</span>
                                    <span className='text-base font-barlownormal'>{MESSAGE_ES.modalport.infoerror}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </ModalGeneric>
        )
    )
}