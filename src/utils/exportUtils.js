import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export function exportToPDF(title, headers, rows) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  let y = 35;
  headers.forEach((h, i) => doc.text(h, 14 + i * 40, y));
  y += 8;
  doc.line(14, y - 3, 196, y - 3);
  rows.forEach(row => {
    row.forEach((cell, i) => doc.text(String(cell), 14 + i * 40, y));
    y += 8;
    if (y > 270) { doc.addPage(); y = 20; }
  });
  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
}

export function exportToExcel(title, headers, rows) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
}