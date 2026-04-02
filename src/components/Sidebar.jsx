import { useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const adminLinks = [
  { to:'/admin',             icon:'🏠', label:'Dashboard'      },
  { to:'/admin/users',       icon:'👥', label:'Manage Users'   },
  { to:'/admin/departments', icon:'🏛️', label:'Departments'    },
  { to:'/admin/timetable',   icon:'📅', label:'Timetable'      },
  { to:'/analytics',         icon:'📊', label:'Analytics'      },
  { to:'/notifications',     icon:'🔔', label:'Notifications'  },
];

const facultyLinks = [
  { to:'/faculty',           icon:'🏠', label:'Dashboard'        },
  { to:'/faculty/mark',      icon:'✅', label:'Mark Attendance'  },
  { to:'/faculty/history',   icon:'📋', label:'History'          },
  { to:'/faculty/timetable', icon:'📅', label:'My Timetable'     },
  { to:'/capture',           icon:'📷', label:'QR Session'       },
  { to:'/analytics',         icon:'📊', label:'Analytics'        },
  { to:'/notifications',     icon:'🔔', label:'Notifications'    },
];

const studentLinks = [
  { to:'/student',            icon:'🏠', label:'Dashboard'     },
  { to:'/student/attendance', icon:'📋', label:'My Attendance' },
  { to:'/student/timetable',  icon:'📅', label:'My Timetable'  },
  { to:'/notifications',      icon:'🔔', label:'Notifications' },
];

// exact match roots, prefix match for everything else
const EXACT = ['/admin', '/faculty', '/student', '/'];

export default function Sidebar({ open }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const links =
    user?.role === 'admin'   ? adminLinks   :
    user?.role === 'faculty' ? facultyLinks :
    studentLinks;

  const isActive = (to) =>
    EXACT.includes(to)
      ? location.pathname === to
      : location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <div style={{
      width: open ? '240px' : '0',
      minHeight: '100vh',
      background: 'var(--primary)',
      transition: 'width 0.25s ease',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      <div style={{ width:'240px', padding:'24px 0' }}>

        {/* Role + name header */}
        <div style={{ padding:'0 20px 20px', borderBottom:'1px solid rgba(255,255,255,.1)', marginBottom:16 }}>
          <p style={{ color:'rgba(255,255,255,.45)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:1 }}>
            {user?.role?.toUpperCase()} PANEL
          </p>
          <p style={{ color:'rgba(255,255,255,.8)', fontSize:13, fontWeight:600, marginTop:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {user?.name}
          </p>
          {user?.rollNo && (
            <p style={{ color:'rgba(255,255,255,.4)', fontSize:11, marginTop:2 }}>{user.rollNo}</p>
          )}
        </div>

        {/* Links */}
        {links.map(l => {
          const active = isActive(l.to);
          return (
            <div
              key={l.to}
              onClick={() => navigate(l.to)}
              style={{
                display:'flex', alignItems:'center', gap:12,
                padding:'11px 20px', cursor:'pointer',
                color:      active ? '#fff' : 'rgba(255,255,255,.6)',
                background: active ? 'rgba(91,141,238,.25)' : 'transparent',
                borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
                fontSize:14, fontWeight: active ? 600 : 400,
                transition:'all .15s', userSelect:'none',
              }}
              onMouseEnter={e => {
                if (!active) { e.currentTarget.style.color='#fff'; e.currentTarget.style.background='rgba(91,141,238,.1)'; }
              }}
              onMouseLeave={e => {
                if (!active) { e.currentTarget.style.color='rgba(255,255,255,.6)'; e.currentTarget.style.background='transparent'; }
              }}
            >
              <span style={{ fontSize:16 }}>{l.icon}</span>
              <span>{l.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}