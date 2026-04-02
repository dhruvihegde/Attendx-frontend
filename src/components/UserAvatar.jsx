const COLORS = ['#5b8dee','#e84393','#22c55e','#f59e0b','#8b5cf6','#06b6d4'];

export default function UserAvatar({ user, size = 36 }) {
  const color = COLORS[user?.name?.charCodeAt(0) % COLORS.length] || '#5b8dee';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color,
      color: '#fff', fontWeight: 700, fontSize: size * 0.35,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Syne', flexShrink: 0,
    }}>
      {user?.avatar || user?.name?.[0] || '?'}
    </div>
  );
}