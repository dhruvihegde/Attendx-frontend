import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './landing.css';

const features = [
  { icon: '📊', title: 'Real-time Analytics',  desc: 'Live attendance dashboards with pie charts, bar graphs and trend analysis.' },
  { icon: '📷', title: 'QR Code Capture',      desc: 'Students mark attendance from their dashboard the moment a session starts.' },
  { icon: '🔔', title: 'Smart Alerts',         desc: 'Automated notifications for low attendance, defaulters and announcements.' },
  { icon: '📋', title: 'Multi-role Access',    desc: 'Separate dashboards for Admin, Faculty and Students with role-based views.' },
  { icon: '📅', title: 'Timetable Manager',    desc: 'Full CRUD timetable management for admin and faculty to view their schedules.' },
  { icon: '⬇',  title: 'Export Reports',       desc: 'Download attendance reports in PDF or Excel format anytime.' },
];

const demos = [
  { role: 'Admin',     email: 'admin@college.edu',  password: 'admin123'   },
  { role: 'Faculty',   email: 'anita@college.edu',  password: 'faculty123' },
  { role: 'Student',   email: 'arjun@student.edu',  password: 'student123' },
  { role: 'Defaulter', email: 'rahul@student.edu',  password: 'student123' },
];

/* ── Aggressive Wave Canvas ── */
function WaveCanvas() {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const waves = [
      { amp: 130, period: 0.0022, speed: 1.6,  yBase: 0.58, r: 91,  g: 141, b: 238, a: 0.28, offset: 0   },
      { amp: 105, period: 0.0031, speed: 2.2,  yBase: 0.66, r: 232, g: 67,  b: 147, a: 0.22, offset: 2.1 },
      { amp: 150, period: 0.0018, speed: 1.2,  yBase: 0.48, r: 139, g: 92,  b: 246, a: 0.24, offset: 4.3 },
      { amp: 80,  period: 0.0042, speed: 3.0,  yBase: 0.74, r: 6,   g: 182, b: 212, a: 0.20, offset: 1.5 },
      { amp: 120, period: 0.0026, speed: 1.9,  yBase: 0.40, r: 91,  g: 141, b: 238, a: 0.18, offset: 3.7 },
      { amp: 70,  period: 0.0055, speed: 3.6,  yBase: 0.80, r: 232, g: 67,  b: 147, a: 0.16, offset: 0.9 },
    ];

    let t = 0;

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      waves.forEach(w => {
        // Filled wave body
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 3) {
          const y = H * w.yBase
            + Math.sin(x * w.period + t * w.speed + w.offset) * w.amp
            + Math.sin(x * w.period * 1.9 + t * w.speed * 0.6 + w.offset + 1.2) * (w.amp * 0.35)
            + Math.sin(x * w.period * 0.5 + t * w.speed * 1.4 + w.offset + 2.5) * (w.amp * 0.2);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, H * w.yBase - w.amp, 0, H);
        grad.addColorStop(0,   `rgba(${w.r},${w.g},${w.b},${w.a})`);
        grad.addColorStop(0.6, `rgba(${w.r},${w.g},${w.b},${w.a * 0.5})`);
        grad.addColorStop(1,   `rgba(${w.r},${w.g},${w.b},0)`);
        ctx.fillStyle = grad;
        ctx.fill();

        // Glowing crest line
        ctx.beginPath();
        for (let x = 0; x <= W; x += 3) {
          const y = H * w.yBase
            + Math.sin(x * w.period + t * w.speed + w.offset) * w.amp
            + Math.sin(x * w.period * 1.9 + t * w.speed * 0.6 + w.offset + 1.2) * (w.amp * 0.35)
            + Math.sin(x * w.period * 0.5 + t * w.speed * 1.4 + w.offset + 2.5) * (w.amp * 0.2);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${w.r},${w.g},${w.b},${w.a * 2.5})`;
        ctx.lineWidth   = 2.5;
        ctx.shadowColor = `rgba(${w.r},${w.g},${w.b},0.9)`;
        ctx.shadowBlur  = 22;
        ctx.stroke();
        ctx.shadowBlur  = 0;
      });

      t += 0.022;
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    />
  );
}

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <div className="landing-hero">
        {/* Glow orbs */}
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />

        {/* Animated waves */}
        <WaveCanvas />

        {/* Dot grid */}
        <div className="hero-dots" />
        <div className="hero-vignette" />

        <nav className="landing-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
            <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#5b8dee,#8b5cf6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Syne', fontWeight: 800, fontSize: '18px', boxShadow: '0 4px 20px rgba(91,141,238,0.4)' }}>A</div>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, color: '#fff', fontSize: '18px', letterSpacing: '-0.3px' }}>AttendX</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#demo">Demo</a>
            <Link to="/login">Login</Link>
          </div>
          <Link to="/login" className="btn btn-primary landing-btn">Get Started →</Link>
        </nav>

        <div className="hero-content">
          <div className="hero-badge">✨ Smart College Attendance System</div>

          <h1 className="hero-title">
            Attendance,<br />
            <span className="hero-grad">Reimagined.</span>
          </h1>

          <p className="hero-sub">
            A powerful, role-based attendance management platform with QR scanning,
            real-time analytics, and automated alerts built for modern colleges.
          </p>

          <div className="hero-btns">
            <Link to="/login" className="btn btn-primary landing-btn" style={{ padding: '14px 34px', fontSize: '15px' }}>🚀 Try Demo</Link>
            <a href="#features" className="btn landing-btn-ghost" style={{ padding: '14px 34px', fontSize: '15px' }}>Learn More</a>
          </div>

          <div className="features-grid" id="features">
            {features.map((f, i) => (
              <div className="feature-card animate-in" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="feature-icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="stats-row" style={{ marginTop: '52px' }}>
            <div className="stat-item"><strong>15</strong><span>Users</span></div>
            <div className="stat-item"><strong>7</strong><span>Subjects</span></div>
            <div className="stat-item"><strong>30</strong><span>Days Data</span></div>
            <div className="stat-item"><strong>100%</strong><span>Frontend</span></div>
          </div>
        </div>
      </div>

      {/* Demo bar */}
      <div className="demo-bar" id="demo">
        <p style={{ fontWeight: 700, fontFamily: 'Syne', marginRight: '8px', color: 'var(--primary)' }}>🔑 Demo Logins:</p>
        {demos.map(d => (
          <div className="demo-credential" key={d.role}>
            <strong>{d.role}</strong>
            {d.email}<br />
            <span style={{ color: 'var(--text-muted)' }}>pwd: {d.password}</span>
          </div>
        ))}
        <Link to="/login" className="btn btn-primary">Login Now</Link>
      </div>
    </div>
  );
}