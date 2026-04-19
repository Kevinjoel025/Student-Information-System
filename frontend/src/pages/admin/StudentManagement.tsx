import { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, X, Loader2, AlertCircle, Check } from 'lucide-react';
import { getStudents, deleteStudent, updateStudent, registerAPI, type StudentData } from '../../lib/api';

const DEPARTMENTS = ['All Departments', 'AE', 'CE', 'CSE', 'CSE(DS)', 'CSE(IOT)', 'ECE', 'EIE', 'IT', 'ME'];
const BLOOD_GROUPS = ['A+VE','A-VE','B+VE','B-VE','O+VE','O-VE','AB+VE','AB-VE','N/A'];
const ROWS_PER_PAGE = 10;

// ── Add / Edit Modal ─────────────────────────────────────────
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  student: Partial<StudentData> | null;
  mode: 'add' | 'edit';
}

const StudentModal = ({ isOpen, onClose, onSave, student, mode }: ModalProps) => {
  const [form, setForm] = useState({
    name: '', rollNumber: '', department: 'CSE', bloodGroup: 'O+VE',
    parentMobile: '', studentMobile: '', residentialAddress: '', year: '1st Year',
    password: 'student123',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (student && mode === 'edit') {
      setForm({
        name: student.name || '',
        rollNumber: student.rollNumber || '',
        department: student.department || 'CSE',
        bloodGroup: student.bloodGroup || 'O+VE',
        parentMobile: student.parentMobile || '',
        studentMobile: student.studentMobile || '',
        residentialAddress: student.residentialAddress || '',
        year: student.year || '1st Year',
        password: '',
      });
    } else {
      setForm({
        name: '', rollNumber: '', department: 'CSE', bloodGroup: 'O+VE',
        parentMobile: '', studentMobile: '', residentialAddress: '', year: '1st Year',
        password: 'student123',
      });
    }
    setError('');
    setSuccess('');
  }, [student, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (mode === 'add') {
        await registerAPI({
          name: form.name,
          email: `${form.rollNumber.toLowerCase()}@sis.edu`,
          password: form.password,
          role: 'student',
          rollNumber: form.rollNumber,
          department: form.department,
          year: form.year,
          bloodGroup: form.bloodGroup,
          parentMobile: form.parentMobile,
          studentMobile: form.studentMobile,
          residentialAddress: form.residentialAddress,
        });
        setSuccess('Student added successfully!');
      } else if (student?._id) {
        await updateStudent(student._id, {
          name: form.name,
          department: form.department,
          bloodGroup: form.bloodGroup,
          parentMobile: form.parentMobile,
          studentMobile: form.studentMobile,
          residentialAddress: form.residentialAddress,
        });
        setSuccess('Student updated successfully!');
      }
      setTimeout(() => { onSave(); onClose(); }, 600);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto glass rounded-2xl p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {mode === 'add' ? 'Add New Student' : 'Edit Student'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
            <Check className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name *</label>
              <Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required placeholder="e.g. JOHN DOE" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Roll Number *</label>
              <Input value={form.rollNumber} onChange={e => setForm(f => ({...f, rollNumber: e.target.value}))} required placeholder="e.g. 24071A0501" disabled={mode === 'edit'} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Department *</label>
              <select
                className="w-full h-10 bg-card/50 border border-white/10 rounded-lg px-3 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-start/50"
                value={form.department} onChange={e => setForm(f => ({...f, department: e.target.value}))}
              >
                {DEPARTMENTS.filter(d => d !== 'All Departments').map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Blood Group</label>
              <select
                className="w-full h-10 bg-card/50 border border-white/10 rounded-lg px-3 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-start/50"
                value={form.bloodGroup} onChange={e => setForm(f => ({...f, bloodGroup: e.target.value}))}
              >
                {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Year</label>
              <select
                className="w-full h-10 bg-card/50 border border-white/10 rounded-lg px-3 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-start/50"
                value={form.year} onChange={e => setForm(f => ({...f, year: e.target.value}))}
              >
                {['1st Year','2nd Year','3rd Year','4th Year'].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Parent Mobile</label>
              <Input value={form.parentMobile} onChange={e => setForm(f => ({...f, parentMobile: e.target.value}))} placeholder="10 digit number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Student Mobile</label>
              <Input value={form.studentMobile} onChange={e => setForm(f => ({...f, studentMobile: e.target.value}))} placeholder="10 digit number" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Residential Address</label>
              <textarea
                className="w-full bg-card/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-start/50 min-h-[60px] resize-y"
                value={form.residentialAddress}
                onChange={e => setForm(f => ({...f, residentialAddress: e.target.value}))}
                placeholder="Full residential address"
              />
            </div>
            {mode === 'add' && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <Input type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} placeholder="Default: student123" />
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : mode === 'add' ? 'Add Student' : 'Update Student'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Delete Confirmation Modal ────────────────────────────────
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  studentName: string;
  deleting: boolean;
}

const DeleteModal = ({ isOpen, onClose, onConfirm, studentName, deleting }: DeleteModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm glass rounded-2xl p-6 animate-scale-in">
        <h3 className="text-lg font-bold text-white mb-2">Delete Student</h3>
        <p className="text-gray-400 text-sm mb-6">
          Are you sure you want to delete <span className="text-white font-medium">{studentName}</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1" disabled={deleting}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} className="flex-1" disabled={deleting}>
            {deleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting...</> : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────
export const StudentManagement = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getStudents({
        search: searchTerm || undefined,
        department: deptFilter || undefined,
      });
      setStudents(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, deptFilter]);

  useEffect(() => {
    const debounce = setTimeout(fetchStudents, 300);
    return () => clearTimeout(debounce);
  }, [fetchStudents]);

  const handleDelete = async () => {
    if (!studentToDelete) return;
    setDeleting(true);
    try {
      await deleteStudent(studentToDelete._id);
      setDeleteModalOpen(false);
      setStudentToDelete(null);
      fetchStudents();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = students;
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
        <h1 className="text-2xl font-bold text-white">Student Management</h1>
        <Button className="shrink-0" onClick={() => { setModalMode('add'); setSelectedStudent(null); setModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Student
        </Button>
      </div>

      <Card>
        <div className="flex sm:flex-row flex-col gap-4 mb-6">
          <Input
            icon={<Search className="w-4 h-4" />}
            placeholder="Search by name or roll number..."
            className="flex-1"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
          <select
            className="bg-card/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-start/50"
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
          >
            {DEPARTMENTS.map(d => (
              <option key={d} value={d === 'All Departments' ? '' : d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-admin-accent animate-spin" />
            <p className="text-gray-400 text-sm">Loading students...</p>
          </div>
        ) : (
          <>
            <Table>
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Roll Number</Th>
                  <Th>Department</Th>
                  <Th>Blood Group</Th>
                  <Th>Parent Mobile</Th>
                  <Th>Student Mobile</Th>
                  <Th>Residential Address</Th>
                  <Th className="text-right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginated.length === 0 ? (
                  <Tr>
                    <Td className="text-center text-gray-400 py-8" title="">
                      No students found.
                    </Td>
                  </Tr>
                ) : (
                  paginated.map((student) => (
                    <Tr key={student._id}>
                      <Td className="font-medium text-white whitespace-nowrap">{student.name}</Td>
                      <Td className="whitespace-nowrap">{student.rollNumber}</Td>
                      <Td>
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-admin-accent/20 text-admin-accent">
                          {student.department}
                        </span>
                      </Td>
                      <Td>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                          {student.bloodGroup}
                        </span>
                      </Td>
                      <Td className="whitespace-nowrap">{student.parentMobile}</Td>
                      <Td className="whitespace-nowrap">{student.studentMobile}</Td>
                      <Td className="max-w-[200px] truncate text-gray-400 text-xs" title={student.residentialAddress}>
                        {student.residentialAddress}
                      </Td>
                      <Td className="text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => { setModalMode('edit'); setSelectedStudent(student); setModalOpen(true); }}
                          className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-400/10 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setStudentToDelete(student); setDeleteModalOpen(true); }}
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
              <p className="text-sm text-gray-400">
                Showing {filtered.length > 0 ? (safePage - 1) * ROWS_PER_PAGE + 1 : 0}–{Math.min(safePage * ROWS_PER_PAGE, filtered.length)} of {filtered.length} students
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                  Math.max(0, safePage - 3),
                  Math.min(totalPages, safePage + 2)
                ).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      page === safePage
                        ? 'bg-admin-accent text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Modals */}
      <StudentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={fetchStudents}
        student={selectedStudent}
        mode={modalMode}
      />
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setStudentToDelete(null); }}
        onConfirm={handleDelete}
        studentName={studentToDelete?.name || ''}
        deleting={deleting}
      />
    </div>
  );
};
