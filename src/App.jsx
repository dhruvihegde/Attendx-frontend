import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { QRSessionProvider } from './context/QRSessionContext';
import { RoleGuard } from './utils/roleGuard';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { useAuth } from './hooks/useAuth';

import LandingPage from './pages/Landing/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import ForgotPassword from './pages/Auth/ForgotPassword';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageUsers from './pages/Admin/ManageUsers';
import ManageDepartments from './pages/Admin/ManageDepartments';
import TimetableManager from './pages/Admin/TimetableManager';
import FacultyDashboard from './pages/Faculty/FacultyDashboard';
import MarkAttendance from './pages/Faculty/MarkAttendance';
import AttendanceHistory from './pages/Faculty/AttendanceHistory';
import FacultyTimetable from './pages/Faculty/FacultyTimetable';
import StudentDashboard from './pages/Student/StudentDashboard';
import AttendanceView from './pages/Student/AttendanceView';
import StudentTimetable from './pages/Student/StudentTimetable';
import AttendanceCapture from './pages/Capture/AttendanceCapture';
import AnalyticsPage from './pages/Analytics/AnalyticsPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';

function AppLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar toggleSidebar={() => setSidebarOpen(p => !p)} />
      <div className="page-wrapper">
        <Sidebar open={sidebarOpen} />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to={user.role === 'admin' ? '/admin' : user.role === 'faculty' ? '/faculty' : '/student'} replace />} />
            <Route path="/admin"            element={<RoleGuard allowedRoles={['admin']}><AdminDashboard /></RoleGuard>} />
            <Route path="/admin/users"       element={<RoleGuard allowedRoles={['admin']}><ManageUsers /></RoleGuard>} />
            <Route path="/admin/departments" element={<RoleGuard allowedRoles={['admin']}><ManageDepartments /></RoleGuard>} />
            <Route path="/admin/timetable"   element={<RoleGuard allowedRoles={['admin']}><TimetableManager /></RoleGuard>} />
            <Route path="/faculty"           element={<RoleGuard allowedRoles={['faculty']}><FacultyDashboard /></RoleGuard>} />
            <Route path="/faculty/mark"      element={<RoleGuard allowedRoles={['faculty']}><MarkAttendance /></RoleGuard>} />
            <Route path="/faculty/history"   element={<RoleGuard allowedRoles={['faculty']}><AttendanceHistory /></RoleGuard>} />
            <Route path="/faculty/timetable" element={<RoleGuard allowedRoles={['faculty']}><FacultyTimetable /></RoleGuard>} />
            <Route path="/student"           element={<RoleGuard allowedRoles={['student']}><StudentDashboard /></RoleGuard>} />
            <Route path="/student/attendance"element={<RoleGuard allowedRoles={['student']}><AttendanceView /></RoleGuard>} />
            <Route path="/student/timetable" element={<RoleGuard allowedRoles={['student']}><StudentTimetable /></RoleGuard>} />
            <Route path="/capture"           element={<RoleGuard allowedRoles={['admin','faculty']}><AttendanceCapture /></RoleGuard>} />
            <Route path="/analytics"         element={<RoleGuard allowedRoles={['admin','faculty']}><AnalyticsPage /></RoleGuard>} />
            <Route path="/notifications"     element={<NotificationsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <QRSessionProvider>
            <AppLayout />
          </QRSessionProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}