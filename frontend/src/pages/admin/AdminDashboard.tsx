
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Users, BookOpen, FileSpreadsheet, CalendarCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const shortcuts = [
    {
      label: 'Student Management',
      description: 'View, add, edit, and manage all student records',
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-400/20',
      hoverBorder: 'hover:border-blue-400/40',
      path: '/admin/students',
    },
    {
      label: 'Courses',
      description: 'Manage course listings and curriculum details',
      icon: BookOpen,
      color: 'text-purple-400',
      bg: 'bg-purple-400/20',
      hoverBorder: 'hover:border-purple-400/40',
      path: '/admin/courses',
    },
    {
      label: 'Results & Marks',
      description: 'Enter and review marks, grades, and GPA data',
      icon: FileSpreadsheet,
      color: 'text-green-400',
      bg: 'bg-green-400/20',
      hoverBorder: 'hover:border-green-400/40',
      path: '/admin/marks',
    },
    {
      label: 'Attendance',
      description: 'Track and update student attendance records',
      icon: CalendarCheck,
      color: 'text-orange-400',
      bg: 'bg-orange-400/20',
      hoverBorder: 'hover:border-orange-400/40',
      path: '/admin/attendance',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-admin-accent/15 to-purple-600/10 border border-admin-accent/20 p-8">
        <div className="absolute top-0 right-0 w-72 h-72 bg-admin-accent/15 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back{user?.name ? `, ${user.name}` : ''}!
          </h1>
          <p className="text-gray-300">
            Manage your institution from one place. Use the shortcuts below to jump into any section.
          </p>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shortcuts.map((item) => (
            <Card
              key={item.path}
              hoverable
              className={`cursor-pointer group transition-all duration-300 border border-white/10 ${item.hoverBorder}`}
              onClick={() => navigate(item.path)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-xl ${item.bg} transition-transform duration-300 group-hover:scale-110`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white group-hover:text-white/90 transition-colors">
                      {item.label}
                    </h3>
                    <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
