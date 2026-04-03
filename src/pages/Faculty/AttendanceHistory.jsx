import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import { userService } from '../../services/userService';
import api from '../../services/api';

function formatShortDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export default function AttendanceHistory() {
  const { user } = useContext(AuthContext);

  const [subjects,        setSubjects]        = useState([]);
  const [students,        setStudents]        = useState([]);
  const [records,         setRecords]         = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [search,          setSearch]          = useState('');
  const [batchFilter,     setBatchFilter]     = useState('all');
  const [loading,         setLoading]         = useState(true);
  const [tableLoading,    setTableLoading]    = useState(false);
  const [error,           setError]           = useState(null);

  // Load faculty subjects on mount
  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await api.get(`/subjects/faculty/${user.id}`);
        const subs = res.data.data || [];
        setSubjects(subs);
        if (subs.length > 0) setSelectedSubject(subs[0].id);
      } catch (e) {
        setError('Failed to load subjects.');
      } finally {
        setLoading(false);
      }
    }
    loadSubjects();
  }, [user.id]);

  // Load students + records when subject changes
  useEffect(() => {
    if (!selectedSubject) return;
    async function loadData() {
      try {
        setTableLoading(true);
        const [studentsRes, recordsRes] = await Promise.all([
          userService.getStudents(),
          attendanceService.getSubjectHistory(selectedSubject),
        ]);
        setStudents(studentsRes.data.data || []);
        setRecords(recordsRes.data.data   || []);
      } catch (e) {
        setError('Failed to load attendance data.');
      } finally {
        setTableLoading(false);
      }
    }
    loadData();
  }, [selectedSubject]);

  const batches = [...new Set(students.map(s => s.className))].sort();

  // Last 15 unique dates for this subject
  const allDates = [...new Set(records.map(r => r.date))]
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 15);

  const filteredStudents = students.filter(s => {
    const matchSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.rollNo || '').includes(search);
    const matchBatch = batchFilter === 'all' || s.className === batchFilter;
    return matchSearch && matchBatch;
  });

  // All dates this subject was ever held
  const allSubjectDates = [...new Set(records.map(r => r.date))];

  const getStatus = (studentId, date) => {
    const rec = records.find(r =>
      r.studentId === studentId && r.subjectId === selectedSubject && r.date === date
    );
    // No record = absent (class was held but student not marked present)
    return rec?.status || 'absent';
  };

  const getOverall = (studentId) => {
    // Calculate over ALL dates subject was held, not just last 15 shown
    const totalClasses = allSubjectDates.length;
    if (totalClasses === 0) return 0;
    const present = allSubjectDates.filter(date => {
      const rec = records.find(r =>
        r.studentId === studentId && r.subjectId === selectedSubject && r.date === date
      );
      return rec?.status === 'present';
    }).length;
    return Math.round(present / totalClasses * 100);
  };

  // Summary stats based on displayed dates
  const totalPresent   = allDates.reduce((acc, date) =>
    acc + students.filter(s => getStatus(s.id, date) === 'present').length, 0);
  const totalCells     = allDates.length * students.length;
  const overallPct     = totalCells ? Math.round(totalPresent / totalCells * 100) : 0;
  const defaulterCount = students.filter(s => getOverall(s.id) < 75).length;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
      <p>Loading...</p>
    </div>
  );

  if (error) return (
    <div className="card" style={{ color: 'var(--danger)', padding: 40, textAlign: 'center' }}>
      <p style={{ fontSize: 28, marginBottom: 12 }}>⚠️</p>
      <p>{error}</p>
    </div>
  );

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Attendance History</h1>
          <p>Last 15 days — all {students.length} students</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} style={{ maxWidth: 280 }}>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input
          placeholder="🔍 Search name / roll no"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 220 }}
        />
        <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)} style={{ width: 'auto' }}>
          <option value="all">All Batches</option>
          {batches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { icon: '👥', label: 'Total Students', value: students.length,   color: '#5b8dee' },
          { icon: '📅', label: 'Days Shown',     value: allDates.length,   color: '#8b5cf6' },
          { icon: '📊', label: 'Avg Attendance', value: overallPct + '%',  color: overallPct >= 75 ? '#22c55e' : '#ef4444' },
          { icon: '⚠️', label: 'Defaulters',     value: defaulterCount,    color: '#ef4444' },
        ].map((s, i) => (
          <div key={i} className="card animate-in" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 10, background: s.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>{s.label}</p>
              <p style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Syne', color: 'var(--primary)', lineHeight: 1.1 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        {tableLoading ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
            <p>Loading records...</p>
          </div>
        ) : allDates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>📭</p>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>No attendance records found</p>
            <p style={{ fontSize: 13 }}>Records will appear here once attendance is marked for this subject.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Showing <strong>{filteredStudents.length}</strong> of {students.length} students · Last <strong>{allDates.length}</strong> days
              </p>
              <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: 'var(--success)', fontSize: 16, fontWeight: 700 }}>✓</span> Present
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: 'var(--danger)', fontSize: 16, fontWeight: 700 }}>✗</span> Absent
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: 'var(--border)', fontSize: 16 }}>—</span> No data
                </span>
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ position: 'sticky', left: 0, background: '#f8faff', zIndex: 2, minWidth: 180 }}>Student</th>
                    <th style={{ minWidth: 100 }}>Roll No</th>
                    <th style={{ minWidth: 70 }}>Batch</th>
                    {allDates.map(d => (
                      <th key={d} style={{ minWidth: 60, textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {formatShortDate(d)}
                      </th>
                    ))}
                    <th style={{ minWidth: 80, textAlign: 'center' }}>Overall</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(s => {
                    const pct = getOverall(s.id);
                    return (
                      <tr key={s.id}>
                        <td style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 1, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: pct >= 75 ? '#22c55e' : '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                              {s.avatar}
                            </div>
                            {s.name}
                          </div>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.rollNo}</td>
                        <td><span className="badge badge-info">{s.className}</span></td>
                        {allDates.map(d => {
                          const status = getStatus(s.id, d);
                          return (
                            <td key={d} style={{ textAlign: 'center', padding: '8px 4px' }}>
                              {status === 'present'
                                ? <span style={{ color: 'var(--success)', fontSize: 16, fontWeight: 700 }}>✓</span>
                                : status === 'absent'
                                ? <span style={{ color: 'var(--danger)', fontSize: 16, fontWeight: 700 }}>✗</span>
                                : <span style={{ color: 'var(--border)' }}>—</span>}
                            </td>
                          );
                        })}
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${pct >= 75 ? 'badge-success' : 'badge-danger'}`}>{pct}%</span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={allDates.length + 4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                        No students match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}