import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import ExportButton from '../../components/ExportButton';
import { formatDate } from '../../utils/dateUtils';
import './student.css';

export default function AttendanceView() {
  const { user } = useContext(AuthContext);

  const [stats,          setStats]          = useState([]);
  const [records,        setRecords]        = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading,        setLoading]        = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [error,          setError]          = useState(null);

  // Load subject stats on mount
  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await attendanceService.getStudentStats(user.id);
        const data = res.data.data || [];
        setStats(data);
        if (data.length > 0) setSelectedSubject(data[0].subjectId);
      } catch (e) {
        setError('Failed to load attendance data.');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [user.id]);

  // Load daily records when subject changes
  useEffect(() => {
    if (!selectedSubject) return;
    async function loadRecords() {
      try {
        setRecordsLoading(true);
        const res = await attendanceService.getStudentRecords(user.id, selectedSubject);
        setRecords(res.data.data || []);
      } catch (e) {
        setError('Failed to load records.');
      } finally {
        setRecordsLoading(false);
      }
    }
    loadRecords();
  }, [selectedSubject, user.id]);

  const subject    = stats.find(s => s.subjectId === selectedSubject);
  const exportRows = records.map(r => [formatDate(r.date), r.status.toUpperCase(), r.method || 'manual']);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
      <p>Loading your attendance...</p>
    </div>
  );

  if (error) return (
    <div className="card" style={{ color: 'var(--danger)', padding: 40, textAlign: 'center' }}>
      <p style={{ fontSize: 28, marginBottom: 12 }}>⚠️</p><p>{error}</p>
    </div>
  );

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>My Attendance</h1><p>Detailed subject-wise attendance records</p></div>
        <ExportButton
          title={`${user.name} - ${subject?.subjectName || ''}`}
          headers={['Date', 'Status', 'Method']}
          rows={exportRows}
        />
      </div>

      {/* Subject cards */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.subjectId}
            className={`subject-card ${s.percentage < 60 ? 'danger' : s.percentage < 75 ? 'warning' : ''}`}
            style={{ cursor: 'pointer', outline: selectedSubject === s.subjectId ? '2px solid var(--accent)' : 'none' }}
            onClick={() => setSelectedSubject(s.subjectId)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <h4 style={{ fontFamily: 'Syne', fontSize: 14 }}>{s.subjectName}</h4>
              <span className={`badge ${s.percentage >= 75 ? 'badge-success' : s.percentage >= 60 ? 'badge-warning' : 'badge-danger'}`}>
                {s.percentage}%
              </span>
            </div>
            <div className="attendance-bar-wrap">
              <div className="attendance-bar" style={{
                width: s.percentage + '%',
                background: s.percentage >= 75 ? 'var(--success)' : s.percentage >= 60 ? 'var(--warning)' : 'var(--danger)'
              }} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              {s.present} present / {s.absent} absent
            </p>
          </div>
        ))}
      </div>

      {/* Daily records table */}
      {selectedSubject && (
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 15 }}>
            {subject?.subjectName} — Daily Records
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
              ({records.length} classes)
            </span>
          </h3>

          {recordsLoading ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>Loading records...</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>#</th><th>Date</th><th>Status</th><th>Method</th></tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                        No records yet for this subject.
                      </td>
                    </tr>
                  ) : records
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((r, i) => (
                      <tr key={r.id}>
                        <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                        <td>{formatDate(r.date)}</td>
                        <td>
                          {r.status === 'present'
                            ? <span className="badge badge-success">✓ Present</span>
                            : <span className="badge badge-danger">✗ Absent</span>}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 13, textTransform: 'capitalize' }}>
                          {r.method || 'manual'}
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
