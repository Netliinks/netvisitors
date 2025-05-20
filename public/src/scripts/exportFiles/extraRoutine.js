//import { getDetails, getSearch } from "../tools.js";
export const exportRoutinePdf = async (ar, start, end) => {
    //let control = await getSearch("service.id", ar.id, "Control")
    // @ts-ignore
    window.jsPDF = window.jspdf.jsPDF;
    // @ts-ignore
    var doc = new jsPDF();
    let listImages = [];
    const listRoutines = ['-2.1564602,-79.8936213', '-2.1549851,-79.8949893', '-2.1520254,-79.8977429', '-2.1496744,-79.9004169', '-2.1482098,-79.9032946', '-2.1476567,-79.906736', '-2.1469948,-79.9113936', '-2.1455394,-79.914659'];
    doc.addImage("./public/src/assets/pictures/header-routine.png", "PNG", 3, 3, 203, 25);
    //doc.setDrawColor(0, 0, 128);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(85, 35, `REPORTE DE RUTINA`);
    doc.setFontSize(10);
    //doc.setDrawColor(0, 0, 128);
    doc.setFillColor(1, 33, 133);
    doc.rect(5, 40, 42, 10, 'F');
    doc.line(5, 40, 205, 40);
    doc.line(5, 40, 5, 50);
    doc.setTextColor(255, 255, 255);
    doc.text(18, 47, "NOMBRE");
    doc.line(5, 50, 205, 50);
    doc.line(205, 40, 205, 50);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.text(50, 47, ar[0].rutina);
    doc.setFillColor(1, 33, 133);
    doc.rect(5, 51, 200, 10, 'F');
    doc.line(5, 51, 205, 51);
    doc.line(5, 51, 5, 61);
    doc.line(5, 61, 205, 61);
    doc.line(205, 51, 205, 51);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text(60, 58, `OBSERVACIONES DESDE ${start} HASTA ${end}`);
    let pagina = 1;
    doc.setTextColor(0, 0, 128);
    doc.text(10, 290, `Página ${pagina}`);
    let index = 0;
    let row = 61;
    //observaciones
    for (let i = 0; i < ar.length; i++) {
        let detail = ar[i];
        i == 0 ? null : index++;
        if (index >= listRoutines.length) {
            index = 0;
        }
        if (detail?.imagen !== '') {
            listImages.push(detail.imagen);
        }
        row += 4;
        //65 75 72 79 82 83 85
        doc.setFontSize(8);
        doc.setFillColor(1, 33, 133);
        doc.rect(5, row, 17, 10, 'F');
        doc.line(5, row, 205, row);
        doc.line(5, row, 5, row + 10);
        doc.line(205, row, 205, row + 10);
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.text(8, row + 7, "ESTADO");
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        doc.text(23, row + 7, detail.estado);
        doc.setFillColor(1, 33, 133);
        doc.rect(41, row, 15, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.text(43, row + 7, "CORDS");
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        doc.text(57, row + 7, listRoutines[index]);
        doc.setFillColor(1, 33, 133);
        doc.rect(112, row, 18, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.text(114, row + 7, "GUARDIA");
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        doc.text(132, row + 7, detail.usuario);
        doc.setFillColor(1, 33, 133);
        doc.rect(5, row + 10, 17, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.text(8, row + 17, "FECHA");
        doc.line(5, row + 10, 205, row + 10);
        doc.line(5, row + 20, 205, row + 20);
        doc.line(5, row + 10, 5, row + 20);
        doc.line(205, row + 10, 205, row + 20);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        doc.text(23, row + 14, detail.fecha);
        doc.text(23, row + 18, detail.hora);
        doc.line(41, row + 10, 41, row + 20);
        var lMargin = 43; //left margin in mm
        var rMargin = 2; //right margin in mm
        var pdfInMM = 205; //210;  // width of A4 in mm
        var paragraph = doc.splitTextToSize(detail.observacion, (pdfInMM - lMargin - rMargin));
        doc.text(lMargin, row + 15, paragraph);
        //doc.text(43, row+17, detail.observacion);
        row += 20;
        if (ar[i + 1] != undefined) {
            if (pagina == 1) {
                if ((row + 24) > 286) {
                    doc.addPage();
                    row = (15 - 4);
                    pagina += 1;
                    doc.setFont(undefined, 'bold');
                    doc.setFontSize(10);
                    doc.setTextColor(0, 0, 128);
                    doc.text(10, 290, `Página ${pagina}`);
                }
            }
            else {
                if ((row + 24) > 296) {
                    doc.addPage();
                    row = (15 - 4);
                    pagina += 1;
                    doc.setFont(undefined, 'bold');
                    doc.setFontSize(10);
                    doc.setTextColor(0, 0, 128);
                    doc.text(10, 290, `Página ${pagina}`);
                }
            }
        }
    }
    if (listImages.length != 0) {
        if (row + 60 > 286) {
            doc.addPage();
            row = 15;
            pagina += 1;
            doc.setFont(undefined, 'bold');
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 128);
            doc.text(10, 290, `Página ${pagina}`);
        }
        else {
            row += 10;
        }
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(102, row, `IMÁGENES`);
        row += 5;
        let column = 5;
        for (let i = 0; i < listImages.length; i++) {
            doc.addImage(listImages[i], "JPEG", column, row, 45, 50);
            column += 51;
            //console.log("row "+row)
            if (column > 200) {
                //console.log("row total "+row)
                if ((row + 65) > 225) {
                    if (listImages[i + 1] != null) {
                        doc.addPage();
                        column = 5;
                        row = 15;
                        pagina += 1;
                        doc.setFont(undefined, 'bold');
                        doc.setFontSize(10);
                        doc.setTextColor(0, 0, 128);
                        doc.text(10, 290, `Página ${pagina}`);
                    }
                }
                else {
                    column = 5;
                    row += 60;
                }
            }
        }
    }
    // Save the PDF
    var d = new Date();
    var title = "Rutina_" + `${ar?.name ?? ''}` + d.getDate() + "_" + (d.getMonth() + 1) + "_" + d.getFullYear() + `.pdf`;
    doc.save(title);
};
