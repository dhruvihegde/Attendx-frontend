export default function AttendanceTable({ columns, data, onEdit }) {
  return (
    <div className="card">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map(c => <th key={c.key}>{c.label}</th>)}
              {onEdit && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={columns.length + (onEdit ? 1 : 0)} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>No data found</td></tr>
            ) : data.map((row, i) => (
              <tr key={i}>
                {columns.map(c => (
                  <td key={c.key}>{c.render ? c.render(row[c.key], row) : row[c.key]}</td>
                ))}
                {onEdit && (
                  <td><button className="btn btn-outline btn-sm" onClick={() => onEdit(row)}>Edit</button></td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}