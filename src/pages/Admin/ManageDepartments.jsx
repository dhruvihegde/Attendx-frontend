import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import api from '../../services/api';
import './admin.css';

export default function ManageDepartments() {
  const [depts,     setDepts]     = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState(null);
  const [form, setForm] = useState({ name: '', hod: '', students: 0, faculty: 0 });

  useEffect(() => { fetchDepts(); }, []);

  async function fetchDepts() {
    try {
      setLoading(true);
      const res = await api.get('/departments');
      setDepts(res.data.data || []);
    } catch (e) {
      setError('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!form.name || !form.hod) return;
    try {
      setSaving(true);
      const res = await api.post('/departments', form);
      setDepts(p => [...p, res.data.data]);
      setShowModal(false);
      setForm({ name: '', hod: '', students: 0, faculty: 0 });
    } catch (e) {
      alert('Failed to add department.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this department?')) return;
    try {
      await api.delete(`/departments/${id}`);
      setDepts(p => p.filter(d => d.id !== id));
    } catch (e) {
      alert('Failed to delete department.');
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
      <p>Loading departments...</p>
    </div>
  );

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div><h1>Departments</h1><p>Manage academic departments</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Department</button>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div className="grid-3">
        {depts.length === 0 ? (
          <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>🏛️</p>
            <p>No departments yet. Add one to get started.</p>
          </div>
        ) : depts.map((d, i) => (
          <div className="dept-card animate-in" key={d.id} style={{ animationDelay: `${i * 0.07}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontFamily: 'Syne', fontSize: 16 }}>{d.name}</h3>
              <button
                onClick={() => handleDelete(d.id)}
                style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 16 }}>
                🗑
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 14 }}>HOD: {d.hod}</p>
            <div style={{ display: 'flex', gap: 16 }}>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Syne', color: 'var(--accent)' }}>{d.students}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Students</p>
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Syne', color: 'var(--success)' }}>{d.faculty}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Faculty</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Department">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Department Name</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Computer Engineering" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Head of Department</label>
            <input value={form.hod} onChange={e => setForm(p => ({ ...p, hod: e.target.value }))} placeholder="Dr. Name" />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Students</label>
              <input type="number" value={form.students} onChange={e => setForm(p => ({ ...p, students: +e.target.value }))} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Faculty</label>
              <input type="number" value={form.faculty} onChange={e => setForm(p => ({ ...p, faculty: +e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleAdd} disabled={saving}>
              {saving ? 'Adding...' : 'Add Department'}
            </button>
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
