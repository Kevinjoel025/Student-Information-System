import { useEffect, useState, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { getMyResults, type MyResultsResponse } from '../../lib/api';
import { Loader2, AlertCircle, GraduationCap } from 'lucide-react';
import { cn } from '../../lib/utils';

function gradeBadgeClass(grade: string | undefined) {
  const g = grade || '—';
  if (g === 'O') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  if (g === 'A+' || g === 'A') return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
  if (g === 'B+' || g === 'B') return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
  if (g === 'C' || g === 'P') return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  if (g === 'F' || g === 'RA') return 'bg-red-500/20 text-red-300 border-red-500/30';
  return 'bg-white/10 text-gray-300 border-white/10';
}

export const StudentResults = () => {
  const [data, setData] = useState<MyResultsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyResults();
      setData(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load results');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const summary = data?.summary;
  const cgpaDisplay = summary?.cgpa != null ? summary.cgpa.toFixed(2) : '—';
  const overall = summary?.overallGrade ?? '—';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-student-accent/20 text-student-accent">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Results</h1>
            <p className="text-sm text-gray-400">
              Course-wise marks, grade points, letter grades, and CGPA
            </p>
          </div>
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
            <p className="text-gray-400 text-sm">Loading results...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <Thead>
                  <Tr>
                    <Th>Code</Th>
                    <Th>Course</Th>
                    <Th className="text-right">Credits</Th>
                    <Th className="text-right">Marks</Th>
                    <Th className="text-right">GP</Th>
                    <Th className="text-right">CP</Th>
                    <Th className="text-center">Grade</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {!data?.courses.length ? (
                    <Tr>
                      <Td colSpan={7} className="text-center text-gray-400 py-8">
                        No marks on file. Contact your administrator.
                      </Td>
                    </Tr>
                  ) : (
                    data.courses.map((row) => (
                      <Tr key={row._id}>
                        <Td className="font-mono text-student-accent whitespace-nowrap">
                          {row.course?.courseCode}
                        </Td>
                        <Td className="text-white font-medium max-w-[260px]">
                          {row.course?.courseTitle}
                        </Td>
                        <Td className="text-right tabular-nums">{row.course?.credits ?? 0}</Td>
                        <Td className="text-right tabular-nums font-medium">{row.marks}</Td>
                        <Td className="text-right tabular-nums text-gray-300">{row.gradePoint}</Td>
                        <Td className="text-right tabular-nums text-gray-300">{row.creditPoints}</Td>
                        <Td className="text-center">
                          <span
                            className={cn(
                              'inline-flex min-w-[2.25rem] justify-center px-2 py-0.5 rounded-md text-xs font-bold border',
                              gradeBadgeClass(row.letterGrade)
                            )}
                          >
                            {row.letterGrade ?? '—'}
                          </span>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Overall grade (from CGPA)</p>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'text-3xl font-bold px-4 py-2 rounded-xl border',
                      gradeBadgeClass(overall)
                    )}
                  >
                    {overall}
                  </span>
                  <div className="text-sm text-gray-400 max-w-xs">
                    Based on credit-weighted CGPA on a 10-point scale (O, A+, A, B+, B, C, RA).
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-student-accent/30 bg-student-accent/5 px-6 py-4 text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Cumulative GPA</p>
                <p className="text-4xl font-bold text-white tabular-nums mt-1">{cgpaDisplay}</p>
                {summary && (
                  <p className="text-xs text-gray-500 mt-2">
                    TCP {summary.tcp} · TC {summary.tc} credits
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
