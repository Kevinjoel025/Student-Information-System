import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Table, Tbody, Tr, Td } from '../../components/ui/Table';
import { BookOpen, BookCheck, ClipboardList, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getMyResults, getMyAttendance } from '../../lib/api';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courseCount, setCourseCount] = useState(0);
  const [avgMarks, setAvgMarks] = useState<string>('—');
  const [attendancePct, setAttendancePct] = useState<string>('—');
  const [cgpa, setCgpa] = useState<string>('—');
  const [recent, setRecent] = useState<{ title: string; line: string }[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, aRes] = await Promise.allSettled([getMyResults(), getMyAttendance()]);
      const results = rRes.status === 'fulfilled' ? rRes.value : null;
      const att = aRes.status === 'fulfilled' ? aRes.value : null;
      const courses = results?.courses || [];
      setCourseCount(courses.length);
      if (courses.length) {
        const sum = courses.reduce((a, c) => a + c.marks, 0);
        setAvgMarks((sum / courses.length).toFixed(1));
      } else {
        setAvgMarks('—');
      }
      setCgpa(results?.summary?.cgpa != null ? results.summary.cgpa.toFixed(2) : '—');
      setAttendancePct(
        att?.overall?.attendancePercentage != null ? att.overall.attendancePercentage.toFixed(1) : '—'
      );
      const top = [...courses].sort((a, b) => b.marks - a.marks).slice(0, 4);
      setRecent(
        top.map((c) => ({
          title: c.course?.courseTitle || 'Course',
          line: `${c.marks}/100 · GP ${c.gradePoint} (${c.letterGrade ?? '—'})`,
        }))
      );
    } catch {
      setCourseCount(0);
      setAvgMarks('—');
      setAttendancePct('—');
      setCgpa('—');
      setRecent([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = [
    { label: 'Enrolled courses', value: String(courseCount), icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-400/20', hoverBorder: 'hover:border-blue-400/40', path: '/student/courses' },
    { label: 'Average marks', value: avgMarks === '—' ? '—' : `${avgMarks}%`, icon: BookCheck, color: 'text-green-400', bg: 'bg-green-400/20', hoverBorder: 'hover:border-green-400/40', path: '/student/results' },
    { label: 'Attendance', value: attendancePct === '—' ? '—' : `${attendancePct}%`, icon: ClipboardList, color: 'text-purple-400', bg: 'bg-purple-400/20', hoverBorder: 'hover:border-purple-400/40', path: '/student/attendance' },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-student-accent/10 border border-student-accent/20 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-student-accent/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back{user?.name ? `, ${user.name}` : ''}!
          </h1>
          <p className="text-gray-300">
            Your CGPA is <span className="text-student-accent font-semibold">{cgpa}</span>. Open{' '}
            <strong className="text-white">Results</strong> or <strong className="text-white">Attendance</strong> for
            full detail.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-student-accent animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <Card
              key={i}
              hoverable
              className={`flex items-center gap-4 cursor-pointer group transition-all duration-300 border border-white/10 ${stat.hoverBorder}`}
              onClick={() => navigate(stat.path)}
            >
              <div className={`p-4 rounded-xl ${stat.bg} transition-transform duration-300 group-hover:scale-110`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400">{stat.label}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Academic snapshot</h2>
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-sm text-gray-400 mb-2">Cumulative GPA</p>
            <span className="text-5xl font-bold text-white tabular-nums">{cgpa}</span>
            <span className="text-sm text-gray-500 mt-2">Credit-weighted from all enrolled courses</span>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Strongest subjects (by marks)</h2>
          {!recent.length ? (
            <p className="text-gray-400 text-sm py-4">No marks loaded yet.</p>
          ) : (
            <Table>
              <Tbody>
                {recent.map((r, idx) => (
                  <Tr key={idx}>
                    <Td className="font-medium text-white max-w-[200px] truncate" title={r.title}>
                      {r.title}
                    </Td>
                    <Td className="text-right text-green-400 font-medium text-sm whitespace-nowrap">{r.line}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
};
