import { createModernVisitPdf } from "./modernVisitPdf.js";

export const exportVisitPdf = (ar: any, start: any, end: any) => {
    // @ts-ignore
    window.jsPDF = window.jspdf.jsPDF;
    // @ts-ignore
    var doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const totalPagesExp = "{total_pages_count_string}";

    // 1. Calculate Summary Stats
    const stats = {
        total: ar.length,
        finalizado: ar.filter((v: any) => v.visitState?.name === 'Finalizado').length,
        enCurso: ar.filter((v: any) => v.visitState?.name === 'En Curso').length,
        pendiente: ar.filter((v: any) => v.visitState?.name === 'Pendiente').length,
        emergente: ar.filter((v: any) => v.visitState?.name === 'Emergente').length,
    };

    // 2. Group visits by user
    const userCounts = ar.reduce((acc: any, visit: any) => {
        const userName = `${visit.user?.firstName ?? ''} ${visit.user?.lastName ?? ''}`.trim() || visit.user?.username || 'Sistema';
        acc[userName] = (acc[userName] || 0) + 1;
        return acc;
    }, {});

    const now = new Date();
    const timestamp = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    let y = 10;
    let currentPage = 1;

    const drawHeader = () => {
        // Thick blue line at top
        doc.setFillColor(0, 32, 96);
        doc.rect(10, 10, pageWidth - 20, 2, 'F');

        // Logo on the left - Resized to match the tight text block height
        doc.addImage("./public/src/assets/pictures/logo_os.png", "PNG", 10, 16.5, 33, 11);

        // Title and Subtitle - Restored tight vertical spacing
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 32, 96);
        doc.setFontSize(16);
        doc.text("REGISTRO DE VISITAS", 65, 22);

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(150, 150, 150);
        doc.text("Bitácora Digital · Historial de accesos", 65, 27);

        // Date/Time on the right
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Fecha: ${timestamp}`, pageWidth - 10, 25, { align: 'right' });

        // Thin line at the bottom of header
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.1);
        doc.line(10, 32, pageWidth - 10, 32);

        y = 36;
    };

    const drawFooter = (pageNumber: number) => {
        const oldSize = doc.getFontSize();
        const oldColor = doc.getTextColor();

        // Footer background bar
        doc.setFillColor(248, 249, 252);
        doc.rect(10, pageHeight - 15, pageWidth - 20, 10, 'F');

        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont(undefined, 'normal');

        // Left side: Text + Logo
        const footerLeftText = "Registro de Visitas · NetGuard by ";
        doc.text(footerLeftText, 13, pageHeight - 9);
        const textWidth = doc.getTextWidth(footerLeftText);
        // Adjusted height to 3.5mm and y position to align perfectly with the 8pt text
        doc.addImage("./public/src/assets/pictures/logo_n.png", "PNG", 13 + textWidth + 1, pageHeight - 12.1, 14, 3.5);

        // Center: Page number
        doc.text(`Página ${pageNumber}`, pageWidth / 2, pageHeight - 9, { align: 'center' });

        // Right side: Contact info
        doc.text("info@netliinks.com · https://netliinks.com/netguard", pageWidth - 13, pageHeight - 9, { align: 'right' });

        doc.setFontSize(oldSize);
        doc.setTextColor(oldColor[0], oldColor[1], oldColor[2]);
    };

    const drawSecondaryHeader = () => {
        // Thick blue line at top
        doc.setFillColor(0, 32, 96);
        doc.rect(10, 10, pageWidth - 20, 2, 'F');

        // Light gray bar
        doc.setFillColor(248, 249, 252);
        doc.rect(10, 12, pageWidth - 20, 6, 'F');

        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 32, 96);
        doc.text("NETGUARD", 15, 16.5);

        doc.setFont(undefined, 'normal');
        doc.setTextColor(150, 150, 150);
        doc.text(" · VIGIA · OCEANSECURITY MATRIZ", 32, 16.5);

        y = 22;
    };

    const drawSectionTitle = (title: string) => {
        doc.setFillColor(0, 32, 96);
        doc.rect(10, y, 1.2, 4, 'F');
        doc.setFontSize(9);
        doc.setTextColor(0, 32, 96);
        doc.setFont(undefined, 'bold');
        doc.text(title, 13, y + 3.2);

        if (title === "BITÁCORA DE VISITAS") {
            doc.setFontSize(7.5);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(150, 150, 150);
            doc.text(`${stats.total} registros`, pageWidth - 10, y + 3.2, { align: 'right' });
        }

        y += 7;
    };

    const drawSummaryCards = () => {
        const containerWidth = pageWidth - 20;
        const containerHeight = 18;
        const cardWidth = containerWidth / 5;

        doc.setFillColor(248, 249, 252);
        doc.setDrawColor(235, 235, 235);
        doc.roundedRect(10, y, containerWidth, containerHeight, 1.5, 1.5, 'FD');

        const cards = [
            { label: 'Total Registros', value: stats.total, color: [70, 70, 70] },
            { label: 'Finalizado', value: stats.finalizado, color: [40, 167, 69] },
            { label: 'En Curso', value: stats.enCurso, color: [0, 123, 255] },
            { label: 'Pendiente', value: stats.pendiente, color: [255, 193, 7] },
            { label: 'Emergente', value: stats.emergente, color: [220, 53, 69] }
        ];

        cards.forEach((card: any, index: number) => {
            const x = 10 + (index * cardWidth);
            if (index > 0) {
                doc.setDrawColor(230, 230, 230);
                doc.setLineWidth(0.1);
                doc.line(x, y + 3, x, y + containerHeight - 3);
            }
            doc.setTextColor(120, 120, 120);
            doc.setFontSize(6.5);
            doc.setFont(undefined, 'normal');
            doc.text(card.label.toUpperCase(), x + (cardWidth / 2), y + 6, { align: 'center' });
            doc.setTextColor(card.color[0], card.color[1], card.color[2]);
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text(card.value.toString(), x + (cardWidth / 2), y + 14, { align: 'center' });
        });
        y += containerHeight + 6;
    };

    const drawPeriodDetails = () => {
        drawSectionTitle("DETALLE DEL PERIODO");
        const gridWidth = pageWidth - 20;
        const cellWidth = gridWidth / 2;
        const cellHeight = 7;
        const labelWidth = 30; // Fixed width for labels

        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.15);

        // Main container with rounded corners
        doc.roundedRect(10, y, gridWidth, cellHeight * 2, 1.5, 1.5, 'D');

        // Row 1: Label Backgrounds
        doc.setFillColor(248, 250, 252);
        doc.rect(10.1, y + 0.1, labelWidth - 0.1, cellHeight - 0.1, 'F');
        doc.rect(10 + cellWidth + 0.1, y + 0.1, labelWidth - 0.1, cellHeight - 0.1, 'F');

        // Row 2: Label Backgrounds
        doc.rect(10.1, y + cellHeight + 0.1, labelWidth - 0.1, cellHeight - 0.2, 'F');
        doc.rect(10 + cellWidth + 0.1, y + cellHeight + 0.1, labelWidth - 0.1, cellHeight - 0.2, 'F');

        // Draw internal lines
        doc.line(10, y + cellHeight, 10 + gridWidth, y + cellHeight); // Horizontal divider
        doc.line(10 + cellWidth, y, 10 + cellWidth, y + (cellHeight * 2)); // Vertical center divider

        doc.line(10 + labelWidth, y, 10 + labelWidth, y + (cellHeight * 2)); // Label divider 1
        doc.line(10 + cellWidth + labelWidth, y, 10 + cellWidth + labelWidth, y + (cellHeight * 2)); // Label divider 2

        doc.setFontSize(6.5);
        doc.setTextColor(100, 100, 100);

        // Labels
        doc.setFont(undefined, 'bold');
        doc.text("DESDE", 13, y + 4.5);
        doc.text("HASTA", 10 + cellWidth + 3, y + 4.5);
        doc.text("ORIGEN", 13, y + cellHeight + 4.5);
        doc.text("TOTAL REGISTROS", 10 + cellWidth + 3, y + cellHeight + 4.5);

        // Values
        doc.setTextColor(50, 50, 50);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(7.5);
        doc.text(start || '-', 10 + labelWidth + 3, y + 4.5);
        doc.text(end || '-', 10 + cellWidth + labelWidth + 3, y + 4.5);
        doc.text("NetGuard · Control de Visitas", 10 + labelWidth + 3, y + cellHeight + 4.5);
        doc.text(`${stats.total} visitas registradas`, 10 + cellWidth + labelWidth + 3, y + cellHeight + 4.5);

        y += (cellHeight * 2) + 6;
    };

    const drawUserList = () => {
        const userText = Object.entries(userCounts)
            .map(([name, count]) => `${name} (${count})`)
            .join("  ·  ");
        const splitUsers = doc.splitTextToSize(userText, pageWidth - 30);
        const boxHeight = (splitUsers.length * 4) + 2;

        if (y + boxHeight + 15 > pageHeight - 20) {
            doc.addPage();
            currentPage++;
            drawSecondaryHeader();
            y = 25;
        }

        drawSectionTitle("USUARIOS REGISTRADORES");
        doc.setFillColor(248, 249, 252);
        doc.setDrawColor(235, 235, 235);
        doc.roundedRect(10, y, pageWidth - 20, boxHeight, 1.5, 1.5, 'FD');
        doc.setFontSize(7);
        doc.setTextColor(80, 80, 80);
        doc.setFont(undefined, 'normal');
        doc.text(splitUsers, 15, y + 4.5);
        y += boxHeight + 6;
    };

    const drawTableHeader = () => {
        doc.setFillColor(0, 32, 96);
        doc.rect(10, y, pageWidth - 20, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.text("#", 12, y + 5.5);
        doc.text("VISITANTE", 20, y + 5.5);
        doc.text("DNI", 68, y + 5.5);
        doc.text("ENTRADA", 92, y + 5.5);
        doc.text("SALIDA", 118, y + 5.5);
        doc.text("USUARIO", 145, y + 5.5);
        doc.text("ESTADO", 175, y + 5.5);
        y += 10;
    };

    // Initial page setup
    drawHeader();
    drawSummaryCards();
    drawPeriodDetails();
    drawUserList();
    drawSectionTitle("BITÁCORA DE VISITAS");
    drawTableHeader();
    drawFooter(currentPage);

    ar.forEach((visit: any, i: number) => {
        const visitorName = `${visit.firstName ?? ''} ${visit.firstLastName ?? ''} ${visit.secondLastName ?? ''}`.trim();
        const userName = `${visit.user?.firstName ?? ''} ${visit.user?.lastName ?? ''}`.trim() || visit.user?.username || '-';

        // Recalibrated distribution
        const colW = { visitor: 43, dni: 20, ingress: 24, egress: 24, user: 28 };
        const xPos = { index: 12, visitor: 20, dni: 68, ingress: 92, egress: 118, user: 145, state: 175 };

        // Set font state BEFORE calculating any splits
        doc.setFontSize(7);
        doc.setFont(undefined, 'normal');

        // Adaptive font for long visitor names
        let currentVisitorFS = 7;
        if (visitorName.length > 25) currentVisitorFS = 6;
        doc.setFontSize(currentVisitorFS);
        const visitorSplit = doc.splitTextToSize(visitorName, colW.visitor);

        // Adaptive font for long DNI
        const dniRaw = visit.dni || '-';
        let currentDniFS = 7;
        if (dniRaw.length > 12) currentDniFS = 5.5;
        doc.setFontSize(currentDniFS);
        const dniSplit = doc.splitTextToSize(dniRaw, colW.dni);

        // Adaptive font for long user names
        let currentUserFS = 7;
        if (userName.length > 18) currentUserFS = 6;
        doc.setFontSize(currentUserFS);
        const userSplit = doc.splitTextToSize(userName, colW.user);

        doc.setFontSize(7); // Base for others

        // Entry/Exit
        const ingressDateSplit = doc.splitTextToSize(visit.ingressDate || '-', colW.ingress);
        const ingressTimeSplit = doc.splitTextToSize(visit.ingressTime || '-', colW.ingress);
        const egressDateSplit = doc.splitTextToSize(visit.egressDate || '-', colW.egress);
        const egressTimeSplit = doc.splitTextToSize(visit.egressTime || '-', colW.egress);

        const maxLines = Math.max(visitorSplit.length, dniSplit.length, userSplit.length, ingressDateSplit.length + ingressTimeSplit.length, egressDateSplit.length + egressTimeSplit.length, 2);
        const rowHeight = (maxLines * 4) + 4;

        if (y + rowHeight > pageHeight - 20) {
            doc.addPage();
            currentPage++;
            drawSecondaryHeader();
            drawSectionTitle("BITÁCORA DE VISITAS");
            drawTableHeader();
            drawFooter(currentPage);
        }

        if (i % 2 === 1) {
            doc.setFillColor(250, 250, 250);
            doc.rect(10, y, pageWidth - 20, rowHeight, 'F');
        }

        doc.setDrawColor(230, 230, 230);
        doc.line(10, y + rowHeight, pageWidth - 10, y + rowHeight);

        doc.setTextColor(50, 50, 50);

        // Draw Row Content
        doc.setFontSize(7);
        doc.text((i + 1).toString(), xPos.index, y + 6);

        doc.setFontSize(currentVisitorFS);
        doc.text(visitorSplit, xPos.visitor, y + 6);

        doc.setFontSize(currentDniFS);
        doc.text(dniSplit, xPos.dni, y + 6);

        doc.setFontSize(7);
        // Entry
        doc.setFont(undefined, 'bold');
        doc.text(ingressDateSplit, xPos.ingress, y + 6);
        doc.setFont(undefined, 'normal');
        doc.text(ingressTimeSplit, xPos.ingress, y + 6 + (ingressDateSplit.length * 3.8));

        // Exit
        doc.setFont(undefined, 'bold');
        doc.text(egressDateSplit, xPos.egress, y + 6);
        doc.setFont(undefined, 'normal');
        doc.text(egressTimeSplit, xPos.egress, y + 6 + (egressDateSplit.length * 3.8));

        doc.setFontSize(currentUserFS);
        doc.text(userSplit, xPos.user, y + 6);
        doc.setFontSize(7);

        // Status Badge
        const state = visit.visitState?.name || 'Desconocido';
        let stateColor = [150, 150, 150];
        let bgColor = [240, 240, 240];
        if (state === 'Finalizado') { stateColor = [40, 167, 69]; bgColor = [232, 245, 233]; }
        else if (state === 'Pendiente') { stateColor = [255, 193, 7]; bgColor = [255, 248, 225]; }
        else if (state === 'En Curso') { stateColor = [0, 123, 255]; bgColor = [227, 242, 253]; }
        else if (state === 'Emergente') { stateColor = [220, 53, 69]; bgColor = [255, 235, 238]; }

        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.roundedRect(xPos.state, y + 2, 22, 5, 1, 1, 'F');
        doc.setFillColor(stateColor[0], stateColor[1], stateColor[2]);
        doc.circle(xPos.state + 2.5, y + 4.5, 0.8, 'F');
        doc.setTextColor(stateColor[0], stateColor[1], stateColor[2]);
        doc.setFontSize(5.5);
        doc.setFont(undefined, 'bold');
        doc.text(state.toUpperCase(), xPos.state + 4.5, y + 5.5);

        y += rowHeight;
    });

    if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
    }

    var d = new Date();
    var title = "log_Visitas_" + d.getDate() + "_" + (d.getMonth() + 1) + "_" + d.getFullYear() + ".pdf";
    doc.save(title);
};

export const exportVisitPdfModern = (visits: any, start: any, end: any) => createModernVisitPdf({
    visits,
    start,
    end,
    logoPath: './public/src/assets/pictures/logo_os.png',
});

export const exportVisitCsv = (ar: any, start: any, end: any) => {
    let rows = [];
    for(let i=0; i < ar.length; i++){
        let visit = ar[i]
        let obj = {
            "Nombre": `${visit.firstName} ${visit.firstLastName} ${visit.secondLastName}`,
            "DNI": `${visit.dni}`,
            "Fecha Creación": `${visit.creationDate}`,
            "Hora Creación": `${visit.creationTime}`,
            "Nombre Usuario": `${visit.user?.firstName ?? ''} ${visit.user?.lastName ?? ''}`,
            "Usuario": `${visit.user?.username ?? ''}`,
            "Tipo": `${verifyUserType(visit.user.userType)}`,
            "Departamento": `${visit.department?.name ?? ''}`,
            "Estado": `${visit.visitState?.name ?? ''}`,
            "Verificado": `${visit.verifiedDocument ? 'Si' : 'No'}`,
            "Favorita": `${visit.favorite ? 'Si' : 'No'}`,
            "Teléfono": `${visit?.phoneNumber ?? ''}`,
            "Autorizado": `${visit?.authorizer ?? ''}`,
            "Fecha Ingreso": `${visit.ingressDate}`,
            "Hora Ingreso": `${visit.ingressTime}`,
            "Emitido Ingreso": `${visit.ingressIssuedId?.firstName ?? ''} ${visit.ingressIssuedId?.lastName ?? ''}`,
            "Guardia Ingreso": `${visit.ingressIssuedId?.username ?? ''}`,
            "Fecha Salida": `${visit?.egressDate ?? ''}`,
            "Hora Salida": `${visit?.egressTime ?? ''}`,
            "Emitido Salida": `${visit.egressIssuedId?.firstName ?? ''} ${visit.egressIssuedId?.lastName ?? ''}`,
            "Guardia Salida": `${visit.egressIssuedId?.username ?? ''}`,
            "Asunto": `${visit.reason.split("\n").join("(salto)")}`,
        }
        rows.push(obj);
    }
    generateFile(rows, "Visitas", "csv");
}

export const exportVisitXls = (ar: any, start: any, end: any) => {
    let rows = [];
    for(let i=0; i < ar.length; i++){
        let visit = ar[i]
        let obj = {
            "Nombre": `${visit.firstName} ${visit.firstLastName} ${visit.secondLastName}`,
            "DNI": `${visit.dni}`,
            "Fecha Creación": `${visit.creationDate}`,
            "Hora Creación": `${visit.creationTime}`,
            "Nombre Usuario": `${visit.user?.firstName ?? ''} ${visit.user?.lastName ?? ''}`,
            "Usuario": `${visit.user?.username ?? ''}`,
            "Tipo": `${verifyUserType(visit.user.userType)}`,
            "Departamento": `${visit.department?.name ?? ''}`,
            "Estado": `${visit.visitState?.name ?? ''}`,
            "Verificado": `${visit.verifiedDocument ? 'Si' : 'No'}`,
            "Favorita": `${visit.favorite ? 'Si' : 'No'}`,
            "Teléfono": `${visit?.phoneNumber ?? ''}`,
            "Autorizado": `${visit?.authorizer ?? ''}`,
            "Fecha Ingreso": `${visit.ingressDate}`,
            "Hora Ingreso": `${visit.ingressTime}`,
            "Emitido Ingreso": `${visit.ingressIssuedId?.firstName ?? ''} ${visit.ingressIssuedId?.lastName ?? ''}`,
            "Guardia Ingreso": `${visit.ingressIssuedId?.username ?? ''}`,
            "Fecha Salida": `${visit?.egressDate ?? ''}`,
            "Hora Salida": `${visit?.egressTime ?? ''}`,
            "Emitido Salida": `${visit.egressIssuedId?.firstName ?? ''} ${visit.egressIssuedId?.lastName ?? ''}`,
            "Guardia Salida": `${visit.egressIssuedId?.username ?? ''}`,
            "Asunto": `${visit.reason.split("\n").join("(salto)")}`,
        }
        rows.push(obj);
    }
    generateFile(rows, "Visitas", "xls");
}

const generateFile = (ar: any, title: string, extension: string) => {
    if(window.Blob && (window.URL || window.webkitURL)){
        var contenido = "", d = new Date(), blob, reader, save, clicEvent;
        for (var i = 0; i < ar.length; i++) {
            if (i == 0) contenido += Object.keys(ar[i]).join(";") + "\n";
            contenido += Object.keys(ar[i]).map(function(key){
                return ar[i][key];
            }).join(";") + "\n";
        }
        blob =  new Blob(["\ufeff", contenido], {type: `text/${extension}`});
        // @ts-ignore
        var reader = new FileReader();
        reader.onload = function (event) {
            save = document.createElement('a');
            // @ts-ignore
            save.href = event.target.result;
            save.target = '_blank';
            save.download = "log_"+title+"_"+ d.getDate() + "_" + (d.getMonth()+1) + "_" + d.getFullYear() +`.${extension}`;
            try {
                clicEvent = new MouseEvent('click', {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                });
            } catch (e) {
                clicEvent = document.createEvent("MouseEvent");
                // @ts-ignore
                clicEvent.click();
            }
            save.dispatchEvent(clicEvent);
            (window.URL || window.webkitURL).revokeObjectURL(save.href);
        }
        reader.readAsDataURL(blob);
    } else {
        alert("Su navegador no permite esta acción");
    }
}

const verifyUserType = (userType: string) =>{
    if(userType == 'CUSTOMER') return 'Cliente';
    else if(userType == 'GUARD') return 'Guardia';
    else if(userType == 'EMPLOYEE') return 'Empleado';
    else if(userType == 'CONTRACTOR') return 'Contratista';
    else return userType;
}

const splitText = (doc: any, field: any, lMargin: any, rMargin: any, pdfInMM: any) => {
    return doc.splitTextToSize(field, (pdfInMM - lMargin - rMargin));
}
