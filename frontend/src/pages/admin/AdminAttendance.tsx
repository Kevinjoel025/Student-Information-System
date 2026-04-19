import { useEffect, useState, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { getAdminAttendanceOverview, type AdminAttendanceOverviewRow } from '../../lib/api';
import { Loader2, AlertCircle, Search, CalendarCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

function statusBadge(key: string) {
  if (key === 'safe') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25';
  if (key === 'condonation') return 'bg-amber-500/15 text-amber-400 border-amber-500/25';
  return 'bg-red-500/15 text-red-400 border-red-500/25';
}

export const AdminAttendance = () => {
  const [rows, setRows] = useState<AdminAttendanceOverviewRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminAttendanceOverview();
      setRows(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = rows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.rollNumber.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-admin-accent/20 text-admin-accent">
          <CalendarCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance</h1>
          <p className="text-sm text-gray-400">
            Overall percent per student: green 75%+, yellow 65 to 74%, red below 65%
          </p>
        </div>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            icon={<Search className="w-4 h-4" />}
            placeholder="Search by name, roll, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-admin-accent animate-spin" />
          </div>
        ) : (
          <div className="max-h-[560px] overflow-y-auto">
            <Table>
              <Thead>
                <Tr>
                  <Th>Roll</Th>
                  <Th>Name</Th>
                  <Th>Dept</Th>
                  <Th className="text-right">Attended</Th>
                  <Th className="text-right">Total</Th>
                  <Th className="text-right">%</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map((r) => (
                  <Tr key={r._id}>
                    <Td className="font-mono text-xs whitespace-nowrap text-admin-accent">{r.rollNumber}</Td>
                    <Td className="text-white font-medium max-w-[200px] truncate" title={r.name}>
                      {r.name}
                    </Td>
                    <Td>
                      <span className="px-2 py-0.5 rounded text-xs bg-admin-accent/20 text-admin-accent">
                        {r.department}
                      </span>
                    </Td>
                    <Td className="text-right tabular-nums">{r.attendedClasses}</Td>
                    <Td className="text-right tabular-nums">{r.totalClasses}</Td>
                    <Td className="text-right tabular-nums font-medium">{r.attendancePercentage.toFixed(2)}%</Td>
                    <Td>
                      <span
                        className={cn(
                          'inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border',
                          statusBadge(r.statusKey)
                        )}
                      >
                        {r.statusLabel}
                      </span>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            {filtered.length === 0 && (
              <p className="text-center text-gray-400 py-8 text-sm">No rows match your search.</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
