import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, width = '480px' }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,31,60,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '28px', width, maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.2s ease' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontFamily: 'Syne', fontSize: '18px' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', color: 'var(--text-muted)', cursor: 'pointer' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}