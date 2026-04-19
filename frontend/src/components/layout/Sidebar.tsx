
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, Users, BookOpen, FileSpreadsheet, 
  CalendarCheck, FileOutput, User as UserIcon, LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const Sidebar = () => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/students', icon: Users, label: 'Students' },
    { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { to: '/admin/marks', icon: FileSpreadsheet, label: 'Marks' },
    { to: '/admin/attendance', icon: CalendarCheck, label: 'Attendance' },
    { to: '/admin/reports', icon: FileOutput, label: 'Reports' },
  ];

  const studentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/courses', icon: BookOpen, label: 'My Courses' },
    { to: '/student/marks', icon: FileSpreadsheet, label: 'My Marks' },
    { to: '/student/attendance', icon: CalendarCheck, label: 'Attendance' },
    { to: '/student/profile', icon: UserIcon, label: 'Profile' },
  ];

  const links = role === 'admin' ? adminLinks : studentLinks;
  const accentColor = role === 'admin' ? 'bg-admin-accent/20 text-admin-accent' : 'bg-student-accent/20 text-student-accent';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-64 h-screen border-r border-white/10 bg-card/50 backdrop-blur-xl flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6">
        <h1 className="text-xl font-bold bg-primary-gradient bg-clip-text text-transparent">SIS Portal</h1>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{role} View</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/5 text-gray-300 hover:text-white",
              isActive && accentColor
            )}
          >
            <link.icon className="w-5 h-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium w-full text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};
