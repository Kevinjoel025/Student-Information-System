import { Card } from '../../components/ui/Card';
import { Table, Tbody, Tr, Td } from '../../components/ui/Table';
import { BookOpen, BookCheck, ClipboardList } from 'lucide-react';

export const StudentDashboard = () => {
  const stats = [
    { label: 'Enrolled Courses', value: '4', icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-400/20' },
    { label: 'Average Marks', value: '82.5%', icon: BookCheck, color: 'text-green-400', bg: 'bg-green-400/20' },
    { label: 'Attendance', value: '94%', icon: ClipboardList, color: 'text-purple-400', bg: 'bg-purple-400/20' },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-student-accent/10 border border-student-accent/20 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-student-accent/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Alex Johnson!</h1>
          <p className="text-gray-300">You have 2 pending assignments and your overall attendance is excellent.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Academic Status</h2>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-48 h-48 rounded-full border-8 border-student-accent/20 flex flex-col items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-8 border-student-accent border-r-transparent border-b-transparent transform -rotate-45" />
              <span className="text-4xl font-bold text-white">Good</span>
              <span className="text-sm text-gray-400 mt-2">Overall Rating</span>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Recent Marks</h2>
          <Table>
            <Tbody>
              <Tr>
                <Td className="font-medium text-white">Data Structures</Td>
                <Td className="text-right text-green-400 font-bold">88/100 (A)</Td>
              </Tr>
              <Tr>
                <Td className="font-medium text-white">Database Systems</Td>
                <Td className="text-right text-blue-400 font-bold">75/100 (B)</Td>
              </Tr>
              <Tr>
                <Td className="font-medium text-white">Software Engineering</Td>
                <Td className="text-right text-green-400 font-bold">92/100 (A)</Td>
              </Tr>
            </Tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
};
