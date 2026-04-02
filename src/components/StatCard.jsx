export default function StatCard({ title, label, value, icon, color = 'var(--accent)', sub }) {
  return (
    <div className="card animate-in" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: 52, height: 52, borderRadius: '12px', background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title || label}</p>
        <p style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'Syne', color: 'var(--primary)', lineHeight: 1.1 }}>{value}</p>
        {sub && <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>{sub}</p>}
      </div>
    </div>
  );
}