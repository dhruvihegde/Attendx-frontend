import { useNotifications } from '../../hooks/useNotifications';
import './notifications.css';

const ICONS    = { warning: '⚠️', info: 'ℹ️', success: '✅', error: '🚨' };
const BADGE_MAP = { warning: 'badge-warning', info: 'badge-info', success: 'badge-success', error: 'badge-danger' };

export default function NotificationsPage() {
  const { notifications, markRead, markAllRead, unreadCount } = useNotifications();

  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div><h1>Notifications</h1><p>{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p></div>
        {unreadCount > 0 && <button className="btn btn-outline btn-sm" onClick={markAllRead}>✓ Mark all read</button>}
      </div>

      {notifications.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:'60px', color:'var(--text-muted)' }}>
          <div style={{ fontSize:'48px', marginBottom:'12px' }}>🔔</div>
          <p>No notifications yet</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {notifications.map(n => (
            <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`} onClick={() => markRead(n.id)}>
              <div className="notif-icon">{ICONS[n.type] || 'ℹ️'}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'4px' }}>
                  <p style={{ fontWeight:700, fontSize:'14px' }}>{n.title}</p>
                  <div style={{ display:'flex', gap:'8px', alignItems:'center', flexShrink:0, marginLeft:'12px' }}>
                    <span className={`badge ${BADGE_MAP[n.type]||'badge-info'}`}>{n.type}</span>
                    {!n.read && <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--accent)', display:'inline-block' }} />}
                  </div>
                </div>
                <p style={{ fontSize:'13px', color:'var(--text-muted)', lineHeight:1.5 }}>{n.message}</p>
                <p style={{ fontSize:'11px', color:'var(--text-muted)', marginTop:'6px' }}>🕐 {n.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}