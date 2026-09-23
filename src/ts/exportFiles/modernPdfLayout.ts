// @ts-nocheck

const text = (value: unknown, fallback = '-') => String(value ?? '').trim() || fallback;

const generatedAt = () => {
  const now = new Date();
  return `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

/**
 * Componente visual compartido de los documentos de Netvisitors.
 * Cada exportador conserva sus datos y solamente entrega filas, columnas y
 * evidencias; así los reportes permanecen coherentes sin compartir marca con
 * Netguard.
 */
const emojiImages = new Map<string, string>();

const emojiImage = (emoji: string): string => {
  if (!emoji || emojiImages.has(emoji)) return emojiImages.get(emoji) ?? '';
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    if (!context) return '';
    context.font = '52px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(emoji, 32, 34);
    const image = canvas.toDataURL('image/png');
    emojiImages.set(emoji, image);
    return image;
  } catch (_) {
    return '';
  }
};

export const createModernPdf = ({
  title,
  subtitle,
  origin,
  start,
  end,
  rows,
  columns,
  filename,
  users = [],
  summary,
  evidenceLabel = 'Evidencias',
}: any) => {
  // @ts-ignore
  window.jsPDF = window.jspdf.jsPDF;
  // @ts-ignore
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = width - margin * 2;
  const currentDate = generatedAt();
  const columnX: Record<string, number> = {};
  let x = margin;
  let y = 10;
  const evidences = rows.flatMap((row: any, rowIndex: number) => {
    const images = (Array.isArray(row.images) ? row.images : [row.image]).filter(Boolean);
    return images.map((image: string, imageIndex: number) => ({
      image,
      rowIndex,
      caption: row.caption || `${evidenceLabel} ${imageIndex + 1}`,
    }));
  });

  columns.forEach((column: any) => {
    columnX[column.key] = x;
    x += column.width;
  });

  const header = (continued = false) => {
    doc.setFillColor(0, 32, 96);
    doc.rect(margin, 10, contentWidth, 2, 'F');
    try {
      doc.addImage('./public/src/assets/pictures/report.png', 'PNG', margin + 4, 15, 40, 10);
    } catch (_) {
      doc.setTextColor(0, 32, 96);
      doc.setFont(undefined, 'bold');
      doc.setFontSize(11);
      doc.text('NETVISITORS', margin + 4, 21);
    }
    doc.setTextColor(0, 32, 96);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(15);
    doc.text(continued ? `${title} · CONTINUACIÓN` : title, width / 2, 21, { align: 'center' });
    doc.setTextColor(120, 120, 120);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.text(subtitle, width / 2, 26, { align: 'center' });
    doc.setFontSize(7);
    doc.text(`Generado: ${currentDate}`, width - margin, 20, { align: 'right' });
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, 32, width - margin, 32);
    y = 37;
  };

  const footer = (page: number, total: number) => {
    doc.setFillColor(248, 249, 252);
    doc.rect(margin, height - 14, contentWidth, 8, 'F');
    doc.setTextColor(145, 145, 145);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(7);
    const footerLabel = `${title} · Netvisitors by`;
    const logoX = margin + 3 + doc.getTextWidth(footerLabel) + 1.2;
    doc.text(footerLabel, margin + 3, height - 9);
    try {
      // Dos trazos casi superpuestos refuerzan líneas finas sin estirar el
      // logo ni incorporar una imagen adicional al PDF.
      doc.addImage('./public/src/assets/pictures/login_logo.png', 'PNG', logoX, height - 11.2, 25, 2.64);
      doc.addImage('./public/src/assets/pictures/login_logo.png', 'PNG', logoX + 0.12, height - 11.2, 25, 2.64);
    } catch (_) { /* El texto mantiene el pie si el navegador no carga la imagen. */ }
    doc.text(`Página ${page} de ${total}`, width / 2, height - 9, { align: 'center' });
    doc.text('info@netliinks.com · netliinks.com', width - margin - 3, height - 9, { align: 'right' });
  };

  const section = (name: string, note = '') => {
    doc.setFillColor(27, 94, 170);
    doc.rect(margin, y, 1.2, 4.5, 'F');
    doc.setTextColor(0, 32, 96);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(8);
    doc.text(name, margin + 3, y + 3.3);
    if (note) {
      doc.setTextColor(145, 145, 145);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(7);
      doc.text(note, width - margin, y + 3.3, { align: 'right' });
    }
    y += 7;
  };

  const tableHeader = () => {
    const tableHeaderHeight = 10;
    doc.setFillColor(0, 32, 96);
    doc.rect(margin, y, contentWidth, tableHeaderHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(6.5);
    columns.forEach((column: any) => {
      const lines = doc.splitTextToSize(column.label, column.width - 2);
      doc.text(lines, columnX[column.key] + column.width / 2, y + tableHeaderHeight / 2 - (lines.length - 1) * 1.6 + 1, { align: 'center' });
    });
    y += tableHeaderHeight;
  };

  const nextPage = () => {
    doc.addPage();
    header(true);
    section('DETALLE DE REGISTROS', `${rows.length} registros`);
    tableHeader();
  };

  header();
  const cards = summary || [
    { label: 'TOTAL REGISTROS', value: rows.length, color: [0, 32, 96] },
    { label: 'CON EVIDENCIA', value: evidences.length, color: [27, 138, 65] },
    { label: 'SIN EVIDENCIA', value: rows.length - evidences.length, color: [188, 130, 0] },
  ];
  const cardWidth = contentWidth / cards.length;
  cards.forEach((card: any, index: number) => {
    const cardX = margin + index * cardWidth;
    doc.setFillColor(248, 249, 252);
    doc.setDrawColor(225, 229, 235);
    doc.rect(cardX, y, cardWidth - 1.5, 17, 'FD');
    doc.setTextColor(...card.color);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(13);
    doc.text(String(card.value), cardX + (cardWidth - 1.5) / 2, y + 7.5, { align: 'center' });
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(6.5);
    doc.text(card.label, cardX + (cardWidth - 1.5) / 2, y + 12.5, { align: 'center' });
  });
  y += 23;
  section('DETALLE DEL PERIODO');
  const details = [
    { label: 'DESDE', value: text(start) }, { label: 'HASTA', value: text(end) },
    { label: 'ORIGEN', value: text(origin) }, { label: 'TOTAL', value: `${rows.length} registros` },
  ];
  details.forEach((item, index) => {
    const cellWidth = contentWidth / details.length;
    const cellX = margin + index * cellWidth;
    doc.setFillColor(252, 253, 255);
    doc.setDrawColor(225, 229, 235);
    doc.rect(cellX, y, cellWidth, 12, 'FD');
    doc.setTextColor(135, 135, 150);
    doc.setFontSize(6);
    doc.text(item.label, cellX + 3, y + 4);
    doc.setTextColor(35, 50, 75);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(7.5);
    doc.text(doc.splitTextToSize(item.value, cellWidth - 6), cellX + 3, y + 8);
  });
  y += 18;
  if (users.length) {
    section('USUARIOS REGISTRADORES');
    const userLines = doc.splitTextToSize(users.join(' · '), contentWidth - 8);
    const userHeight = Math.max(10, userLines.length * 3.5 + 5);
    doc.setFillColor(248, 249, 252);
    doc.setDrawColor(225, 229, 235);
    doc.rect(margin, y, contentWidth, userHeight, 'FD');
    doc.setTextColor(70, 70, 80);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(7);
    doc.text(userLines, margin + 3, y + 5);
    y += userHeight + 6;
  }
  section('DETALLE DE REGISTROS', `${rows.length} registros`);
  tableHeader();
  rows.forEach((row: any, index: number) => {
    const lines: Record<string, string[]> = {};
    columns.forEach((column: any) => {
      const emoji = column.key === 'description' ? text(row.emoji, '') : '';
      lines[column.key] = doc.splitTextToSize(text(row[column.key]), column.width - 3 - (emoji ? 5 : 0));
    });
    const rowHeight = Math.max(10.5, ...Object.values(lines).map((value) => value.length * 3.8 + 4));
    if (y + rowHeight > height - 18) nextPage();
    if (index % 2) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
    }
    doc.setDrawColor(228, 228, 228);
    doc.rect(margin, y, contentWidth, rowHeight, 'S');
    columns.forEach((column: any, columnIndex: number) => {
      if (columnIndex) doc.line(columnX[column.key], y, columnX[column.key], y + rowHeight);
      doc.setTextColor(50, 50, 55);
      doc.setFont(undefined, column.key === 'state' ? 'bold' : 'normal');
      doc.setFontSize(7.2);
      const cellLines = lines[column.key];
      const emoji = column.key === 'description' ? text(row.emoji, '') : '';
      const cellY = y + rowHeight / 2 - (cellLines.length - 1) * 1.9 + 1.3;
      if (emoji) {
        const image = emojiImage(emoji);
        if (image) doc.addImage(image, 'PNG', columnX[column.key] + 1.2, y + rowHeight / 2 - 2, 3.8, 3.8);
        doc.text(cellLines, columnX[column.key] + 5.6, cellY, { align: 'left' });
      } else {
        doc.text(cellLines, columnX[column.key] + column.width / 2, cellY, { align: 'center' });
      }
    });
    y += rowHeight;
  });
  if (evidences.length) {
    doc.addPage();
    header(true);
    section('ANEXO FOTOGRÁFICO', `${evidences.length} fotografías · ${evidenceLabel}`);
    const cardWidth = 85;
    const cardHeight = 62;
    const imageHeight = 48;
    const gap = 6;
    let evidenceX = margin;
    evidences.forEach((evidence: any, index: number) => {
      if (y + cardHeight > height - 18) {
        doc.addPage();
        header(true);
        section('ANEXO FOTOGRÁFICO - CONTINUACIÓN', `${evidences.length} fotografías`);
        evidenceX = margin;
      }
      doc.setDrawColor(225, 229, 235);
      doc.roundedRect(evidenceX, y, cardWidth, cardHeight, 1.5, 1.5, 'S');
      try { doc.addImage(evidence.image, 'JPEG', evidenceX + 2, y + 2, cardWidth - 4, imageHeight - 2); }
      catch (_) { doc.setFillColor(243, 244, 246); doc.rect(evidenceX + 2, y + 2, cardWidth - 4, imageHeight - 2, 'F'); }
      doc.setFillColor(248, 249, 252);
      doc.rect(evidenceX + 1, y + imageHeight + 1, cardWidth - 2, cardHeight - imageHeight - 2, 'F');
      doc.setTextColor(35, 50, 75);
      doc.setFont(undefined, 'bold');
      doc.setFontSize(6.5);
      doc.text(text(evidence.caption), evidenceX + 3, y + imageHeight + 6);
      evidenceX += cardWidth + gap;
      if (evidenceX + cardWidth > width - margin || index === evidences.length - 1) { evidenceX = margin; y += cardHeight + 5; }
    });
  }
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) { doc.setPage(page); footer(page, pages); }
  doc.save(filename);
};
