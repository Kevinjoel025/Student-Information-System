import { useEffect, useState, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { AttendanceGauge } from '../../components/AttendanceGauge';
import { getMyAttendance, type MyAttendanceResponse } from '../../lib/api';
import { Loader2, AlertCircle, CalendarCheck } from 'lucide-react';

export const StudentAttendance = () => {
  const [data, setData] = useState<MyAttendanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyAttendance();
      setData(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const o = data?.overall;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-student-accent/20 text-student-accent">
          <CalendarCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance</h1>
          <p className="text-sm text-gray-400">Per-course classes attended vs total</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-student-accent animate-spin" />
          <p className="text-gray-400 text-sm">Loading attendance...</p>
        </div>
      ) : data && o ? (
        <>
          <Card className="flex flex-col items-center py-8">
            <AttendanceGauge percentage={o.attendancePercentage} statusKey={o.key} />
            <p className="text-xs text-gray-500 mt-6">
              Attended <span className="text-white font-medium">{o.attendedClasses}</span> of{' '}
              <span className="text-white font-medium">{o.totalClasses}</span> total class sessions
              (all subjects combined)
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-white mb-4">Course-wise attendance</h2>
            <div className="overflow-x-auto">
              <Table>
                <Thead>
                  <Tr>
                    <Th>Code</Th>
                    <Th>Course</Th>
                    <Th className="text-right">Attended</Th>
                    <Th className="text-right">Total</Th>
                    <Th className="text-right">%</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data.courses.map((row) => (
                    <Tr key={row._id}>
                      <Td className="font-mono text-student-accent whitespace-nowrap">
                        {row.course?.courseCode}
                      </Td>
                      <Td className="text-white font-medium max-w-[240px]">{row.course?.courseTitle}</Td>
                      <Td className="text-right tabular-nums">{row.attendedClasses}</Td>
                      <Td className="text-right tabular-nums">{row.totalClasses}</Td>
                      <Td className="text-right tabular-nums font-medium">
                        {row.attendancePercentage.toFixed(2)}%
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
};
