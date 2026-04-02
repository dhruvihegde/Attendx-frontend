import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationBell() {
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate('/notifications')} style={{ position: 'relative', background: 'none', border: 'none', fontSize: '22px', padding: '4px', color: 'var(--primary)' }}>
      🔔
      {unreadCount > 0 && (
        <span style={{ position: 'absolute', top: 0, right: 0, width: '17px', height: '17px', background: 'var(--accent-2)', color: '#fff', borderRadius: '50%', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}