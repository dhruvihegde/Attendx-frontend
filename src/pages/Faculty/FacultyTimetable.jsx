import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { TIMETABLE, SUBJECTS } from '../../services/mockData';
import Modal from '../../components/Modal';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];

export default function FacultyTimetable() {
  const { user } = useAuth();
  const [slots,    setSlots]    = useState(TIMETABLE.filter(t => t.facultyId === user.id));
  const [editSlot, setEditSlot] = useState(null);
  const [form,     setForm]     = useState({});
  const subjectName = (id) => SUBJECTS.find(s => s.id === id)?.name || id;

  const save = () => { setSlots(p => p.map(s => s.id === editSlot.id ? { ...s, ...form } : s)); setEditSlot(null); };

  return (
    <div>
      <div className="page-header"><h1>My Timetable</h1><p>Your weekly class schedule</p></div>

      {DAYS.map(day => {
        const daySlots = slots.filter(s => s.day === day);
        if (daySlots.length === 0) return null;
        return (
          <div key={day} className="card" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontFamily: 'Syne', fontSize: '15px', marginBottom: '14px' }}>📅 {day}</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {daySlots.map(slot => (
                <div key={slot.id} style={{ background: 'linear-gradient(135deg,var(--accent),#4a7de0)', color: '#fff', borderRadius: '12px', padding: '16px 20px', minWidth: '200px', position: 'relative' }}>
                  <p style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>⏰ {slot.time}</p>
                  <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{subjectName(slot.subject)}</p>
                  <p style={{ fontSize: '12px', opacity: 0.8 }}>{slot.class} • {slot.room}</p>
                  <button onClick={() => { setEditSlot(slot); setForm({...slot}); }} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {slots.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '40px', marginBottom: '12px' }}>📅</p>
          <p>No timetable slots assigned.</p>
        </div>
      )}

      <Modal open={!!editSlot} onClose={() => setEditSlot(null)} title="Edit Slot">
        {editSlot && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div><label style={{ display:'block', fontSize:'13px', fontWeight:600, marginBottom:4 }}>Time</label><input value={form.time||''} onChange={e => setForm(p => ({...p, time: e.target.value}))} /></div>
            <div><label style={{ display:'block', fontSize:'13px', fontWeight:600, marginBottom:4 }}>Room</label><input value={form.room||''} onChange={e => setForm(p => ({...p, room: e.target.value}))} /></div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={save}>Save</button>
              <button className="btn btn-outline" onClick={() => setEditSlot(null)}>Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}