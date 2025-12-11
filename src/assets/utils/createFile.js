// Función CreateFile para crear un archivo plano con extensión .txt usando el parametros (string) y luego lo descarga
export function createFile({ filename, content }) {
    try {
        const element = document.createElement('a');
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        return true;
    } catch (error) {
        //console.log('Error creating file:', error);
        return false;
    }
}