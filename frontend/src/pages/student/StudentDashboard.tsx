import { useEffect, useState, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Table, Tbody, Tr, Td } from '../../components/ui/Table';
import { BookOpen, BookCheck, ClipboardList, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getMyResults, getMyAttendance } from '../../lib/api';

export const StudentDashboard = () => {
  const { user } = useAuth();
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
    { label: 'Enrolled courses', value: String(courseCount), icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-400/20' },
    { label: 'Average marks', value: avgMarks === '—' ? '—' : `${avgMarks}%`, icon: BookCheck, color: 'text-green-400', bg: 'bg-green-400/20' },
    { label: 'Attendance', value: attendancePct === '—' ? '—' : `${attendancePct}%`, icon: ClipboardList, color: 'text-purple-400', bg: 'bg-purple-400/20' },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-student-accent/10 border border-student-accent/20 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-student-accent/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
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
