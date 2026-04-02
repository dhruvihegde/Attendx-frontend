import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, LineChart, Line, Legend, ReferenceLine,
} from 'recharts';
import './analytics.css';

const COLORS = ['#5b8dee', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#e84393'];

export default function AnalyticsPage() {
  const { user } = useContext(AuthContext);

  const [summary,     setSummary]     = useState(null);
  const [subjectWise, setSubjectWise] = useState([]);
  const [batchWise,   setBatchWise]   = useState([]);
  const [studentWise, setStudentWise] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [sumRes, subRes, batRes, stuRes] = await Promise.all([
          attendanceService.getSummary(),
          attendanceService.getSubjectWise(),
          attendanceService.getBatchWise(),
          attendanceService.getStudentWise(),
        ]);
        setSummary(sumRes.data.data);
        setSubjectWise(subRes.data.data || []);
        setBatchWise(batRes.data.data   || []);
        setStudentWise(stuRes.data.data || []);
      } catch (e) {
        setError('Failed to load analytics. Is the backend running?');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
      <p>Loading analytics...</p>
    </div>
  );

  if (error) return (
    <div className="card" style={{ color: 'var(--danger)', padding: 40, textAlign: 'center' }}>
      <p style={{ fontSize: 28, marginBottom: 12 }}>⚠️</p><p>{error}</p>
    </div>
  );

  const pieData = [
    { name: 'Present', value: summary?.overallAttendance || 0 },
    { name: 'Absent',  value: 100 - (summary?.overallAttendance || 0) },
  ];

  const defaulters = studentWise.filter(s => s.isDefaulter);

  return (
    <div>
      <div className="page-header">
        <h1>Analytics &amp; Reports</h1>
        <p>SE Computer Engineering — Semester IV attendance overview</p>
      </div>

      {/* Summary stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard title="Total Students"    value={summary?.totalStudents    || 0}        icon="🎓" color="#5b8dee" sub="Across 3 batches" />
        <StatCard title="Overall Attendance" value={(summary?.overallAttendance || 0) + '%'} icon="📊" color="#22c55e" sub="Last 30 days" />
        <StatCard title="Defaulters"        value={summary?.defaulters        || 0}        icon="⚠️" color="#ef4444" sub="Below 75%" />
        <StatCard title="Eligible Students" value={summary?.eligibleStudents  || 0}        icon="✅" color="#f59e0b" sub="Above 75%" />
      </div>

      {/* Row 1: Pie + Batch trend */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <ChartCard title="Overall Present vs Absent">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                <Cell fill="#22c55e" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip formatter={v => v + '%'} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Batch-wise Average Attendance">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={batchWise}>
              <XAxis dataKey="batch" tick={{ fontSize: 12 }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="4 4" />
              <Bar dataKey="avgAttendance" name="Avg %" radius={[8, 8, 0, 0]}>
                {batchWise.map((b, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Subject-wise bar */}
      <ChartCard title="Subject-wise Attendance %" action={<span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Red = below 75%</span>}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={subjectWise} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[60, 100]} tick={{ fontSize: 12 }} />
            <Tooltip formatter={v => v + '%'} />
            <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="4 4" />
            <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
              {subjectWise.map((s, i) => <Cell key={i} fill={s.percentage >= 75 ? '#22c55e' : '#ef4444'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Subject present vs absent stacked */}
      <div style={{ marginTop: 24, marginBottom: 24 }}>
        <ChartCard title="Subject — Present vs Absent (Total)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={subjectWise}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
              <Bar dataKey="absent"  stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Student-wise horizontal bar */}
      <ChartCard title="Student-wise Attendance" action={<span className="badge badge-danger">{defaulters.length} defaulters</span>}>
        <ResponsiveContainer width="100%" height={Math.max(400, studentWise.length * 22)}>
          <BarChart data={studentWise} layout="vertical" margin={{ left: 20, right: 20 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
            <Tooltip formatter={v => v + '%'} />
            <ReferenceLine x={75} stroke="#ef4444" strokeDasharray="4 4" />
            <Bar dataKey="percentage" radius={[0, 6, 6, 0]}>
              {studentWise.map((s, i) => <Cell key={i} fill={s.percentage >= 75 ? '#5b8dee' : '#ef4444'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
