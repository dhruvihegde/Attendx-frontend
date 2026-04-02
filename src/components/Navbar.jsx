import { useContext } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { AuthContext } from '../context/AuthContext';
  import { NotificationContext } from '../context/NotificationContext';

  const AVATAR_COLORS = ['#5b8dee','#e84393','#22c55e','#f59e0b','#8b5cf6','#06b6d4'];

  function UserAvatar({ user, size = 36 }) {
    const color = AVATAR_COLORS[user?.name?.charCodeAt(0) % AVATAR_COLORS.length] || '#5b8dee';
    return (
      <div style={{ width:size, height:size, borderRadius:'50%', background:color, color:'#fff', fontWeight:700, fontSize:size*.35, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne', flexShrink:0 }}>
        {user?.avatar || user?.name?.[0] || '?'}
      </div>
    );
  }

  export default function Navbar({ toggleSidebar }) {
    const { user, logout }  = useContext(AuthContext);
    const { unreadCount }   = useContext(NotificationContext);
    const navigate          = useNavigate();

    const handleLogout = () => { logout(); navigate('/'); };

    return (
      <nav style={{ background:'#fff', borderBottom:'1px solid var(--border)', padding:'0 24px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, boxShadow:'0 1px 8px rgba(0,0,0,.05)' }}>

        {/* Left */}
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          {toggleSidebar && (
            <button onClick={toggleSidebar} style={{ background:'none', border:'none', fontSize:20, color:'var(--primary)', padding:4, cursor:'pointer' }}>
              ☰
            </button>
          )}
          <div style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }} onClick={() => navigate('/')}>
            <div style={{ width:36, height:36, background:'var(--accent)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'Syne', fontWeight:800, fontSize:16 }}>A</div>
            <span style={{ fontFamily:'Syne', fontWeight:700, fontSize:17, color:'var(--primary)' }}>AttendX</span>
          </div>
        </div>

        {/* Right */}
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>

          {/* Notification bell */}
          <button
            onClick={() => navigate('/notifications')}
            style={{ position:'relative', background:'none', border:'none', fontSize:22, padding:4, color:'var(--primary)', cursor:'pointer' }}
          >
            🔔
            {unreadCount > 0 && (
              <span style={{ position:'absolute', top:0, right:0, width:17, height:17, background:'#e84393', color:'#fff', borderRadius:'50%', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User avatar + name */}
          {user && (
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <UserAvatar user={user}/>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:'var(--primary)', lineHeight:1.2 }}>
                  {user.name.split(' ').slice(0,2).join(' ')}
                </p>
                <p style={{ fontSize:11, color:'var(--text-muted)', textTransform:'capitalize' }}>
                  {user.role}{user.rollNo ? ` · ${user.rollNo}` : ''}
                </p>
              </div>
            </div>
          )}

          {/* Logout */}
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
    );
  }