import { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { qrService }   from '../../services/qrService';
import { userService } from '../../services/userService';
import api from '../../services/api';
import './capture.css';

// ── QR Canvas ────────────────────────────────────────────────────────────────
function QRCanvas({ value, size = 200 }) {
  const ref = useRef();
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    c.width = size; c.height = size;
    const h = [...value].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) & 0x7fffffff, 0);
    const cs = size / 25;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size);
    for (let r = 0; r < 25; r++)
      for (let col = 0; col < 25; col++) {
        if ((r<8&&col<8)||(r<8&&col>=17)||(r>=17&&col<8)) continue;
        ctx.fillStyle = ((h>>(r*25+col)%31)&1)^((r*7+col*3)%5===0?1:0) ? '#1a1f3c' : '#fff';
        ctx.fillRect(col*cs, r*cs, cs, cs);
      }
    [[0,0],[18,0],[0,18]].forEach(([x,y]) => {
      ctx.fillStyle='#1a1f3c'; ctx.fillRect(x*cs,y*cs,7*cs,7*cs);
      ctx.fillStyle='#fff';    ctx.fillRect((x+1)*cs,(y+1)*cs,5*cs,5*cs);
      ctx.fillStyle='#1a1f3c'; ctx.fillRect((x+2)*cs,(y+2)*cs,3*cs,3*cs);
    });
  }, [value, size]);
  return <canvas ref={ref} style={{ borderRadius: 8, display: 'block' }}/>;
}

