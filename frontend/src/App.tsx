
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './pages/auth/Login';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentManagement } from './pages/admin/StudentManagement';
import { AdminCourses } from './pages/admin/AdminCourses';
import { AdminResults } from './pages/admin/AdminResults';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentCourses } from './pages/student/StudentCourses';
import { StudentResults } from './pages/student/StudentResults';
import { StudentAttendance } from './pages/student/StudentAttendance';
import { AdminAttendance } from './pages/admin/AdminAttendance';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<DashboardLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<StudentManagement />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="marks" element={<AdminResults />} />
        <Route path="attendance" element={<AdminAttendance />} />
      </Route>

      {/* Student Routes */}
      <Route path="/student" element={<DashboardLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="courses" element={<StudentCourses />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="attendance" element={<StudentAttendance />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
