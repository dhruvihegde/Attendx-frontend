import { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext }      from '../../context/AuthContext';
import { QRSessionContext } from '../../context/QRSessionContext';
import { attendanceService } from '../../services/attendanceService';
import { qrService }          from '../../services/qrService';
import './student.css';

const SUBJECTS = [
  { id: 'IOT', name: 'Internet of Things (IOT)'      },
  { id: 'DSE', name: 'Data Structures Engg (DSE)'    },
  { id: 'TCS', name: 'Theory of Computer Sci (TCS)'  },
  { id: 'CNS', name: 'Computer Networks & Sec (CNS)' },
  { id: 'FM',  name: 'Financial Management (FM)'     },
  { id: 'PM',  name: 'Project Management (PM)'       },
  { id: 'COI', name: 'Constitution of India (COI)'   },
];

function QRCanvas({ value, size = 150 }) {
  const ref = useRef();
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    c.width = size; c.height = size;
    const h = [...value].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) & 0x7fffffff, 0);
    const cs = size / 25;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size);
    for (let r = 0; r < 25; r++) for (let col = 0; col < 25; col++) {
      if ((r < 8 && col < 8) || (r < 8 && col >= 17) || (r >= 17 && col < 8)) continue;
      ctx.fillStyle = ((h >> (r * 25 + col) % 31) & 1) ^ ((r * 7 + col * 3) % 5 === 0 ? 1 : 0) ? '#1a1f3c' : '#fff';
      ctx.fillRect(col * cs, r * cs, cs, cs);
    }
    [[0, 0], [18, 0], [0, 18]].forEach(([x, y]) => {
      ctx.fillStyle = '#1a1f3c'; ctx.fillRect(x * cs, y * cs, 7 * cs, 7 * cs);
      ctx.fillStyle = '#fff';    ctx.fillRect((x + 1) * cs, (y + 1) * cs, 5 * cs, 5 * cs);
      ctx.fillStyle = '#1a1f3c'; ctx.fillRect((x + 2) * cs, (y + 2) * cs, 3 * cs, 3 * cs);
    });
  }, [value, size]);
  return <canvas ref={ref} style={{ borderRadius: 8, display: 'block' }} />;
}

function CountdownRing({ seconds, total = 15 }) {
  const r = 36, circ = 2 * Math.PI * r, pct = seconds / total;
  const color = seconds > 8 ? '#22c55e' : seconds > 4 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={84} height={84} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={42} cy={42} r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth={6} />
      <circle cx={42} cy={42} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s linear, stroke .4s' }} />
      <text x={42} y={38} textAnchor="middle" dominantBaseline="middle"
        style={{ transform: 'rotate(90deg)', transformOrigin: '42px 42px', fill: color, fontSize: 22, fontWeight: 900 }}>
        {seconds}
      </text>
      <text x={42} y={54} textAnchor="middle"
        style={{ transform: 'rotate(90deg)', transformOrigin: '42px 42px', fill: 'rgba(255,255,255,.35)', fontSize: 9 }}>
        sec
      </text>
    </svg>
  );
}

