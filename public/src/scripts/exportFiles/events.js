//import {generateFile } from "../tools";
export const exportEventPdf = (ar, start, end) => {
    // @ts-ignore
    window.jsPDF = window.jspdf.jsPDF;
    // @ts-ignore
    var doc = new jsPDF('l');
    doc.setDrawColor(0, 0, 128);
    doc.setFont(undefined, 'bold');
    doc.text(10, 20, `Eventos desde ${start} hasta ${end}`);
    doc.setFontSize(10);
    //construimos cabecera del csv
    doc.text(10, 30, "Fecha");
    doc.text(30, 30, "Hora");
    doc.text(50, 30, "Usuario");
    doc.text(90, 30, "Título");
    doc.text(140, 30, "Descripción");
    doc.line(10, 35, 290, 35);
    let row = 40;
    let lineas = 0;
    let pagina = 1;
    doc.text(10, 200, `Página # ${pagina}`);
    //resto del contenido
    for (let i = 0; i < ar.length; i++) {
        let event = ar[i];
        // @ts-ignore
        if (event.creationDate >= start && event.creationDate <= end) {
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            doc.text(10, row, `${event.creationDate}`);
            doc.text(30, row, `${event.creationTime}`);
            doc.text(50, row, `${event.user.firstName} ${event.user.lastName}`);
            doc.text(90, row, `${event.title.split("\n").join("(salto)")}`);
            doc.text(140, row, `${event.description.split("\n").join("(salto)")}`);
            row += 5;
            if (lineas >= 30) {
                doc.addPage();
                lineas = 0;
                row = 30;
                pagina += 1;
                doc.setFont(undefined, 'bold');
                doc.setFontSize(10);
                //construimos cabecera del csv
                doc.text(10, 20, "Fecha");
                doc.text(30, 20, "Hora");
                doc.text(50, 20, "Usuario");
                doc.text(90, 20, "Título");
                doc.text(140, 20, "Descripción");
                doc.line(10, 25, 290, 25);
                doc.text(10, 200, `Página # ${pagina}`);
            }
            lineas++;
        }
    }
    // Save the PDF
    var d = new Date();
    var title = "log_Eventos_" + d.getDate() + "_" + (d.getMonth() + 1) + "_" + d.getFullYear() + `.pdf`;
    doc.save(title);
};
export const exportEventCsv = (ar, start, end) => {
    let rows = [];
    for (let i = 0; i < ar.length; i++) {
        let event = ar[i];
        // @ts-ignore
        if (event.creationDate >= start && event.creationDate <= end) {
            let obj = {
                "Título": `${event.title.split("\n").join("(salto)")}`,
                "Fecha": `${event.creationDate}`,
                "Hora": `${event.creationTime}`,
                "Usuario": `${event.user.firstName} ${event.user.lastName}`,
                "Descripción": `${event.description.split("\n").join("(salto)")}`
            };
            rows.push(obj);
        }
    }
    generateFile(rows, "Eventos", "csv");
};
export const exportEventXls = (ar, start, end) => {
    let rows = [];
    for (let i = 0; i < ar.length; i++) {
        let event = ar[i];
        // @ts-ignore
        if (event.creationDate >= start && event.creationDate <= end) {
            let obj = {
                "Título": `${event.title.split("\n").join("(salto)")}`,
                "Fecha": `${event.creationDate}`,
                "Hora": `${event.creationTime}`,
                "Usuario": `${event.user.firstName} ${event.user.lastName}`,
                "Descripción": `${event.description.split("\n").join("(salto)")}`
            };
            rows.push(obj);
        }
    }
    generateFile(rows, "Eventos", "xls");
};
const generateFile = (ar, title, extension) => {
    //comprobamos compatibilidad
    if (window.Blob && (window.URL || window.webkitURL)) {
        var contenido = "", d = new Date(), blob, reader, save, clicEvent;
        //creamos contenido del archivo
        for (var i = 0; i < ar.length; i++) {
            //construimos cabecera del csv
            if (i == 0)
                contenido += Object.keys(ar[i]).join(";") + "\n";
            //resto del contenido
            contenido += Object.keys(ar[i]).map(function (key) {
                return ar[i][key];
            }).join(";") + "\n";
        }
        //creamos el blob
        blob = new Blob(["\ufeff", contenido], { type: `text/${extension}` });
        //creamos el reader
        // @ts-ignore
        var reader = new FileReader();
        reader.onload = function (event) {
            //escuchamos su evento load y creamos un enlace en dom
            save = document.createElement('a');
            // @ts-ignore
            save.href = event.target.result;
            save.target = '_blank';
            //aquí le damos nombre al archivo
            save.download = "log_" + title + "_" + d.getDate() + "_" + (d.getMonth() + 1) + "_" + d.getFullYear() + `.${extension}`;
            try {
                //creamos un evento click
                clicEvent = new MouseEvent('click', {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                });
            }
            catch (e) {
                //si llega aquí es que probablemente implemente la forma antigua de crear un enlace
                clicEvent = document.createEvent("MouseEvent");
                // @ts-ignore
                clicEvent.click();
            }
            //disparamos el evento
            save.dispatchEvent(clicEvent);
            //liberamos el objeto window.URL
            (window.URL || window.webkitURL).revokeObjectURL(save.href);
        };
        //leemos como url
        reader.readAsDataURL(blob);
    }
    else {
        //el navegador no admite esta opción
        alert("Su navegador no permite esta acción");
    }
};
