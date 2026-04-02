import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import ExportButton from '../../components/ExportButton';
import { attendanceService } from '../../services/attendanceService';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#22c55e', '#ef4444', '#5b8dee', '#f59e0b'];

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [deptData, setDeptData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [studentWise, setStudentWise] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [summaryRes, studentWiseRes, batchWiseRes] = await Promise.all([
          attendanceService.getSummary(),
          attendanceService.getStudentWise(),
          attendanceService.getBatchWise(),
        ]);

        const s = summaryRes.data.data;
        setSummary(s);

        setPieData([
          { name: 'Present', value: s.overallAttendance },
          { name: 'Absent', value: 100 - s.overallAttendance },
        ]);

        const sw = studentWiseRes.data.data || [];
        setStudentWise(sw);

        const bw = batchWiseRes.data.data || [];
        setDeptData(
          bw.map(b => ({
            name: b.batch.replace('CE-', ''),
            students: b.students,
            defaulters: b.defaulters,
            avg: b.avgAttendance,
          }))
        );

      } catch (e) {
        setError('Failed to load dashboard data. Is the backend running?');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // ✅ FIX: derive defaulters safely every render
  const defaulters = studentWise.filter(s => s.isDefaulter);

  // ✅ FIX: export data ALWAYS consistent
  const exportRows = defaulters.map(s => [
    s.name,
    s.rollNo,
    s.className,
    s.percentage + '%',
    'DEFAULTER'
  ]);

  if (loading) return <p style={{ textAlign: 'center' }}>Loading dashboard...</p>;

  if (error) return (
    <div style={{ color: 'red', textAlign: 'center', padding: 40 }}>
      {error}
    </div>
  );

  return (
    <div>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1>Admin Dashboard</h1>
          <p>System overview & quick stats</p>
        </div>

        {/* ✅ EXPORT BUTTON */}
        <ExportButton
          title="Defaulters Report"
          headers={['Name', 'Roll No', 'Class', 'Attendance', 'Status']}
          rows={exportRows}
        />
      </div>

      {/* STATS */}
      <div className="grid-4">
        <StatCard title="Total Students" value={summary?.totalStudents || 0} />
        <StatCard title="Total Faculty" value={summary?.totalFaculty || 0} />
        <StatCard title="Overall Attendance" value={(summary?.overallAttendance || 0) + '%'} />
        <StatCard title="Defaulters" value={defaulters.length} />
      </div>

      {/* DEFUALTERS TABLE */}
      <div className="card">
        <h3>Defaulters List</h3>

        {defaulters.length === 0 ? (
          <p>No defaulters 🎉</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll No</th>
                <th>Class</th>
                <th>Attendance</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {defaulters.map(s => (
                <tr key={s.rollNo}>
                  <td>{s.name}</td>
                  <td>{s.rollNo}</td>
                  <td>{s.className}</td>
                  <td>{s.percentage}%</td>
                  <td>Defaulter</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}