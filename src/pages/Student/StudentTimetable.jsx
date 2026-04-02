import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { TIMETABLE, SUBJECTS, USERS } from '../../services/mockData';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const TIME_COLORS = [
  { bg:'linear-gradient(135deg,#5b8dee,#4a7de0)', border:'#5b8dee' },
  { bg:'linear-gradient(135deg,#22c55e,#16a34a)', border:'#22c55e' },
  { bg:'linear-gradient(135deg,#f59e0b,#d97706)', border:'#f59e0b' },
  { bg:'linear-gradient(135deg,#8b5cf6,#7c3aed)', border:'#8b5cf6' },
  { bg:'linear-gradient(135deg,#06b6d4,#0891b2)', border:'#06b6d4' },
  { bg:'linear-gradient(135deg,#e84393,#db2777)', border:'#e84393' },
  { bg:'linear-gradient(135deg,#ef4444,#dc2626)', border:'#ef4444' },
];

export default function StudentTimetable() {
  const { user } = useContext(AuthContext);

  // CE-ALL subjects apply to all students
  const mySlots = TIMETABLE.filter(t => {
    const sub = SUBJECTS.find(s => s.id === t.subject);
    return sub?.class === 'CE-ALL' || sub?.class === user?.class;
  });

  const getSlotsForDay = (day) => mySlots.filter(s => s.day === day);
  const subjectName = (id) => SUBJECTS.find(s => s.id === id)?.name || id;
  const facultyName = (id) => {
    const f = USERS.find(u => u.id === id);
    return f ? f.name.replace('Prof. ','').replace('Dr. ','') : id;
  };

  const mySubjects = [...new Set(mySlots.map(s => s.subject))].map((id, i) => ({
    id, name: subjectName(id), color: TIME_COLORS[i % TIME_COLORS.length],
  }));

  const totalClasses = mySlots.length;
  const activeDays   = [...new Set(mySlots.map(s => s.day))].length;

  return (
    <div>
      <div className="page-header">
        <h1>My Timetable</h1>
        <p>Weekly class schedule — SE Computer Engineering, Semester IV</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        {[
          { icon:'📚', label:'Subjects',      value:mySubjects.length },
          { icon:'📅', label:'Classes/Week',  value:totalClasses      },
          { icon:'🗓️', label:'Active Days',   value:activeDays        },
          { icon:'🏫', label:'Batch',         value:user?.class || 'CE' },
        ].map((s, i) => (
          <div key={i} className="card animate-in" style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:44, height:44, borderRadius:10, background:'rgba(91,141,238,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{s.icon}</div>
            <div>
              <p style={{ color:'var(--text-muted)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:.5 }}>{s.label}</p>
              <p style={{ fontSize:22, fontWeight:800, fontFamily:'Syne', color:'var(--primary)', lineHeight:1.1 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Day cards */}
      {DAYS.map(day => {
        const daySlots = getSlotsForDay(day).sort((a,b) => a.time.localeCompare(b.time));
        return (
          <div key={day} className="card animate-in" style={{ marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:daySlots.length>0?14:0 }}>
              <div style={{ width:8, height:28, background:daySlots.length>0?'var(--accent)':'var(--border)', borderRadius:4 }}/>
              <h3 style={{ fontFamily:'Syne', fontSize:15, color:'var(--primary)' }}>{day}</h3>
              <span className={daySlots.length>0?'badge badge-info':''} style={daySlots.length===0?{background:'#f0f4ff',color:'var(--text-muted)',padding:'3px 10px',borderRadius:20,fontSize:12}:{}}>
                {daySlots.length>0 ? `${daySlots.length} class${daySlots.length>1?'es':''}` : 'No classes'}
              </span>
            </div>
            {daySlots.length > 0 && (
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                {daySlots.map((slot, i) => {
                  const colorIdx = mySubjects.findIndex(s => s.id === slot.subject) % TIME_COLORS.length;
                  const col      = TIME_COLORS[colorIdx >= 0 ? colorIdx : i % TIME_COLORS.length];
                  return (
                    <div key={slot.id} style={{ background:col.bg, borderRadius:12, padding:'14px 18px', minWidth:200, maxWidth:230, color:'#fff', position:'relative', overflow:'hidden', boxShadow:`0 4px 16px ${col.border}40` }}>
                      <div style={{ position:'absolute', top:-20, right:-20, width:70, height:70, borderRadius:'50%', background:'rgba(255,255,255,.1)' }}/>
                      <p style={{ fontSize:11, opacity:.8, marginBottom:5, fontWeight:500 }}>⏰ {slot.time}</p>
                      <p style={{ fontWeight:800, fontSize:14, marginBottom:4, fontFamily:'Syne' }}>{subjectName(slot.subject)}</p>
                      <p style={{ fontSize:11, opacity:.75, marginBottom:2 }}>👤 {facultyName(slot.facultyId)}</p>
                      <p style={{ fontSize:11, opacity:.75 }}>🏛️ {slot.room}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Legend */}
      <div className="card">
        <h3 style={{ fontSize:14, marginBottom:14, fontFamily:'Syne' }}>Subject Legend</h3>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {mySubjects.map((s, i) => (
            <div key={s.id} style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg)', borderRadius:8, padding:'8px 12px' }}>
              <div style={{ width:12, height:12, borderRadius:3, background:TIME_COLORS[i%TIME_COLORS.length].border, flexShrink:0 }}/>
              <span style={{ fontSize:13, fontWeight:600 }}>{s.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}