import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import ExportButton from '../../components/ExportButton';
import { attendanceService } from '../../services/attendanceService';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#22c55e', '#ef4444', '#5b8dee', '#f59e0b'];

export default function AdminDashboard() {
  const [summary,    setSummary]    = useState(null);
  const [deptData,   setDeptData]   = useState([]);
  const [pieData,    setPieData]    = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

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
          { name: 'Present', value: s.overallAttendance || 0 },
          { name: 'Absent',  value: 100 - (s.overallAttendance || 0) },
        ]);

        const sw = studentWiseRes.data.data || [];
        setDefaulters(sw.filter(s => s.isDefaulter));

        const bw = batchWiseRes.data.data || [];
        setDeptData(bw.map(b => ({
          name:     b.batch.replace('CE-', ''),
          students: b.students,
          faculty:  0,
        })));
      } catch (e) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const exportRows = defaulters.map(s => [
    s.name, s.rollNo, s.className, s.percentage + '%', 'DEFAULTER'
  ]);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'var(--text-muted)' }}>
      <p>Loading dashboard...</p>
    </div>
  );

  if (error) return (
    <div className="card" style={{ color:'var(--danger)', padding:40, textAlign:'center' }}>
      <p style={{ fontSize:28, marginBottom:12 }}>⚠️</p>
      <p>{error}</p>
    </div>
  );

  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1>Admin Dashboard</h1>
          <p>System overview &amp; quick stats</p>
        </div>
        <ExportButton
          title="Defaulters Report"
          headers={['Name','Roll No','Class','Attendance','Status']}
          rows={exportRows}
        />
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        <StatCard title="Total Students"     value={summary?.totalStudents  || 0}           icon="🎓" color="#5b8dee" sub={`${defaulters.length} defaulters`}/>
        <StatCard title="Total Faculty"      value={summary?.totalFaculty   || 7}           icon="👨‍🏫" color="#22c55e"/>
        <StatCard title="Overall Attendance" value={(summary?.overallAttendance || 0) + '%'} icon="📊" color="#f59e0b" sub={summary?.hasData ? 'Last 30 days' : 'No data yet'}/>
        <StatCard title="Defaulters"         value={summary?.defaulters     || 0}           icon="⚠️" color="#ef4444" sub="Below 75%"/>
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom:24 }}>
        <ChartCard title="Attendance Overview">
          {summary?.hasData ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]}/>)}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:220, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', flexDirection:'column', gap:8 }}>
              <p style={{ fontSize:28 }}>📊</p>
              <p style={{ fontSize:13 }}>No attendance data yet</p>
              <p style={{ fontSize:12 }}>Mark attendance to see charts</p>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Batch Strength">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData}>
              <XAxis dataKey="name" tick={{ fontSize:12 }}/>
              <YAxis tick={{ fontSize:12 }}/>
              <Tooltip/>
              <Legend/>
              <Bar dataKey="students" name="Students" fill="#5b8dee" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Defaulters table */}
      <div className="card">
        <h3 style={{ marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
          <span>⚠️</span> Defaulters List
          <span className="badge badge-danger" style={{ marginLeft:'auto' }}>{defaulters.length} students</span>
        </h3>
        {defaulters.length === 0 ? (
          <div style={{ textAlign:'center', padding:'32px 20px', color:'var(--text-muted)' }}>
            <p style={{ fontSize:28, marginBottom:8 }}>🎉</p>
            <p style={{ fontWeight:600 }}>
              {summary?.hasData ? 'No defaulters right now!' : 'No attendance data yet — mark attendance to see defaulters'}
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Student</th><th>Roll No</th><th>Class</th><th>Attendance</th><th>Status</th></tr>
              </thead>
              <tbody>
                {defaulters.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight:600 }}>{s.name}</td>
                    <td>{s.rollNo}</td>
                    <td>{s.className}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ flex:1, background:'#fee2e2', borderRadius:4, height:8 }}>
                          <div style={{ background:'#ef4444', height:'100%', width:s.percentage+'%', borderRadius:4 }}/>
                        </div>
                        <span style={{ fontSize:13, fontWeight:700, color:'#ef4444' }}>{s.percentage}%</span>
                      </div>
                    </td>
                    <td><span className="badge badge-danger">Defaulter</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid-3" style={{ marginTop:24 }}>
        {[
          { to:'/admin/users',      icon:'👥', label:'Manage Users',  desc:'Add or remove students & faculty' },
          { to:'/admin/timetable',  icon:'📅', label:'Timetable',     desc:'Edit class schedules' },
          { to:'/analytics',        icon:'📊', label:'Analytics',     desc:'Deep dive into reports' },
        ].map(q => (
          <Link to={q.to} key={q.to} className="card" style={{ display:'block', transition:'box-shadow 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}>
            <div style={{ fontSize:28, marginBottom:8 }}>{q.icon}</div>
            <h4 style={{ fontFamily:'Syne', marginBottom:4 }}>{q.label}</h4>
            <p style={{ fontSize:13, color:'var(--text-muted)' }}>{q.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}