import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import UserAvatar from '../../components/UserAvatar';
import Modal from '../../components/Modal';
import '../Admin/admin.css';

export default function ManageUsers() {
  const [users,     setUsers]     = useState([]);
  const [filter,    setFilter]    = useState('all');
  const [search,    setSearch]    = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteId,  setDeleteId]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState(null);
  const [form, setForm] = useState({
    name: '', email: '', password: 'pass123', role: 'student', department: 'Computer Engineering', rollNo: '', className: ''
  });

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await userService.getAll();
      setUsers(res.data.data || []);
    } catch (e) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }

  const filtered = users.filter(u => {
    if (filter !== 'all' && u.role !== filter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase())
               && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  async function handleAdd() {
    if (!form.name || !form.email) return;
    try {
      setSaving(true);
      const res = await userService.create(form);
      setUsers(p => [...p, res.data.data]);
      setShowModal(false);
      setForm({ name: '', email: '', password: 'pass123', role: 'student', department: 'Computer Engineering', rollNo: '', className: '' });
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await userService.delete(id);
      setUsers(p => p.filter(u => u.id !== id));
      setDeleteId(null);
    } catch (e) {
      alert('Failed to delete user.');
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
      <p>Loading users...</p>
    </div>
  );

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Manage Users</h1><p>Add, view or remove students and faculty</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add User</button>
      </div>

      {error && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        {['all', 'student', 'faculty'].map(r => (
          <button key={r} className={`btn btn-sm ${filter === r ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(r)}>
            {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1) + 's'}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 13, alignSelf: 'center' }}>{filtered.length} users</span>
      </div>

      <div className="admin-users-grid">
        {filtered.map(u => (
          <div className="user-card" key={u.id}>
            <UserAvatar user={u} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{u.email}</p>
              <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                <span className={`badge ${u.role === 'student' ? 'badge-info' : 'badge-success'}`}>{u.role}</span>
                {u.rollNo && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.rollNo}</span>}
                {u.className && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.className}</span>}
              </div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(u.id)}>🗑</button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 28, marginBottom: 8 }}>🔍</p>
          <p>No users found.</p>
        </div>
      )}

      {/* Add User Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New User">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[['name', 'Full Name', 'Enter full name'], ['email', 'Email', 'email@college.edu']].map(([k, l, p]) => (
            <div key={k}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{l}</label>
              <input value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} placeholder={p} />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Password</label>
            <input value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Default: pass123" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Role</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Department</label>
            <input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} placeholder="Computer Engineering" />
          </div>
          {form.role === 'student' && (
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Roll No</label>
                <input value={form.rollNo} onChange={e => setForm(p => ({ ...p, rollNo: e.target.value }))} placeholder="24CE1001" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Class</label>
                <select value={form.className} onChange={e => setForm(p => ({ ...p, className: e.target.value }))}>
                  <option value="">Select class</option>
                  <option value="CE-A1">CE-A1</option>
                  <option value="CE-A2">CE-A2</option>
                  <option value="CE-A3">CE-A3</option>
                </select>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleAdd} disabled={saving}>
              {saving ? 'Adding...' : 'Add User'}
            </button>
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete" width="360px">
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Are you sure you want to remove this user?</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleDelete(deleteId)}>Delete</button>
          <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
