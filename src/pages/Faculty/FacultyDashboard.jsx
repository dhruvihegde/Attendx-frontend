import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { SUBJECTS, USERS, ANALYTICS } from '../../services/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const AVATAR_COLORS = ['#5b8dee','#e84393','#22c55e','#f59e0b','#8b5cf6','#06b6d4'];

function StatCard({ title, value, icon, color='var(--accent)', sub }) {
  return (
    <div className="card animate-in" style={{ display:'flex', alignItems:'center', gap:16 }}>
      <div style={{ width:52, height:52, borderRadius:12, background:color+'20', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{icon}</div>
      <div>
        <p style={{ color:'var(--text-muted)', fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:.5 }}>{title}</p>
        <p style={{ fontSize:28, fontWeight:800, fontFamily:'Syne', color:'var(--primary)', lineHeight:1.1 }}>{value}</p>
        {sub && <p style={{ color:'var(--text-muted)', fontSize:12, marginTop:2 }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function FacultyDashboard() {
  const { user }   = useContext(AuthContext);
  const navigate   = useNavigate();

  // My subject
  const mySubjects = SUBJECTS.filter(s => s.facultyId === user?.id);

  // All 59 students (CE-ALL means all students attend)
  const allStudents = USERS.filter(u => u.role === 'student');

  // Defaulters from dummy analytics
  const defaulters = ANALYTICS.studentAttendance
    .filter(s => s.overall < 75)
    .map(s => ({ ...s, ...allStudents.find(u => u.id === s.id) }))
    .filter(s => s.name);

  // Subject chart data from dummy analytics
  const subjectChartData = mySubjects.map(sub => {
    const dummy = ANALYTICS.subjectWise.find(s => s.name === sub.id);
    return {
      name: sub.id,
      fullName: sub.name,
      percentage: dummy?.percentage || 85,
      present: dummy?.present || 1400,
      absent: dummy?.absent || 250,
    };
  });

  const avgAttendance = mySubjects.length
    ? Math.round(subjectChartData.reduce((a,s) => a+s.percentage, 0) / subjectChartData.length)
    : 85;

  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1>Welcome, {user?.name?.split(' ').slice(1).join(' ')} 👋</h1>
          <p>{user?.department} Department</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        <StatCard title="My Subjects"    value={mySubjects.length}    icon="📚" color="#5b8dee"/>
        <StatCard title="Total Students" value={allStudents.length}   icon="🎓" color="#22c55e" sub="All batches"/>
        <StatCard title="Avg Attendance" value={avgAttendance+'%'}    icon="📊" color="#f59e0b"/>
        <StatCard title="Defaulters"     value={defaulters.length}    icon="⚠️" color="#ef4444" sub="Below 75%"/>
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom:24 }}>
        {/* Subject chart */}
        <div className="card animate-in">
          <h3 style={{ fontSize:15, marginBottom:16 }}>My Subject Attendance</h3>
          {subjectChartData.length === 0 ? (
            <div style={{ textAlign:'center', padding:'36px 20px', color:'var(--text-muted)' }}>
              <p style={{ fontSize:28, marginBottom:8 }}>📭</p>
              <p>No subjects assigned yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={subjectChartData}>
                <XAxis dataKey="name" tick={{ fontSize:11 }}/>
                <YAxis domain={[60,100]} tick={{ fontSize:11 }}/>
                <Tooltip formatter={(v,n,p) => [`${v}%`, p.payload.fullName]}/>
                <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="4 4"/>
                <Bar dataKey="percentage" radius={[6,6,0,0]}>
                  {subjectChartData.map((s,i) => <Cell key={i} fill={s.percentage>=75?'#22c55e':'#ef4444'}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Defaulters */}
        <div className="card animate-in">
          <h3 style={{ marginBottom:16, fontSize:15, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            ⚠️ Defaulters
            <span className="badge badge-danger">{defaulters.length} students</span>
          </h3>
          {defaulters.length === 0 ? (
            <p style={{ color:'var(--text-muted)', fontSize:14 }}>No defaulters 🎉</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10, maxHeight:300, overflowY:'auto' }}>
              {defaulters.map(s => {
                const color = AVATAR_COLORS[s.name?.charCodeAt(0) % AVATAR_COLORS.length] || '#5b8dee';
                return (
                  <div key={s.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ width:34, height:34, borderRadius:'50%', background:color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, flexShrink:0 }}>{s.avatar}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.name}</p>
                      <p style={{ fontSize:11, color:'var(--text-muted)' }}>{s.rollNo} · {s.class}</p>
                    </div>
                    <span className="badge badge-danger">{s.overall}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Batch-wise summary */}
      <div className="card animate-in" style={{ marginBottom:24 }}>
        <h3 style={{ fontSize:15, marginBottom:16 }}>Batch-wise Summary</h3>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
          {ANALYTICS.batchWise.map((b, i) => {
            const colors = ['#5b8dee','#22c55e','#8b5cf6'];
            return (
              <div key={b.batch} style={{ flex:1, minWidth:160, background:'var(--bg)', borderRadius:12, padding:'16px 20px', border:`2px solid ${colors[i]}30` }}>
                <p style={{ fontSize:13, fontWeight:700, color:'var(--primary)', marginBottom:8 }}>{b.batch}</p>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:12, color:'var(--text-muted)' }}>Students</span>
                  <span style={{ fontSize:13, fontWeight:700 }}>{b.students}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ fontSize:12, color:'var(--text-muted)' }}>Avg Attendance</span>
                  <span style={{ fontSize:13, fontWeight:700, color:b.avgAttendance>=75?'#22c55e':'#ef4444' }}>{b.avgAttendance}%</span>
                </div>
                <div style={{ background:'#e2e8f0', borderRadius:4, height:6 }}>
                  <div style={{ width:b.avgAttendance+'%', height:'100%', borderRadius:4, background:colors[i] }}/>
                </div>
                <p style={{ fontSize:11, color:'#ef4444', marginTop:6 }}>⚠️ {b.defaulters} defaulter{b.defaulters!==1?'s':''}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid-3">
        {[
          { to:'/faculty/mark', icon:'✅', label:'Mark Attendance', desc:'Manual attendance for all 59 students' },
          { to:'/capture',      icon:'📷', label:'QR Session',      desc:'Start a live PIN + QR session'         },
          { to:'/analytics',   icon:'📊', label:'Analytics',       desc:'View detailed attendance reports'      },
        ].map(q => (
          <div key={q.to} className="card" style={{ cursor:'pointer' }}
            onClick={() => navigate(q.to)}
            onMouseEnter={e => e.currentTarget.style.boxShadow='var(--shadow-lg)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow='var(--shadow)'}>
            <div style={{ fontSize:28, marginBottom:8 }}>{q.icon}</div>
            <h4 style={{ fontFamily:'Syne', marginBottom:4 }}>{q.label}</h4>
            <p style={{ fontSize:13, color:'var(--text-muted)' }}>{q.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}