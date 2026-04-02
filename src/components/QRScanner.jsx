import { useEffect, useRef } from 'react';

// Standalone QR canvas — same pixel-hash algo used everywhere
export function QRCodeDisplay({ value, size = 200 }) {
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
    [[0,0],[18,0],[0,18]].forEach(([x, y]) => {
      ctx.fillStyle = '#1a1f3c'; ctx.fillRect(x*cs, y*cs, 7*cs, 7*cs);
      ctx.fillStyle = '#fff';    ctx.fillRect((x+1)*cs, (y+1)*cs, 5*cs, 5*cs);
      ctx.fillStyle = '#1a1f3c'; ctx.fillRect((x+2)*cs, (y+2)*cs, 3*cs, 3*cs);
    });
  }, [value, size]);
  return <canvas ref={ref} style={{ borderRadius: 8, display: 'block' }} />;
}

// Default export kept for backward-compat (not used by new pages)
export default function QRScanner() {
  return <div style={{ padding: 20, color: 'var(--text-muted)' }}>Use AttendanceCapture page for QR sessions.</div>;
}