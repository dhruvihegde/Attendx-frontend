import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { attendanceService } from '../../services/attendanceService';
import '../Faculty/faculty.css';

export default function MarkAttendance() {
  const { user } = useContext(AuthContext);

  const [subjects,    setSubjects]    = useState([]);
  const [students,    setStudents]    = useState([]);
  const [attendance,  setAttendance]  = useState({});
  const [selectedSub, setSelectedSub] = useState('');
  const [date,        setDate]        = useState(new Date().toISOString().split('T')[0]);
  const [search,      setSearch]      = useState('');
  const [batchFilter, setBatchFilter] = useState('all');
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState(null);

  // Load subjects assigned to this faculty
  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/subjects/faculty/${user.id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('attendx_token')}` } }
        );
        const data = await res.json();
        const subs = data.data || [];
        setSubjects(subs);
        if (subs.length > 0) setSelectedSub(subs[0].id);
      } catch (e) {
        setError('Failed to load subjects.');
      }
    }
    loadSubjects();
  }, [user.id]);

  // Load all students when subject changes
  useEffect(() => {
    async function loadStudents() {
      if (!selectedSub) return;
      try {
        setLoading(true);
        setAttendance({});
        setSaved(false);
        const res = await userService.getStudents();
        setStudents(res.data.data || []);
      } catch (e) {
        setError('Failed to load students.');
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, [selectedSub]);

  const batches = [...new Set(students.map(s => s.className))].sort();

  const filtered = students.filter(s => {
    const matchSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.rollNo || '').includes(search);
    const matchBatch = batchFilter === 'all' || s.className === batchFilter;
    return matchSearch && matchBatch;
  });

  const toggle   = (id) => { setAttendance(p => ({ ...p, [id]: p[id] === 'present' ? 'absent' : 'present' })); setSaved(false); };
  const markAll  = (status) => { const all = {}; filtered.forEach(s => { all[s.id] = status; }); setAttendance(p => ({ ...p, ...all })); setSaved(false); };
  const getStatus = (id) => attendance[id] || 'not-marked';

  const presentCount  = students.filter(s => attendance[s.id] === 'present').length;
  const absentCount   = students.filter(s => attendance[s.id] === 'absent').length;
  const unmarkedCount = students.length - presentCount - absentCount;

  async function handleSave() {
    if (students.length === 0) return;
    try {
      setSaving(true);
      const records = students.map(s => ({
        studentId: s.id,
        status: attendance[s.id] || 'absent',
      }));
      await attendanceService.markAttendance(selectedSub, date, records, 'manual');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert('Failed to save attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (subjects.length === 0 && !loading) return (
    <div>
      <div className="page-header"><h1>Mark Attendance</h1></div>
      <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
        <p style={{ fontSize: 32, marginBottom: 12 }}>📭</p>
        <p style={{ fontWeight: 600 }}>No subjects assigned to you.</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>Mark Attendance</h1>
        <p>Select subject and date — mark all 59 students</p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Config bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Subject</label>
            <select value={selectedSub} onChange={e => setSelectedSub(e.target.value)}>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: 'auto' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-success btn-sm" onClick={() => markAll('present')}>✓ All Present</button>
            <button className="btn btn-danger btn-sm"  onClick={() => markAll('absent')}>✗ All Absent</button>
          </div>
        </div>

        {/* Summary row */}
        <div style={{ display: 'flex', gap: 20, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
            <span><strong style={{ color: 'var(--success)', fontSize: 18, fontFamily: 'Syne' }}>{presentCount}</strong> <span style={{ color: 'var(--text-muted)' }}>Present</span></span>
            <span><strong style={{ color: 'var(--danger)',  fontSize: 18, fontFamily: 'Syne' }}>{absentCount}</strong>  <span style={{ color: 'var(--text-muted)' }}>Absent</span></span>
            <span><strong style={{ color: 'var(--text-muted)', fontSize: 18, fontFamily: 'Syne' }}>{unmarkedCount}</strong> <span style={{ color: 'var(--text-muted)' }}>Unmarked</span></span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              placeholder="🔍 Search name / roll no"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 200, fontSize: 13, padding: '7px 12px' }}
            />
            <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)} style={{ width: 'auto', fontSize: 13, padding: '7px 12px' }}>
              <option value="all">All Batches</option>
              {batches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
      </div>

      {saved && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#16a34a', fontWeight: 600 }}>
          ✅ Attendance saved — {presentCount} present, {absentCount} absent!
        </div>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          <p>Loading students...</p>
        </div>
      ) : (
        <>
          {batchFilter === 'all' ? (
            batches.map(batch => {
              const batchStudents = filtered.filter(s => s.className === batch);
              if (!batchStudents.length) return null;
              return (
                <div key={batch} style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ height: 2, flex: 1, background: 'var(--border)' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', background: 'var(--bg)', padding: '4px 14px', borderRadius: 20, border: '1px solid var(--border)' }}>
                      {batch} — {batchStudents.length} students
                    </span>
                    <div style={{ height: 2, flex: 1, background: 'var(--border)' }} />
                  </div>
                  <div className="attendance-grid">
                    {batchStudents.map(s => {
                      const status = getStatus(s.id);
                      return (
                        <div key={s.id} className={`student-att-card ${status !== 'not-marked' ? status : ''}`} onClick={() => toggle(s.id)}>
                          <div style={{ width: 38, height: 38, borderRadius: '50%', background: status === 'present' ? 'var(--success)' : status === 'absent' ? 'var(--danger)' : 'var(--border)', color: status !== 'not-marked' ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                            {s.avatar}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.rollNo}</p>
                          </div>
                          <div style={{ fontSize: 18 }}>
                            {status === 'present' ? '✅' : status === 'absent' ? '❌' : '⬜'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="attendance-grid">
              {filtered.map(s => {
                const status = getStatus(s.id);
                return (
                  <div key={s.id} className={`student-att-card ${status !== 'not-marked' ? status : ''}`} onClick={() => toggle(s.id)}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: status === 'present' ? 'var(--success)' : status === 'absent' ? 'var(--danger)' : 'var(--border)', color: status !== 'not-marked' ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                      {s.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.rollNo} · {s.className}</p>
                    </div>
                    <div style={{ fontSize: 18 }}>
                      {status === 'present' ? '✅' : status === 'absent' ? '❌' : '⬜'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 28, marginBottom: 8 }}>🔍</p>
              <p>No students match your search.</p>
            </div>
          )}

          {students.length > 0 && (
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-outline" onClick={() => { setAttendance({}); setSaved(false); }}>Reset</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : `💾 Save Attendance (${students.length} students)`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
