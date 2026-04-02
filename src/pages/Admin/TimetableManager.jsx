import { useState } from 'react';
import { TIMETABLE, SUBJECTS, USERS } from '../../services/mockData';
import Modal from '../../components/Modal';
import './admin.css';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];

export default function TimetableManager() {
  const [slots,     setSlots]     = useState(TIMETABLE);
  const [showModal, setShowModal] = useState(false);
  const [editSlot,  setEditSlot]  = useState(null);
  const [form,      setForm]      = useState({ day: 'Monday', time: '', subject: '', class: '', room: '', facultyId: '' });

  const subjectName = (id) => SUBJECTS.find(s => s.id === id)?.name || id;
  const facultyName = (id) => USERS.find(u => u.id === id)?.name || id;

  const openAdd  = () => { setEditSlot(null); setForm({ day: 'Monday', time: '', subject: '', class: '', room: '', facultyId: '' }); setShowModal(true); };
  const openEdit = (slot) => { setEditSlot(slot); setForm({ ...slot }); setShowModal(true); };
  const save = () => {
    if (editSlot) setSlots(p => p.map(s => s.id === editSlot.id ? { ...s, ...form } : s));
    else          setSlots(p => [...p, { id: 'tt' + Date.now(), ...form }]);
    setShowModal(false);
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div><h1>Timetable Manager</h1><p>View and edit class schedules</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Slot</button>
      </div>

      <div className="card">
        <div className="table-wrap tt-table">
          <table>
            <thead><tr>{DAYS.map(d => <th key={d} style={{ minWidth: '160px' }}>{d}</th>)}</tr></thead>
            <tbody>
              <tr>
                {DAYS.map(day => (
                  <td key={day} style={{ verticalAlign: 'top', padding: '12px' }}>
                    {slots.filter(s => s.day === day).map(slot => (
                      <div key={slot.id} className="tt-slot">
                        <p style={{ fontWeight: 700, fontSize: '12px', color: 'var(--primary)' }}>{slot.time}</p>
                        <p style={{ fontWeight: 600, fontSize: '13px' }}>{subjectName(slot.subject)}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{slot.class} • {slot.room}</p>
                        <p style={{ fontSize: '11px', color: 'var(--accent)' }}>{facultyName(slot.facultyId)}</p>
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                          <button onClick={() => openEdit(slot)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => setSlots(p => p.filter(s => s.id !== slot.id))} style={{ background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer' }}>Del</button>
                        </div>
                      </div>
                    ))}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editSlot ? 'Edit Slot' : 'Add Slot'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:600, marginBottom:4 }}>Day</label>
            <select value={form.day} onChange={e => setForm(p => ({...p, day: e.target.value}))}>{DAYS.map(d => <option key={d}>{d}</option>)}</select>
          </div>
          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:600, marginBottom:4 }}>Time</label>
            <input value={form.time} onChange={e => setForm(p => ({...p, time: e.target.value}))} placeholder="09:00 - 10:00" />
          </div>
          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:600, marginBottom:4 }}>Subject</label>
            <select value={form.subject} onChange={e => setForm(p => ({...p, subject: e.target.value}))}>
              <option value="">Select subject</option>
              {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}><label style={{ display:'block', fontSize:'13px', fontWeight:600, marginBottom:4 }}>Class</label><input value={form.class} onChange={e => setForm(p => ({...p, class: e.target.value}))} placeholder="CS-A" /></div>
            <div style={{ flex: 1 }}><label style={{ display:'block', fontSize:'13px', fontWeight:600, marginBottom:4 }}>Room</label><input value={form.room} onChange={e => setForm(p => ({...p, room: e.target.value}))} placeholder="LH-201" /></div>
          </div>
          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:600, marginBottom:4 }}>Faculty</label>
            <select value={form.facultyId} onChange={e => setForm(p => ({...p, facultyId: e.target.value}))}>
              <option value="">Select faculty</option>
              {USERS.filter(u => u.role === 'faculty').map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={save}>Save</button>
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}