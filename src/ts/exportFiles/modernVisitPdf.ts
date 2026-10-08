const text = (value: any, fallback = '-') => String(value ?? '').trim() || fallback;

const timestamp = () => {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

export const createModernVisitPdf = ({ visits, start, end, logoPath }: any) => {
    // @ts-ignore
    window.jsPDF = window.jspdf.jsPDF;
    // @ts-ignore
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = width - margin * 2;
    const createdAt = timestamp();
    const stateCount = (state: any) => visits.filter((visit: any) => visit?.visitState?.name === state).length;
    const users = visits.reduce((counts: any, visit: any) => {
        const name = `${visit?.user?.firstName ?? ''} ${visit?.user?.lastName ?? ''}`.trim() || visit?.user?.username || 'Sistema';
        counts[name] = (counts[name] || 0) + 1;
        return counts;
    }, {});
    const columns = [
        { key: 'number', label: '#', width: 7 }, { key: 'visitor', label: 'VISITANTE', width: 49 }, { key: 'dni', label: 'DNI', width: 22 },
        { key: 'department', label: 'DEPARTAMENTO VISITADO', width: 52 }, { key: 'entry', label: 'ENTRADA', width: 27 }, { key: 'entryBy', label: 'REGISTRA ENTRADA', width: 32 },
        { key: 'exit', label: 'SALIDA', width: 27 }, { key: 'exitBy', label: 'REGISTRA SALIDA', width: 32 }, { key: 'state', label: 'ESTADO', width: 29 },
    ];
    const rows = visits.map((visit: any, index: any) => ({
        number: index + 1,
        visitor: `${visit?.firstName ?? ''} ${visit?.firstLastName ?? ''} ${visit?.secondLastName ?? ''}`,
        dni: visit?.dni,
        department: visit?.department?.name,
        entry: `${visit?.ingressDate ?? ''} ${visit?.ingressTime ?? ''}`,
        entryBy: `${visit?.ingressIssuedId?.firstName ?? ''} ${visit?.ingressIssuedId?.lastName ?? ''}`,
        exit: `${visit?.egressDate ?? ''} ${visit?.egressTime ?? ''}`,
        exitBy: `${visit?.egressIssuedId?.firstName ?? ''} ${visit?.egressIssuedId?.lastName ?? ''}`,
        state: visit?.visitState?.name,
    }));
    const colX: any = {}; let x = margin;
    columns.forEach((column: any) => { colX[column.key] = x; x += column.width; });
    let y = 10;
    const header = (continued = false) => {
        doc.setFillColor(0, 32, 96); doc.rect(margin, 10, contentWidth, 2, 'F');
        try { doc.addImage(logoPath, 'PNG', margin + 4, 15.75, 40, 8); }
        catch (_) { doc.setFont(undefined, 'bold'); doc.setFontSize(11); doc.setTextColor(0, 32, 96); doc.text('NETGUARD', margin + 4, 21); }
        doc.setTextColor(0, 32, 96); doc.setFont(undefined, 'bold'); doc.setFontSize(15);
        doc.text(continued ? 'REGISTRO DE VISITAS - CONTINUACION' : 'REGISTRO DE VISITAS', width / 2, 21, { align: 'center' });
        doc.setTextColor(120, 120, 120); doc.setFont(undefined, 'normal'); doc.setFontSize(8);
        doc.text('Bitacora Digital - Historial de accesos', width / 2, 26, { align: 'center' });
        doc.setFontSize(7); doc.text(`Fecha: ${createdAt}`, width - margin, 20, { align: 'right' });
        doc.setDrawColor(220, 220, 220); doc.line(margin, 32, width - margin, 32); y = 37;
    };
    const section = (label: any, note = '') => {
        doc.setFillColor(27, 94, 170); doc.rect(margin, y, 1.2, 4.5, 'F');
        doc.setTextColor(0, 32, 96); doc.setFont(undefined, 'bold'); doc.setFontSize(8); doc.text(label, margin + 3, y + 3.3);
        if (note) { doc.setFont(undefined, 'normal'); doc.setTextColor(145, 145, 145); doc.setFontSize(7); doc.text(note, width - margin, y + 3.3, { align: 'right' }); }
        y += 7;
    };
    const tableHeader = () => {
        doc.setFillColor(0, 32, 96); doc.rect(margin, y, contentWidth, 8, 'F');
        doc.setTextColor(255, 255, 255); doc.setFont(undefined, 'bold'); doc.setFontSize(5.8);
        columns.forEach((column: any) => doc.text(doc.splitTextToSize(column.label, column.width - 2), colX[column.key] + column.width / 2, y + 3.1, { align: 'center' }));
        y += 8;
    };
    const pageBreak = () => { doc.addPage(); header(true); section('BITACORA DE VISITAS', `${rows.length} registros`); tableHeader(); };
    header();
    const cards = [
        ['TOTAL REGISTROS', visits.length, [0, 32, 96]], ['FINALIZADO', stateCount('Finalizado'), [27, 138, 65]],
        ['EN CURSO', stateCount('En Curso'), [25, 100, 190]], ['PENDIENTE', stateCount('Pendiente'), [188, 130, 0]], ['EMERGENTE', stateCount('Emergente'), [200, 45, 60]],
    ];
    const cardWidth = contentWidth / cards.length;
    cards.forEach(([label, value, color], index) => {
        const cardX = margin + index * cardWidth;
        doc.setFillColor(248, 249, 252); doc.setDrawColor(225, 229, 235); doc.rect(cardX, y, cardWidth - 1.5, 17, 'FD');
        doc.setTextColor(...color); doc.setFont(undefined, 'bold'); doc.setFontSize(13); doc.text(String(value), cardX + (cardWidth - 1.5) / 2, y + 7.5, { align: 'center' });
        doc.setTextColor(100, 100, 100); doc.setFont(undefined, 'normal'); doc.setFontSize(6.5); doc.text(label, cardX + (cardWidth - 1.5) / 2, y + 12.5, { align: 'center' });
    });
    y += 23; section('DETALLE DEL PERIODO');
    [['DESDE', text(start)], ['HASTA', text(end)], ['ORIGEN', 'NetGuard - Control de Visitas'], ['TOTAL', `${rows.length} visitas registradas`]].forEach(([label, value], index) => {
        const cellWidth = contentWidth / 4; const cellX = margin + index * cellWidth;
        doc.setFillColor(252, 253, 255); doc.setDrawColor(225, 229, 235); doc.rect(cellX, y, cellWidth, 12, 'FD');
        doc.setTextColor(135, 135, 150); doc.setFontSize(6); doc.text(label, cellX + 3, y + 4);
        doc.setTextColor(35, 50, 75); doc.setFont(undefined, 'bold'); doc.setFontSize(7.5); doc.text(doc.splitTextToSize(value, cellWidth - 6), cellX + 3, y + 8);
    });
    y += 18; section('USUARIOS REGISTRADORES');
    const userText = doc.splitTextToSize(Object.entries(users).map(([name, count]) => `${name} (${count})`).join(' - '), contentWidth - 8);
    const userHeight = Math.max(10, userText.length * 3.5 + 5);
    doc.setFillColor(248, 249, 252); doc.setDrawColor(225, 229, 235); doc.rect(margin, y, contentWidth, userHeight, 'FD');
    doc.setTextColor(70, 70, 80); doc.setFont(undefined, 'normal'); doc.setFontSize(7); doc.text(userText, margin + 3, y + 5); y += userHeight + 6;
    section('BITACORA DE VISITAS', `${rows.length} registros`); tableHeader();
    rows.forEach((row: any, index: any) => {
        const lines: any = {}; columns.forEach((column: any) => { lines[column.key] = doc.splitTextToSize(text(row[column.key]), column.width - 3); });
        const rowHeight = Math.max(9, ...Object.values(lines).map((value: any) => value.length * 3.2 + 3.5));
        if (y + rowHeight > height - 18) pageBreak();
        if (index % 2) { doc.setFillColor(250, 250, 250); doc.rect(margin, y, contentWidth, rowHeight, 'F'); }
        doc.setDrawColor(228, 228, 228); doc.rect(margin, y, contentWidth, rowHeight, 'S');
        columns.forEach((column: any, columnIndex: any) => {
            if (columnIndex) doc.line(colX[column.key], y, colX[column.key], y + rowHeight);
            doc.setTextColor(50, 50, 55); doc.setFont(undefined, column.key === 'state' ? 'bold' : 'normal'); doc.setFontSize(6.1);
            doc.text(lines[column.key], colX[column.key] + 1.5, y + 4.5);
        }); y += rowHeight;
    });
    const pages = doc.getNumberOfPages();
    for (let page = 1; page <= pages; page++) {
        doc.setPage(page); doc.setFillColor(248, 249, 252); doc.rect(margin, height - 14, contentWidth, 8, 'F');
        doc.setTextColor(145, 145, 145); doc.setFont(undefined, 'normal'); doc.setFontSize(7);
        doc.text('Registro de Visitas - NetGuard by Netliinks', margin + 3, height - 9);
        doc.text(`Pagina ${page} de ${pages}`, width / 2, height - 9, { align: 'center' });
        doc.text('info@netliinks.com - netliinks.com/netguard', width - margin - 3, height - 9, { align: 'right' });
    }
    doc.save(`log_Visitas_${new Date().getDate()}_${new Date().getMonth() + 1}_${new Date().getFullYear()}.pdf`);
};
