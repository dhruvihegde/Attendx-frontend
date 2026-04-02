import { exportToPDF, exportToExcel } from '../utils/exportUtils';

export default function ExportButton({ title, headers, rows }) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button className="btn btn-outline btn-sm" onClick={() => exportToPDF(title, headers, rows)}>⬇ PDF</button>
      <button className="btn btn-success btn-sm" onClick={() => exportToExcel(title, headers, rows)}>⬇ Excel</button>
    </div>
  );
}