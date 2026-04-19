
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './pages/auth/Login';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentManagement } from './pages/admin/StudentManagement';
import { StudentDashboard } from './pages/student/StudentDashboard';

// Placeholder Pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center p-12 glass rounded-2xl animate-fade-in w-full h-full min-h-[400px]">
    <h2 className="text-2xl font-semibold text-gray-300">{title} (Coming Soon)</h2>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<DashboardLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<StudentManagement />} />
        <Route path="courses" element={<Placeholder title="Course Management" />} />
        <Route path="marks" element={<Placeholder title="Marks Management" />} />
        <Route path="attendance" element={<Placeholder title="Attendance Management" />} />
        <Route path="reports" element={<Placeholder title="Reports" />} />
      </Route>

      {/* Student Routes */}
      <Route path="/student" element={<DashboardLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="courses" element={<Placeholder title="My Courses" />} />
        <Route path="marks" element={<Placeholder title="My Marks" />} />
        <Route path="attendance" element={<Placeholder title="My Attendance" />} />
        <Route path="profile" element={<Placeholder title="My Profile" />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
