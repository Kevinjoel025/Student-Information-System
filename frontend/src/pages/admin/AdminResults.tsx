import { useEffect, useState, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import {
  getAdminResultsOverview,
  getAdminStudentResults,
  updateMarkEntry,
  type AdminResultOverviewRow,
  type AdminStudentResultsResponse,
} from '../../lib/api';
import { Loader2, AlertCircle, Search, Save, GraduationCap } from 'lucide-react';

export const AdminResults = () => {
  const [overview, setOverview] = useState<AdminResultOverviewRow[]>([]);
  const [search, setSearch] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState('');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminStudentResultsResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [draftMarks, setDraftMarks] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [detailError, setDetailError] = useState('');

  const loadOverview = useCallback(async () => {
    setLoadingList(true);
    setError('');
    try {
      const rows = await getAdminResultsOverview();
      setOverview(rows);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load overview');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const openStudent = async (id: string) => {
    setSelectedId(id);
    setLoadingDetail(true);
    setDetailError('');
    setDetail(null);
    setDraftMarks({});
    try {
      const d = await getAdminStudentResults(id);
      setDetail(d);
      const draft: Record<string, number> = {};
      d.courses.forEach((c) => {
        draft[c._id] = c.marks;
      });
      setDraftMarks(draft);
    } catch (e: unknown) {
      setDetailError(e instanceof Error ? e.message : 'Failed to load student results');
    } finally {
      setLoadingDetail(false);
    }
  };

  const filtered = overview.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.rollNumber.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q)
    );
  });

  const saveRow = async (marksEntryId: string) => {
    const val = Number(draftMarks[marksEntryId]);
    if (Number.isNaN(val) || val < 0 || val > 100) {
      setDetailError('Marks must be between 0 and 100');
      return;
    }
    setSaving(true);
    setDetailError('');
    try {
      const res = await updateMarkEntry(marksEntryId, val);
      setDraftMarks((d) => ({ ...d, [marksEntryId]: val }));
      if (detail) {
        setDetail({
          ...detail,
          summary: res.studentSummary,
          courses: detail.courses.map((row) =>
            row._id === marksEntryId
              ? {
                  ...row,
                  marks: val,
                  gradePoint: res.entry.gradePoint,
                  creditPoints: res.entry.creditPoints,
                  letterGrade: res.entry.letterGrade,
                }
              : row
          ),
        });
      }
      await loadOverview();
    } catch (e: unknown) {
      setDetailError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const cgpaStr = (v: number | null) => (v != null ? v.toFixed(2) : '—');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-admin-accent/20 text-admin-accent">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Results</h1>
          <p className="text-sm text-gray-400">View all students, CGPA, and edit marks per course</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <div className="mb-4">
            <Input
              icon={<Search className="w-4 h-4" />}
              placeholder="Search name, roll number, department..."
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
          {loadingList ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-admin-accent animate-spin" />
            </div>
          ) : (
            <div className="max-h-[480px] overflow-y-auto">
              <Table>
                <Thead>
                  <Tr>
                    <Th>Roll</Th>
                    <Th>Name</Th>
                    <Th>Dept</Th>
                    <Th className="text-center">Grade</Th>
                    <Th className="text-right">CGPA</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filtered.map((r) => (
                    <Tr
                      key={r._id}
                      className={selectedId === r._id ? 'bg-admin-accent/10 cursor-pointer' : 'cursor-pointer hover:bg-white/5'}
                      onClick={() => openStudent(r._id)}
                    >
                      <Td className="font-mono text-xs whitespace-nowrap">{r.rollNumber}</Td>
                      <Td className="text-white font-medium max-w-[140px] truncate" title={r.name}>
                        {r.name}
                      </Td>
                      <Td>
                        <span className="px-2 py-0.5 rounded text-xs bg-admin-accent/20 text-admin-accent">
                          {r.department}
                        </span>
                      </Td>
                      <Td className="text-center font-bold text-gray-200">{r.overallGrade ?? '—'}</Td>
                      <Td className="text-right font-mono tabular-nums">{cgpaStr(r.cgpa)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              {filtered.length === 0 && (
                <p className="text-center text-gray-400 py-8 text-sm">No students match your search.</p>
              )}
            </div>
          )}
        </Card>

        <Card>
          {!selectedId && (
            <div className="flex items-center justify-center min-h-[320px] text-gray-400 text-sm">
              Select a student to view and edit marks.
            </div>
          )}
          {selectedId && loadingDetail && (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-admin-accent animate-spin" />
            </div>
          )}
          {selectedId && !loadingDetail && detail && (
            <>
              <div className="mb-4 pb-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">{detail.student.name}</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {detail.student.rollNumber} · {detail.student.department}
                </p>
                <p className="text-sm text-admin-accent mt-2 font-mono">
                  Overall: <span className="text-white font-bold">{detail.summary.overallGrade ?? '—'}</span>
                  {' · '}
                  CGPA {cgpaStr(detail.summary.cgpa)} (TCP {detail.summary.tcp} / TC {detail.summary.tc})
                </p>
              </div>
              {detailError && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {detailError}
                </div>
              )}
              <div className="max-h-[420px] overflow-y-auto">
                <Table>
                  <Thead>
                    <Tr>
                      <Th>Code</Th>
                      <Th>Course</Th>
                      <Th className="text-right">Cr</Th>
                      <Th className="text-right">Marks</Th>
                      <Th className="text-right">GP</Th>
                      <Th className="text-right">CP</Th>
                      <Th className="text-center">Gr</Th>
                      <Th className="text-right">Save</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {detail.courses.map((row) => (
                      <Tr key={row._id}>
                        <Td className="font-mono text-xs whitespace-nowrap text-admin-accent">
                          {row.course?.courseCode}
                        </Td>
                        <Td className="text-gray-200 text-sm max-w-[160px] truncate" title={row.course?.courseTitle}>
                          {row.course?.courseTitle}
                        </Td>
                        <Td className="text-right tabular-nums text-gray-400">{row.course?.credits ?? 0}</Td>
                        <Td className="text-right">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            className="w-16 h-9 bg-card/50 border border-white/10 rounded-lg px-2 text-sm text-white text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-admin-accent/50"
                            value={draftMarks[row._id] ?? row.marks}
                            onChange={(e) =>
                              setDraftMarks((d) => ({ ...d, [row._id]: Number(e.target.value) }))
                            }
                          />
                        </Td>
                        <Td className="text-right tabular-nums text-gray-400">{row.gradePoint}</Td>
                        <Td className="text-right tabular-nums text-gray-400">{row.creditPoints}</Td>
                        <Td className="text-center text-sm font-bold text-gray-200">{row.letterGrade ?? '—'}</Td>
                        <Td className="text-right">
                          <Button
                            type="button"
                            variant="secondary"
                            className="px-2 py-1 h-8"
                            disabled={saving || draftMarks[row._id] === row.marks}
                            onClick={() => saveRow(row._id)}
                          >
                            <Save className="w-3.5 h-3.5" />
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};
