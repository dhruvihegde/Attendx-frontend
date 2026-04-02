import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './auth.css';

export default function LoginPage() {
  const { login }  = useContext(AuthContext);
  const navigate   = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [role,     setRole]     = useState('admin');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const QUICK = [
    { label:'Admin',        email:'admin@college.edu',  password:'admin123',   role:'admin'   },
    { label:'Prof. Anita',  email:'anita@college.edu',  password:'faculty123', role:'faculty' },
    { label:'Prof. Vikram', email:'vikram@college.edu', password:'faculty123', role:'faculty' },
    { label:'Dhruvi (A3)',  email:'dhruvi@student.edu', password:'student123', role:'student' },
    { label:'Arjun A1',     email:'arjun@student.edu',  password:'student123', role:'student' },
    { label:'Aryaman A2',   email:'aryaman@student.edu',password:'student123', role:'student' },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password, role);
    setLoading(false);
    if (result.success) {
      // Navigate based on role
      if (result.user.role === 'admin')   navigate('/admin');
      else if (result.user.role === 'faculty') navigate('/faculty');
      else navigate('/student');
    } else {
      setError(result.error || 'Invalid credentials or role mismatch');
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
          <div style={{ width:44, height:44, background:'var(--accent)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'Syne', fontWeight:800, fontSize:20 }}>A</div>
          <div>
            <h2 style={{ fontFamily:'Syne', fontSize:18, color:'var(--primary)' }}>AttendX</h2>
            <p style={{ fontSize:12, color:'var(--text-muted)' }}>DYPU — SE Computer Engineering</p>
          </div>
        </div>

        <h1 style={{ fontFamily:'Syne', fontSize:24, marginBottom:4 }}>Welcome back 👋</h1>
        <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:28 }}>Sign in to access your dashboard</p>

        {/* Role tabs */}
        <div className="role-tabs">
          {['admin','faculty','student'].map(r => (
            <button key={r} className={`role-tab${role===r?' active':''}`} onClick={() => setRole(r)}>
              {r==='admin'?'🛡️':r==='faculty'?'👨‍🏫':'🎓'} {r.charAt(0).toUpperCase()+r.slice(1)}
            </button>
          ))}
        </div>

        {error && <div className="auth-error">⚠️ {error}</div>}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required/>
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required/>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:13 }} disabled={loading}>
            {loading ? 'Signing in…' : '→ Sign In'}
          </button>
        </form>

        {/* Quick fill */}
        <div className="quick-fill">
          <p>QUICK FILL (DEMO):</p>
          <div className="quick-btns">
            {QUICK.map(q => (
              <button key={q.label} className="quick-btn" onClick={() => { setEmail(q.email); setPassword(q.password); setRole(q.role); }}>
                {q.label}
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign:'center', marginTop:16, fontSize:13, color:'var(--text-muted)', cursor:'pointer' }}
          onClick={() => navigate('/')}>
          ← Back to Home
        </p>
      </div>
    </div>
  );
}