export default function ChartCard({ title, children, action }) {
  return (
    <div className="card animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{title}</h3>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}