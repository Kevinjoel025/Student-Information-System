import { useEffect, useState, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { getCourses, type Course } from '../../lib/api';
import { Loader2, AlertCircle, BookOpen } from 'lucide-react';

export const StudentCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-student-accent/20 text-student-accent">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">My Courses</h1>
          <p className="text-sm text-gray-400">Registered curriculum courses and credits</p>
        </div>
      </div>

      <Card>
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-student-accent animate-spin" />
            <p className="text-gray-400 text-sm">Loading courses...</p>
          </div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Code</Th>
                <Th>Title</Th>
                <Th className="text-right">Credits</Th>
              </Tr>
            </Thead>
            <Tbody>
              {courses.length === 0 ? (
                <Tr>
                  <Td colSpan={3} className="text-center text-gray-400 py-8">
                    No courses found. Ask an administrator to run the database seed.
                  </Td>
                </Tr>
              ) : (
                courses.map((c) => (
                  <Tr key={c._id}>
                    <Td className="font-mono text-student-accent whitespace-nowrap">{c.courseCode}</Td>
                    <Td className="text-white font-medium">{c.courseTitle}</Td>
                    <Td className="text-right tabular-nums">{c.credits}</Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        )}
      </Card>
    </div>
  );
};
