import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import { userService } from '../../services/userService';
import ExportButton from '../../components/ExportButton';
import { formatDate } from '../../utils/dateUtils';

export default function AttendanceHistory() {
  const { user } = useContext(AuthContext);

  const [subjects,    setSubjects]    = useState([]);
  const [students,    setStudents]    = useState([]);
  const [records,     setRecords]     = useState([]);
  const [selectedSub, setSelectedSub] = useState('');
  const [search,      setSearch]      = useState('');
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  // Load subjects for this faculty
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

  // Load students + records when subject changes
  useEffect(() => {
    if (!selectedSub) return;
    async function loadData() {
      try {
        setLoading(true);
        const [studentsRes, recordsRes] = await Promise.all([
          userService.getStudents(),
          attendanceService.getSubjectHistory(selectedSub),
        ]);
        setStudents(studentsRes.data.data || []);
        setRecords(recordsRes.data.data || []);
      } catch (e) {
        setError('Failed to load attendance history.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedSub]);

  const subject = subjects.find(s => s.id === selectedSub);

  // Get unique sorted dates (last 10)
  const dates = [...new Set(records.map(r => r.date))]
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 10);

  const filtered = students.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStatus = (studentId, date) => {
    const rec = records.find(r => r.studentId === studentId && r.date === date);
    return rec?.status || '-';
  };

  const getStudentStats = (studentId) => {
    const recs    = records.filter(r => r.studentId === studentId);
    const present = recs.filter(r => r.status === 'present').length;
    const pct     = recs.length ? Math.round(present / recs.length * 100) : 0;
    return { present, absent: recs.length - present, pct };
  };

  const exportRows = filtered.map(s => {
    const { present, absent, pct } = getStudentStats(s.id);
    return [s.name, s.rollNo, present, absent, pct + '%'];
  });

  if (loading && subjects.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
      <p>Loading...</p>
    </div>
  );

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Attendance History</h1><p>Past 10 dates per subject</p></div>
        <ExportButton
          title={`${subject?.name || 'Subject'} Attendance`}
          headers={['Name', 'Roll No', 'Present', 'Absent', '%']}
          rows={exportRows}
        />
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <select value={selectedSub} onChange={e => setSelectedSub(e.target.value)} style={{ maxWidth: 280 }}>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input
          placeholder="Search student..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 220 }}
        />
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          <p>Loading attendance records...</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll No</th>
                  {dates.map(d => (
                    <th key={d} style={{ minWidth: 70, fontSize: 11 }}>{formatDate(d).slice(0, 6)}</th>
                  ))}
                  <th>Overall</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const { pct } = getStudentStats(s.id);
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>{s.rollNo}</td>
                      {dates.map(d => {
                        const st = getStatus(s.id, d);
                        return (
                          <td key={d} style={{ textAlign: 'center' }}>
                            {st === 'present' ? <span style={{ color: 'var(--success)', fontSize: 16 }}>✓</span>
                              : st === 'absent' ? <span style={{ color: 'var(--danger)', fontSize: 16 }}>✗</span>
                              : <span style={{ color: 'var(--border)' }}>—</span>}
                          </td>
                        );
                      })}
                      <td>
                        <span className={`badge ${pct >= 75 ? 'badge-success' : 'badge-danger'}`}>{pct}%</span>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={dates.length + 3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