function StatCard({ icon, label, value, sub, color = 'var(--accent)' }) {
  return (
    <div className="card animate-in" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 52, height: 52, borderRadius: 12, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>{label}</p>
        <p style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Syne', color: 'var(--primary)', lineHeight: 1.1 }}>{value}</p>
        {sub && <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);

  const [subStats,    setSubStats]    = useState([]);
  const [overall,     setOverall]     = useState(0);
  const [activeSession, setActiveSession] = useState(null);
  const [loading,     setLoading]     = useState(true);

  // QR state
  const [pinInput,    setPinInput]    = useState('');
  const [pinError,    setPinError]    = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [qrTimeLeft,  setQrTimeLeft]  = useState(15);
  const [qrExpired,   setQrExpired]   = useState(false);
  const [justMarked,  setJustMarked]  = useState(false);
  const qrTickRef = useRef();

  // Load student attendance stats
  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await attendanceService.getStudentStats(user.id);
        const stats = res.data.data || [];
        setSubStats(stats);
        const avg = stats.length
          ? Math.round(stats.reduce((a, s) => a + s.percentage, 0) / stats.length)
          : 0;
        setOverall(avg);
      } catch (e) {
        console.error('Failed to load stats', e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [user.id]);

  // Poll for active QR session every 5 seconds
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await qrService.getActiveSession();
        const session = res.data.data;
        if (session && session.sessionId !== activeSession?.sessionId) {
          setActiveSession(session);
          setPinInput(''); setPinError(''); setPinVerified(false);
          setJustMarked(false); setQrExpired(false);
        } else if (!session) {
          setActiveSession(null);
        }
      } catch (e) {}
    }
    checkSession();
    const interval = setInterval(checkSession, 5000);
    return () => clearInterval(interval);
  }, [activeSession?.sessionId]);

  // 15s countdown timer when session appears
  useEffect(() => {
    clearInterval(qrTickRef.current);
    if (activeSession && !justMarked) {
      setQrTimeLeft(15);
      qrTickRef.current = setInterval(() => {
        setQrTimeLeft(p => {
          if (p <= 1) { clearInterval(qrTickRef.current); setQrExpired(true); return 0; }
          return p - 1;
        });
      }, 1000);
    }
    return () => clearInterval(qrTickRef.current);
  }, [activeSession?.sessionId]);

  const handlePinSubmit = () => {
    if (!activeSession) return;
    if (pinInput === activeSession.pin) {
      setPinError(''); setPinVerified(true);
    } else {
      setPinError('❌ Wrong PIN. Ask your teacher again.'); setPinInput('');
    }
  };

  const handleMark = async () => {
    if (!activeSession || justMarked || qrExpired) return;
    try {
      await qrService.markPresent(activeSession.sessionId, activeSession.pin, activeSession.subjectId);
      setJustMarked(true);
      clearInterval(qrTickRef.current);
      // Refresh stats after marking
      const res = await attendanceService.getStudentStats(user.id);
      const stats = res.data.data || [];
      setSubStats(stats);
      const avg = stats.length ? Math.round(stats.reduce((a, s) => a + s.percentage, 0) / stats.length) : 0;
      setOverall(avg);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to mark attendance.');
    }
  };

  const eligible      = overall >= 75;
  const timerColor    = qrTimeLeft > 8 ? '#22c55e' : qrTimeLeft > 4 ? '#f59e0b' : '#ef4444';
  const totalPresent  = subStats.reduce((a, s) => a + s.present, 0);
  const totalAbsent   = subStats.reduce((a, s) => a + s.absent, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, color: 'var(--primary)' }}>Hello, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>{user?.rollNo} · {user?.className} · {user?.department}</p>
        </div>
      </div>

      {/* ── No session ── */}
      {!activeSession && (
        <div style={{ background: '#fff', border: '1px dashed #e2e8f0', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#6b7280' }}>
          <span style={{ fontSize: 20 }}>📡</span>
          <p>No active session right now. Your teacher will start one and give you a 4-digit PIN.</p>
        </div>
      )}

      {/* ── Session active: enter PIN ── */}
      {activeSession && !pinVerified && !justMarked && !qrExpired && (
        <div style={{ marginBottom: 24, background: 'linear-gradient(135deg,#0f172a,#1e1b4b)', borderRadius: 18, border: '1px solid rgba(91,141,238,.3)', overflow: 'hidden' }}>
          <div style={{ height: 5, background: 'rgba(255,255,255,.08)' }}>
            <div style={{ height: '100%', width: (qrTimeLeft / 15 * 100) + '%', background: timerColor, transition: 'width 1s linear, background .5s', borderRadius: '0 3px 3px 0' }} />
          </div>
          <div style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: '#22c55e', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Live Session Active
            </div>
            <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 900, marginBottom: 4 }}>{activeSession.subjectName}</h2>
            <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 13, marginBottom: 20 }}>SE Computer Engineering</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22, background: 'rgba(255,255,255,.05)', borderRadius: 12, padding: '14px 18px', border: `1px solid ${timerColor}40` }}>
              <CountdownRing seconds={qrTimeLeft} />
              <div>
                <p style={{ color: timerColor, fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{qrTimeLeft} seconds left</p>
                <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 13 }}>
                  {qrTimeLeft <= 5 ? '⚡ Hurry up!' : qrTimeLeft <= 8 ? '⚠️ Running out of time!' : '⏱ Enter PIN before time runs out'}
                </p>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: '20px 24px' }}>
              <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13, fontWeight: 600, marginBottom: 14 }}>🔢 Enter the 4-digit PIN your teacher announced:</p>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="number" value={pinInput} autoFocus
                  onChange={e => {
                    const v = e.target.value.slice(0, 4);
                    setPinInput(v); setPinError('');
                    if (v.length === 4) {
                      setTimeout(() => {
                        if (activeSession && v === activeSession.pin) setPinVerified(true);
                        else { setPinError('❌ Wrong PIN. Ask your teacher again.'); setPinInput(''); }
                      }, 100);
                    }
                  }}
                  onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
                  placeholder="_ _ _ _"
                  style={{ width: 140, height: 60, fontSize: 32, fontWeight: 900, textAlign: 'center', letterSpacing: 12, background: 'rgba(255,255,255,.1)', border: pinError ? '2px solid #ef4444' : '2px solid rgba(255,255,255,.2)', borderRadius: 12, color: '#fff', outline: 'none' }}
                />
                <button onClick={handlePinSubmit} disabled={pinInput.length !== 4}
                  style={{ background: 'linear-gradient(135deg,#5b8dee,#8b5cf6)', border: 'none', borderRadius: 12, padding: '16px 28px', color: '#fff', fontSize: 15, fontWeight: 700, cursor: pinInput.length !== 4 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: pinInput.length !== 4 ? .5 : 1 }}>
                  Verify PIN →
                </button>
              </div>
              {pinError && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 10, fontWeight: 600 }}>{pinError}</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── PIN verified: show QR + mark button ── */}
      {activeSession && pinVerified && !justMarked && !qrExpired && (
        <div style={{ marginBottom: 24, background: 'linear-gradient(135deg,#0f172a,#1e1b4b)', borderRadius: 18, border: '1px solid rgba(91,141,238,.3)', overflow: 'hidden' }}>
          <div style={{ height: 5, background: 'rgba(255,255,255,.08)' }}>
            <div style={{ height: '100%', width: (qrTimeLeft / 15 * 100) + '%', background: timerColor, transition: 'width 1s linear', borderRadius: '0 3px 3px 0' }} />
          </div>
          <div style={{ padding: '24px 28px', display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#22c55e', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                PIN Verified ✓
              </div>
              <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 900, marginBottom: 4 }}>{activeSession.subjectName}</h2>
              <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 13, marginBottom: 16 }}>SE Computer Engineering</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, background: 'rgba(255,255,255,.05)', borderRadius: 10, padding: '10px 14px', border: `1px solid ${timerColor}40` }}>
                <CountdownRing seconds={qrTimeLeft} />
                <div>
                  <p style={{ color: timerColor, fontWeight: 800, fontSize: 16 }}>{qrTimeLeft}s remaining</p>
                  <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 12, marginTop: 2 }}>{qrTimeLeft <= 5 ? '⚡ Mark present NOW!' : 'Click the button →'}</p>
                </div>
              </div>
              <button onClick={handleMark}
                style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', border: 'none', borderRadius: 12, padding: '14px 32px', color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 6px 28px rgba(34,197,94,.45)' }}>
                ✋ Mark Present
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ background: '#fff', borderRadius: 14, padding: 12 }}>
                <QRCanvas value={activeSession.sessionId} size={150} />
              </div>
              <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 11 }}>Session QR</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Time's up ── */}
      {activeSession && qrExpired && !justMarked && (
        <div style={{ marginBottom: 24, background: 'linear-gradient(135deg,#1a0505,#2d0a0a)', borderRadius: 18, padding: '24px 28px', border: '1px solid rgba(239,68,68,.3)', display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 44, flexShrink: 0 }}>⏳</span>
          <div>
            <p style={{ color: '#ef4444', fontWeight: 900, fontSize: 18, marginBottom: 6 }}>Time's up!</p>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 14 }}>Contact your teacher — you will be marked absent.</p>
          </div>
        </div>
      )}

      {/* ── Marked successfully ── */}
      {justMarked && (
        <div style={{ marginBottom: 24, background: 'linear-gradient(135deg,#052e16,#0a3d22)', borderRadius: 18, padding: '24px 28px', border: '1px solid rgba(34,197,94,.3)', display: 'flex', alignItems: 'center', gap: 22 }}>
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(34,197,94,.15)', border: '2.5px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, flexShrink: 0 }}>✅</div>
          <div>
            <p style={{ color: '#22c55e', fontWeight: 900, fontSize: 20, marginBottom: 5 }}>Attendance Marked!</p>
            <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 14 }}>{activeSession?.subjectName} · SE Computer Engineering</p>
          </div>
        </div>
      )}

      {/* Stats */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}><p>Loading your attendance...</p></div>
      ) : (
        <>
          <div className="grid-4" style={{ marginBottom: 20 }}>
            <StatCard icon="📊" label="Overall"    value={overall + '%'}  sub={eligible ? 'Eligible ✓' : 'Below Limit ⚠️'} color={eligible ? '#22c55e' : '#ef4444'} />
            <StatCard icon="✅" label="Attended"   value={totalPresent}   color="#22c55e" sub="Total classes" />
            <StatCard icon="❌" label="Missed"     value={totalAbsent}    color="#ef4444" sub="Total classes" />
            <StatCard icon="📚" label="Subjects"   value={subStats.length} color="#5b8dee" sub="This semester" />
          </div>

          {/* Eligibility banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px', borderRadius: 14, marginBottom: 20, background: eligible ? '#f0fdf4' : '#fff1f2', border: eligible ? '1px solid #bbf7d0' : '1px solid #fecaca' }}>
            <span style={{ fontSize: 32 }}>{eligible ? '🎓' : '⚠️'}</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{eligible ? 'You are eligible for exams' : 'Attendance below required limit'}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{eligible ? `${overall}% — Keep it up!` : `${overall}% — Need 75% minimum`}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Syne', color: 'var(--primary)', display: 'block' }}>{overall}%</span>
              <small style={{ fontSize: 11, color: 'var(--text-muted)' }}>Required: 75%</small>
            </div>
          </div>

          {/* Subject-wise */}
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>Subject-wise Attendance</h3>
            {subStats.map((s, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600 }}>{s.subjectName}</span>
                  <span style={{ color: s.percentage >= 75 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{s.percentage}%</span>
                </div>
                <div style={{ background: '#f0f4ff', borderRadius: 4, height: 7 }}>
                  <div style={{ width: s.percentage + '%', height: '100%', borderRadius: 4, background: s.percentage >= 75 ? '#22c55e' : s.percentage >= 60 ? '#f59e0b' : '#ef4444', transition: 'width .4s' }} />
                </div>
                <p style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{s.present}/{s.total} classes</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
