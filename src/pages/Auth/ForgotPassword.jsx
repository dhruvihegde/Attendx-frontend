import { useState } from 'react';
import { Link } from 'react-router-dom';
import './auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent,  setSent]  = useState(false);

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">A</div>
          <div><h2 style={{ fontFamily: 'Syne', fontSize: '18px', color: 'var(--primary)' }}>AttendX</h2></div>
        </div>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
            <h2 className="auth-title">Email Sent!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              Password reset instructions sent to <strong>{email}</strong>
            </p>
            <Link to="/login" className="btn btn-primary" style={{ justifyContent: 'center', display: 'flex' }}>← Back to Login</Link>
          </div>
        ) : (
          <>
            <h1 className="auth-title">Reset Password</h1>
            <p className="auth-sub">Enter your email to receive reset instructions</p>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '8px' }} onClick={() => email && setSent(true)}>
              Send Reset Link
            </button>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Link to="/login" style={{ fontSize: '13px', color: 'var(--accent)' }}>← Back to Login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}