// ── Timer Ring ────────────────────────────────────────────────────────────────
function TimerRing({ seconds, total = 300 }) {
  const r = 44, circ = 2 * Math.PI * r, pct = seconds / total;
  const color = seconds > total*.4 ? '#22c55e' : seconds > total*.15 ? '#f59e0b' : '#ef4444';
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return (
    <svg width={108} height={108} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={54} cy={54} r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth={7}/>
      <circle cx={54} cy={54} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={`${circ*pct} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s linear, stroke .5s' }}/>
      <text x={54} y={48} textAnchor="middle" dominantBaseline="middle"
        style={{ transform:'rotate(90deg)', transformOrigin:'54px 54px', fill:'#fff', fontSize:18, fontWeight:800 }}>
        {mm}:{ss}
      </text>
      <text x={54} y={64} textAnchor="middle"
        style={{ transform:'rotate(90deg)', transformOrigin:'54px 54px', fill:'rgba(255,255,255,.4)', fontSize:9 }}>
        left
      </text>
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AttendanceCapture() {
  const { user } = useContext(AuthContext);

  const [subjects,       setSubjects]       = useState([]);
  const [allStudents,    setAllStudents]     = useState([]);
  const [selSubj,        setSelSubj]        = useState('');
  const [date,           setDate]           = useState(new Date().toISOString().split('T')[0]);

  // Session state
  const [activeSession,  setActiveSession]  = useState(null);  // full session object from backend
  const [livePresent,    setLivePresent]    = useState([]);     // enriched student objects
  const [sessionHistory, setSessionHistory] = useState([]);
  const [timeLeft,       setTimeLeft]       = useState(300);
  const [expired,        setExpired]        = useState(false);
  const [tab,            setTab]            = useState('present');
  const [histTab,        setHistTab]        = useState('present');
  const [selHist,        setSelHist]        = useState(0);
  const [loading,        setLoading]        = useState(true);
  const tickRef    = useRef();
  const pollRef    = useRef();

  // ── Load on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const [subRes, stuRes] = await Promise.all([
          api.get(`/subjects/faculty/${user.id}`),
          userService.getStudents(),
        ]);
        const subs = subRes.data.data || [];
        setSubjects(subs);
        if (subs.length > 0) setSelSubj(subs[0].id);
        setAllStudents(stuRes.data.data || []);
        await refreshHistory();
      } catch (e) {
        console.error('Init error', e);
      } finally {
        setLoading(false);
      }
    }
    init();
    return () => { clearInterval(tickRef.current); clearInterval(pollRef.current); };
  }, [user.id]);

  async function refreshHistory() {
    try {
      const res = await qrService.getHistory(user.id);
      setSessionHistory(res.data.data || []);
    } catch (e) {}
  }

  // ── Poll live present list every 3s when session is active ─────────────────
  useEffect(() => {
    clearInterval(pollRef.current);
    if (!activeSession) { setLivePresent([]); return; }

    async function poll() {
      try {
        const res = await qrService.getSessionAttendance(activeSession.sessionId);
        setLivePresent(res.data.data || []);
      } catch (e) {}
    }

    poll(); // immediate first call
    pollRef.current = setInterval(poll, 3000);
    return () => clearInterval(pollRef.current);
  }, [activeSession?.sessionId]);

  // ── Derived: absent list ───────────────────────────────────────────────────
  const presentIds = new Set(livePresent.map(s => s.studentId));
  const absentList = allStudents.filter(s => !presentIds.has(s.id));

  const subject   = subjects.find(s => s.id === selSubj);
  const sessionId = `ATT-${selSubj}-${date}`;

  // ── Start session ──────────────────────────────────────────────────────────
  async function handleStart() {
    try {
      setExpired(false); setTimeLeft(300); setTab('present'); setLivePresent([]);
      const res = await qrService.startSession({
        sessionId,
        subjectId:   selSubj,
        subjectName: subject?.name,
        className:   'CE-ALL',
        date,
      });
      setActiveSession(res.data.data);

      // Start 5 min countdown
      clearInterval(tickRef.current);
      tickRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(tickRef.current);
            // Auto-expire in backend when timer hits 0
            qrService.expireSession(sessionId)
              .then(() => { setActiveSession(null); setExpired(true); refreshHistory(); })
              .catch(() => { setExpired(true); });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (e) {
      alert('Failed to start session. Make sure the backend is running.');
    }
  }

  // ── End session manually ───────────────────────────────────────────────────
  async function handleEnd() {
    try {
      clearInterval(tickRef.current);
      clearInterval(pollRef.current);
      if (activeSession) {
        await qrService.endSession(activeSession.sessionId);
      }
      setActiveSession(null);
      setExpired(false);
      setTimeLeft(300);
      setSelHist(0);
      await refreshHistory();
    } catch (e) {
      console.error('End session error', e);
    }
  }

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'var(--text-muted)' }}>
      <p>Loading...</p>
    </div>
  );

  if (subjects.length === 0) return (
    <div>
      <div className="page-header"><h1>QR Attendance Session</h1></div>
      <div className="card" style={{ textAlign:'center', padding:60, color:'var(--text-muted)' }}>
        <p style={{ fontSize:32, marginBottom:12 }}>📭</p>
        <p style={{ fontWeight:600 }}>No subjects assigned to you yet.</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>QR Attendance Session</h1>
        <p>Generate a PIN — announce it verbally to your class</p>
      </div>

      {/* Config */}
      <div className="card" style={{ marginBottom:24, display:'flex', gap:20, alignItems:'flex-end', flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:200 }}>
          <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6 }}>Subject</label>
          <select value={selSubj} onChange={e => { setSelSubj(e.target.value); if (activeSession) handleEnd(); }}>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6 }}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width:'auto' }}/>
        </div>
        <span className="badge badge-info" style={{ paddingBottom:10, alignSelf:'flex-end' }}>{allStudents.length} students</span>
      </div>

      <div className="capture-grid" style={{ marginBottom:32 }}>

        {/* ── LEFT: PIN Panel ── */}
        <div className="qr-panel">
          <p style={{ color:'rgba(255,255,255,.5)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>
            📢 Announce PIN to class
          </p>

          {/* PIN display */}
          {activeSession?.pin ? (
            <div style={{ background:'linear-gradient(135deg,#5b8dee,#8b5cf6)', borderRadius:20, padding:'24px 28px', textAlign:'center', width:'100%', boxShadow:'0 8px 40px rgba(91,141,238,.5)', border:'2px solid rgba(255,255,255,.15)' }}>
              <p style={{ color:'rgba(255,255,255,.6)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:2, marginBottom:10 }}>SESSION PIN</p>
              <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:12 }}>
                {activeSession.pin.split('').map((digit, i) => (
                  <div key={i} style={{ width:52, height:64, background:'rgba(255,255,255,.15)', borderRadius:12, border:'2px solid rgba(255,255,255,.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, fontWeight:900, color:'#fff', fontFamily:'Syne' }}>
                    {digit}
                  </div>
                ))}
              </div>
              <p style={{ color:'rgba(255,255,255,.5)', fontSize:12 }}>🎤 Say out loud — don't write on board</p>
            </div>
          ) : (
            <div style={{ background:'rgba(255,255,255,.05)', border:'2px dashed rgba(255,255,255,.15)', borderRadius:20, padding:'28px 32px', textAlign:'center', width:'100%' }}>
              <p style={{ fontSize:40, marginBottom:10 }}>🔒</p>
              <p style={{ color:'rgba(255,255,255,.4)', fontSize:14 }}>PIN will appear here</p>
              <p style={{ color:'rgba(255,255,255,.25)', fontSize:12, marginTop:6 }}>Start session to generate</p>
            </div>
          )}

          {/* Session info */}
          <div style={{ width:'100%', background:'rgba(255,255,255,.07)', borderRadius:10, padding:'12px 14px', fontSize:12, color:'rgba(255,255,255,.6)', lineHeight:1.9 }}>
            <p>📚 <strong>{subject?.name || 'No subject selected'}</strong></p>
            <p>👥 {allStudents.length} students</p>
            <p>📅 {date}</p>
          </div>

          {/* Timer when session active */}
          {activeSession && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, width:'100%' }}>
              <TimerRing seconds={timeLeft}/>
              <p style={{ color:'#22c55e', fontSize:12, fontWeight:700 }}>✅ Session is OPEN</p>
              <div style={{ width:'100%', height:5, background:'rgba(255,255,255,.1)', borderRadius:3 }}>
                <div style={{ width:(timeLeft/300*100)+'%', height:'100%', borderRadius:3, background:timeLeft>120?'#22c55e':timeLeft>45?'#f59e0b':'#ef4444', transition:'width 1s linear' }}/>
              </div>
              <p style={{ color:'rgba(255,255,255,.35)', fontSize:11 }}>📱 Students enter PIN → 15s to mark</p>
            </div>
          )}

          {/* Action buttons */}
          {!activeSession && !expired && (
            <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', fontSize:14 }} onClick={handleStart}>
              ▶ Start Session + Generate PIN
            </button>
          )}
          {activeSession && (
            <button className="btn btn-danger" style={{ width:'100%', justifyContent:'center', fontSize:14 }} onClick={handleEnd}>
              ⏹ End Session
            </button>
          )}
          {expired && !activeSession && (
            <button className="btn" style={{ width:'100%', justifyContent:'center', background:'var(--primary)', color:'#fff' }} onClick={handleStart}>
              🔄 Start New Session
            </button>
          )}
        </div>

        {/* ── RIGHT: Live Attendance Panel ── */}
        <div className="live-panel">
          {/* Header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h3 style={{ fontSize:16, fontWeight:800, color:'var(--primary)' }}>Live Attendance</h3>
            <div style={{ display:'flex', gap:8 }}>
              <span className="badge badge-success">✅ {livePresent.length}</span>
              <span className="badge badge-danger">❌ {activeSession ? absentList.length : allStudents.length}</span>
            </div>
          </div>

          {/* Tabs — only show when session is active */}
          {activeSession && (
            <div style={{ display:'flex', gap:8, marginBottom:16 }}>
              {['present','absent'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ flex:1, padding:'9px 0', borderRadius:8, border:'none', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', background:tab===t?(t==='present'?'#22c55e':'#ef4444'):'var(--bg)', color:tab===t?'#fff':'var(--text-muted)', transition:'all .15s' }}>
                  {t === 'present' ? `✅ Present (${livePresent.length})` : `❌ Absent (${absentList.length})`}
                </button>
              ))}
            </div>
          )}

          {/* No session state */}
          {!activeSession && (
            <div style={{ textAlign:'center', padding:'36px 20px', color:'var(--text-muted)', flex:1 }}>
              <span style={{ fontSize:32, display:'block', marginBottom:10 }}>⏳</span>
              <p>{expired ? 'Session ended — see history below ↓' : 'Start a session to see live attendance'}</p>
            </div>
          )}

          {/* Present list */}
          {activeSession && tab === 'present' && (
            <div style={{ flex:1, overflowY:'auto', maxHeight:420 }}>
              {livePresent.length === 0 ? (
                <div style={{ textAlign:'center', padding:'36px 20px', color:'var(--text-muted)' }}>
                  <span style={{ fontSize:32, display:'block', marginBottom:10 }}>📲</span>
                  <p>Waiting for students to enter PIN…</p>
                  <small style={{ fontSize:12, display:'block', marginTop:6 }}>Students have 15 seconds after PIN entry</small>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                  {livePresent.map((s, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid var(--border)', animation:'fadeIn .3s ease' }}>
                      <div style={{ width:38, height:38, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, color:'#fff', background:'linear-gradient(135deg,#22c55e,#16a34a)' }}>
                        {s.avatar || s.name?.[0] || '?'}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:13, fontWeight:700, color:'var(--primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.name}</p>
                        <p style={{ fontSize:11, color:'var(--text-muted)' }}>{s.rollNo} · {s.className}</p>
                      </div>
                      <span className="badge badge-success">✓ Present</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Absent list */}
          {activeSession && tab === 'absent' && (
            <div style={{ flex:1, overflowY:'auto', maxHeight:420 }}>
              {absentList.length === 0 ? (
                <div style={{ textAlign:'center', padding:'36px 20px', color:'var(--text-muted)' }}>
                  <span style={{ fontSize:32, display:'block', marginBottom:10 }}>🎉</span>
                  <p style={{ fontWeight:600 }}>Everyone marked present!</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                  {absentList.map((s, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                      <div style={{ width:38, height:38, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, color:'#fff', background:'linear-gradient(135deg,#ef4444,#dc2626)' }}>
                        {s.avatar || s.name?.[0] || '?'}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:13, fontWeight:700, color:'var(--primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.name}</p>
                        <p style={{ fontSize:11, color:'var(--text-muted)' }}>{s.rollNo} · {s.className}</p>
                      </div>
                      <span className="badge badge-danger">✗ Absent</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Summary bar */}
          {activeSession && (
            <div style={{ display:'flex', marginTop:16, background:'var(--bg)', borderRadius:12, overflow:'hidden', border:'1px solid var(--border)' }}>
              {[
                { color:'#22c55e',       value:livePresent.length,  label:'Present', bg:'#f0fdf4' },
                { color:'#ef4444',       value:absentList.length,   label:'Absent',  bg:'#fff1f2' },
                { color:'var(--accent)', value:allStudents.length ? Math.round(livePresent.length / allStudents.length * 100) + '%' : '0%', label:'Rate', bg:'#f0f6ff' },
              ].map((item, i) => (
                <div key={i} style={{ flex:1, textAlign:'center', padding:'12px 8px', background:item.bg, borderRight:i<2?'1px solid var(--border)':'none' }}>
                  <span style={{ fontSize:22, fontWeight:800, fontFamily:'Syne', color:item.color, display:'block' }}>{item.value}</span>
                  <span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600 }}>{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Session History ── */}
      {sessionHistory.length > 0 && (
        <div className="card">
          <h2 style={{ fontFamily:'Syne', fontSize:18, marginBottom:4 }}>📋 Session History</h2>
          <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:20 }}>Past QR sessions</p>

          <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
            {sessionHistory.map((s, i) => (
              <button key={i} onClick={() => { setSelHist(i); setHistTab('present'); }}
                style={{ padding:'8px 16px', borderRadius:8, border:'none', fontWeight:600, fontSize:12, cursor:'pointer', fontFamily:'inherit', background:selHist===i?'var(--accent)':'var(--bg)', color:selHist===i?'#fff':'var(--text-muted)', transition:'all .15s' }}>
                {s.subjectId} · {new Date(s.startedAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}
              </button>
            ))}
          </div>

          {(() => {
            const sess = sessionHistory[selHist]; if (!sess) return null;
            return (
              <div>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:16 }}>
                  {[
                    { label:'Subject', value: sess.subjectName },
                    { label:'Date',    value: sess.date },
                    { label:'Status',  value: sess.status },
                  ].map(item => (
                    <div key={item.label} style={{ background:'var(--bg)', borderRadius:8, padding:'10px 16px' }}>
                      <p style={{ color:'var(--text-muted)', fontSize:11, fontWeight:600, marginBottom:2 }}>{item.label}</p>
                      <p style={{ fontWeight:700, color:'var(--primary)', fontSize:13 }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}