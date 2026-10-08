const value = (input, fallback = '-') => String(input ?? '').trim() || fallback;
const now = () => { const date = new Date(); return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`; };
export const createModernReportPdf = ({ reports, start, end, logoPath }) => {
    // @ts-ignore
    window.jsPDF = window.jspdf.jsPDF;
    // @ts-ignore
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const width = doc.internal.pageSize.getWidth(), height = doc.internal.pageSize.getHeight(), margin = 10, contentWidth = width - 20;
    const users = reports.reduce((out, report) => { const user = value(report?.usuario, 'Sin usuario'); out[user] = (out[user] || 0) + 1; return out; }, {});
    const photos = reports.filter((report) => Boolean(report?.imagen));
    const links = [];
    let y = 10;
    const columns = [{ key: 'number', label: '#', width: 7 }, { key: 'date', label: 'FECHA', width: 20 }, { key: 'time', label: 'HORA', width: 16 }, { key: 'user', label: 'USUARIO', width: 34 }, { key: 'title', label: 'TITULO', width: 42 }, { key: 'content', label: 'CONTENIDO', width: 136 }, { key: 'attachment', label: 'ADJUNTO', width: 22 }];
    const colX = {};
    let x = margin;
    columns.forEach((column) => { colX[column.key] = x; x += column.width; });
    const header = (continued = false) => { doc.setFillColor(0, 32, 96); doc.rect(margin, 10, contentWidth, 2, 'F'); try {
        doc.addImage(logoPath, 'PNG', margin + 4, 15.75, 40, 8);
    }
    catch (_) {
        doc.setTextColor(0, 32, 96);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(11);
        doc.text('NETGUARD', margin + 4, 21);
    } doc.setTextColor(0, 32, 96); doc.setFont(undefined, 'bold'); doc.setFontSize(15); doc.text(continued ? 'REGISTRO DE REPORTES - CONTINUACION' : 'REGISTRO DE REPORTES', width / 2, 21, { align: 'center' }); doc.setFont(undefined, 'normal'); doc.setTextColor(120, 120, 120); doc.setFontSize(8); doc.text('Bitacora Digital - Historial de reportes', width / 2, 26, { align: 'center' }); doc.setFontSize(7); doc.text(`Fecha: ${now()}`, width - margin, 20, { align: 'right' }); doc.setDrawColor(220, 220, 220); doc.line(margin, 32, width - margin, 32); y = 37; };
    const section = (label, note = '') => { doc.setFillColor(27, 94, 170); doc.rect(margin, y, 1.2, 4.5, 'F'); doc.setTextColor(0, 32, 96); doc.setFont(undefined, 'bold'); doc.setFontSize(8); doc.text(label, margin + 3, y + 3.3); if (note) {
        doc.setFont(undefined, 'normal');
        doc.setTextColor(145, 145, 145);
        doc.setFontSize(7);
        doc.text(note, width - margin, y + 3.3, { align: 'right' });
    } y += 7; };
    const tableHeader = () => { doc.setFillColor(0, 32, 96); doc.rect(margin, y, contentWidth, 8, 'F'); doc.setTextColor(255, 255, 255); doc.setFont(undefined, 'bold'); doc.setFontSize(5.8); columns.forEach((column) => doc.text(doc.splitTextToSize(column.label, column.width - 2), colX[column.key] + column.width / 2, y + 3.1, { align: 'center' })); y += 8; };
    const addTablePage = () => { doc.addPage(); header(true); section('BITACORA DE REPORTES', `${reports.length} registros`); tableHeader(); };
    header();
    const cards = [['TOTAL REPORTES', reports.length, [0, 32, 96]], ['USUARIOS REGISTRADORES', Object.keys(users).length, [25, 100, 190]], ['CON EVIDENCIA', photos.length, [27, 138, 65]], ['SIN EVIDENCIA', reports.length - photos.length, [188, 130, 0]]];
    cards.forEach(([label, count, color], index) => { const cardWidth = contentWidth / 4, cardX = margin + index * cardWidth; doc.setFillColor(248, 249, 252); doc.setDrawColor(225, 229, 235); doc.rect(cardX, y, cardWidth - 1.5, 17, 'FD'); doc.setTextColor(...color); doc.setFont(undefined, 'bold'); doc.setFontSize(13); doc.text(String(count), cardX + (cardWidth - 1.5) / 2, y + 7.5, { align: 'center' }); doc.setTextColor(100, 100, 100); doc.setFont(undefined, 'normal'); doc.setFontSize(6.5); doc.text(label, cardX + (cardWidth - 1.5) / 2, y + 12.5, { align: 'center' }); });
    y += 23;
    section('DETALLE DEL PERIODO');
    [['DESDE', value(start)], ['HASTA', value(end)], ['ORIGEN', 'NetGuard - Registro de Reportes'], ['TOTAL', `${reports.length} reportes`]].forEach(([label, content], index) => { const cellWidth = contentWidth / 4, cellX = margin + index * cellWidth; doc.setFillColor(252, 253, 255); doc.setDrawColor(225, 229, 235); doc.rect(cellX, y, cellWidth, 12, 'FD'); doc.setTextColor(135, 135, 150); doc.setFontSize(6); doc.text(label, cellX + 3, y + 4); doc.setTextColor(35, 50, 75); doc.setFont(undefined, 'bold'); doc.setFontSize(7.5); doc.text(doc.splitTextToSize(content, cellWidth - 6), cellX + 3, y + 8); });
    y += 18;
    section('USUARIOS REGISTRADORES');
    const userLines = doc.splitTextToSize(Object.entries(users).map(([user, count]) => `${user} (${count})`).join(' - '), contentWidth - 8), userHeight = Math.max(10, userLines.length * 3.5 + 5);
    doc.setFillColor(248, 249, 252);
    doc.setDrawColor(225, 229, 235);
    doc.rect(margin, y, contentWidth, userHeight, 'FD');
    doc.setTextColor(70, 70, 80);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(7);
    doc.text(userLines, margin + 3, y + 5);
    y += userHeight + 6;
    section('BITACORA DE REPORTES', `${reports.length} registros`);
    tableHeader();
    reports.forEach((report, index) => { const row = { number: index + 1, date: report?.fecha, time: report?.hora, user: report?.usuario, title: report?.titulo, content: report?.contenido, attachment: report?.imagen ? 'Ver anexo' : 'Sin adjunto' }; const lines = {}; columns.forEach((column) => { lines[column.key] = doc.splitTextToSize(value(row[column.key]), column.width - 3); }); const rowHeight = Math.max(9, ...Object.values(lines).map((lines) => lines.length * 3.2 + 3.5)); if (y + rowHeight > height - 18)
        addTablePage(); if (report?.imagen)
        links.push({ photo: report, page: doc.internal.getCurrentPageInfo().pageNumber, x: colX.attachment, y, width: 22, height: rowHeight }); if (index % 2) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, y, contentWidth, rowHeight, 'F');
    } doc.setDrawColor(228, 228, 228); doc.rect(margin, y, contentWidth, rowHeight, 'S'); columns.forEach((column, columnIndex) => { if (columnIndex)
        doc.line(colX[column.key], y, colX[column.key], y + rowHeight); if (column.key === 'attachment') {
        doc.setTextColor(report?.imagen ? 27 : 145, report?.imagen ? 94 : 145, report?.imagen ? 170 : 145);
        doc.setFont(undefined, report?.imagen ? 'bold' : 'italic');
        doc.setFontSize(5.8);
        doc.text(lines.attachment, colX.attachment + 11, y + rowHeight / 2 + 1, { align: 'center' });
        return;
    } doc.setTextColor(50, 50, 55); doc.setFont(undefined, 'normal'); doc.setFontSize(column.key === 'content' ? 6 : 6.2); doc.text(lines[column.key], colX[column.key] + 1.5, y + 4.5); }); y += rowHeight; });
    if (photos.length) {
        doc.addPage();
        header(true);
        section('ANEXO FOTOGRAFICO', `${photos.length} fotografias - Evidencias de reportes`);
        const cardWidth = 85, cardHeight = 62, imageHeight = 48, gap = 6;
        let photoX = margin;
        photos.forEach((report, index) => { if (y + cardHeight > height - 18) {
            doc.addPage();
            header(true);
            section('ANEXO FOTOGRAFICO - CONTINUACION', `${photos.length} fotografias`);
            photoX = margin;
        } doc.setDrawColor(225, 229, 235); doc.roundedRect(photoX, y, cardWidth, cardHeight, 1.5, 1.5, 'S'); report.annexPage = doc.internal.getCurrentPageInfo().pageNumber; report.annexY = y; try {
            doc.addImage(report.imagen, 'JPEG', photoX + 2, y + 2, cardWidth - 4, imageHeight - 2);
        }
        catch (_) {
            doc.setFillColor(243, 244, 246);
            doc.rect(photoX + 2, y + 2, cardWidth - 4, imageHeight - 2, 'F');
        } doc.setFillColor(248, 249, 252); doc.rect(photoX + 1, y + imageHeight + 1, cardWidth - 2, cardHeight - imageHeight - 2, 'F'); doc.setTextColor(35, 50, 75); doc.setFont(undefined, 'bold'); doc.setFontSize(6.5); doc.text(`Reporte ${index + 1} - ${value(report?.fecha)}`, photoX + 3, y + imageHeight + 6); photoX += cardWidth + gap; if (photoX + cardWidth > width - margin || index === photos.length - 1) {
            photoX = margin;
            y += cardHeight + 5;
        } });
    }
    links.forEach((link) => { if (link.photo.annexPage) {
        doc.setPage(link.page);
        doc.link(link.x, link.y, link.width, link.height, { pageNumber: link.photo.annexPage, top: link.photo.annexY, zoom: 0 });
    } });
    const pages = doc.getNumberOfPages();
    for (let page = 1; page <= pages; page++) {
        doc.setPage(page);
        doc.setFillColor(248, 249, 252);
        doc.rect(margin, height - 14, contentWidth, 8, 'F');
        doc.setTextColor(145, 145, 145);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(7);
        doc.text('Registro de Reportes - NetGuard by Netliinks', margin + 3, height - 9);
        doc.text(`Pagina ${page} de ${pages}`, width / 2, height - 9, { align: 'center' });
        doc.text('info@netliinks.com - netliinks.com/netguard', width - margin - 3, height - 9, { align: 'right' });
    }
    doc.save(`log_Reportes_${new Date().getDate()}_${new Date().getMonth() + 1}_${new Date().getFullYear()}.pdf`);
};
