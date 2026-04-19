
import { Card } from '../../components/ui/Card';
import { Users, BookOpen, FileSpreadsheet, CalendarCheck } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export const AdminDashboard = () => {
  const stats = [
    { label: 'Total Students', value: '1,248', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/20' },
    { label: 'Total Courses', value: '42', icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-400/20' },
    { label: 'Marks Entries', value: '5,830', icon: FileSpreadsheet, color: 'text-green-400', bg: 'bg-green-400/20' },
    { label: 'Avg Attendance', value: '89%', icon: CalendarCheck, color: 'text-orange-400', bg: 'bg-orange-400/20' },
  ];

  const barData = {
    labels: ['CS101', 'MA201', 'PH102', 'CH103', 'EE104'],
    datasets: [{
      label: 'Average Marks',
      data: [85, 76, 88, 72, 81],
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderRadius: 4
    }]
  };

  const pieData = {
    labels: ['A (Excellent)', 'B (Good)', 'C (Average)', 'F (Fail)'],
    datasets: [{
      data: [45, 30, 20, 5],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#9CA3AF' } }
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9CA3AF' } },
      x: { grid: { display: false }, ticks: { color: '#9CA3AF' } }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-sm text-gray-400">Welcome back, Admin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} hoverable className="flex items-center gap-4">
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-400">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4">Marks per Subject</h2>
          <div className="h-[300px] flex items-center justify-center">
            <Bar data={barData} options={chartOptions} />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Grade Distribution</h2>
          <div className="h-[300px] flex items-center justify-center">
            <Pie data={pieData} options={{...chartOptions, scales: {}}} />
          </div>
        </Card>
      </div>
    </div>
  );
};
