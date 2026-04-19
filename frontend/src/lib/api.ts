const API_BASE = 'http://localhost:5000/api';

// ── Token helpers ────────────────────────────────────────────
function getToken(): string | null {
  return localStorage.getItem('sis_token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res: Response) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

// ── Auth ─────────────────────────────────────────────────────
export async function loginAPI(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function registerAPI(body: Record<string, string>) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

// ── Students ─────────────────────────────────────────────────
export interface StudentData {
  _id: string;
  name: string;
  rollNumber: string;
  department: string;
  bloodGroup: string;
  parentMobile: string;
  studentMobile: string;
  residentialAddress: string;
  email: string;
  year: string;
}

export async function getStudents(params?: {
  search?: string;
  department?: string;
  year?: string;
}): Promise<StudentData[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.department) query.set('department', params.department);
  if (params?.year) query.set('year', params.year);

  const url = `${API_BASE}/students${query.toString() ? '?' + query.toString() : ''}`;
  const res = await fetch(url, { headers: authHeaders() });
  return handleResponse(res);
}

export async function updateStudent(id: string, body: Partial<StudentData>) {
  const res = await fetch(`${API_BASE}/students/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function deleteStudent(id: string) {
  const res = await fetch(`${API_BASE}/students/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// ── Courses ─────────────────────────────────────────────────
export interface Course {
  _id: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
}

export async function getCourses(): Promise<Course[]> {
  const res = await fetch(`${API_BASE}/courses`, { headers: authHeaders() });
  return handleResponse(res);
}

// ── Marks / Results (CGPA) ───────────────────────────────────
export interface CourseRef {
  _id: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
}

export interface ResultCourseRow {
  _id: string;
  marks: number;
  gradePoint: number;
  creditPoints: number;
  letterGrade?: string;
  course: CourseRef;
}

export interface ResultsSummary {
  tcp: number;
  tc: number;
  cgpa: number | null;
  overallGrade?: string;
}

export interface MyResultsResponse {
  courses: ResultCourseRow[];
  summary: ResultsSummary;
}

export async function getMyResults(): Promise<MyResultsResponse> {
  const res = await fetch(`${API_BASE}/marks/my-results`, { headers: authHeaders() });
  return handleResponse(res);
}

export interface AdminResultOverviewRow {
  _id: string;
  name: string;
  rollNumber: string;
  department: string;
  coursesCount: number;
  tcp: number;
  tc: number;
  cgpa: number | null;
  overallGrade?: string;
}

export async function getAdminResultsOverview(): Promise<AdminResultOverviewRow[]> {
  const res = await fetch(`${API_BASE}/marks/overview`, { headers: authHeaders() });
  return handleResponse(res);
}

export interface AdminStudentResultsResponse {
  student: {
    _id: string;
    name: string;
    rollNumber: string;
    department: string;
    email?: string;
    year?: string;
  };
  courses: ResultCourseRow[];
  summary: ResultsSummary;
}

export async function getAdminStudentResults(studentId: string): Promise<AdminStudentResultsResponse> {
  const res = await fetch(`${API_BASE}/marks/admin/student/${studentId}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function updateMarkEntry(marksEntryId: string, marks: number) {
  const res = await fetch(`${API_BASE}/marks/${marksEntryId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ marks }),
  });
  return handleResponse(res);
}

// ── Attendance ──────────────────────────────────────────────
export type AttendanceStatusKey = 'safe' | 'condonation' | 'detention';

export interface AttendanceOverall {
  totalClasses: number;
  attendedClasses: number;
  attendancePercentage: number;
  key: AttendanceStatusKey;
  label: string;
  color: string;
}

export interface AttendanceCourseRow {
  _id: string;
  course: CourseRef;
  totalClasses: number;
  attendedClasses: number;
  attendancePercentage: number;
}

export interface MyAttendanceResponse {
  overall: AttendanceOverall;
  courses: AttendanceCourseRow[];
}

export async function getMyAttendance(): Promise<MyAttendanceResponse> {
  const res = await fetch(`${API_BASE}/attendance/my`, { headers: authHeaders() });
  return handleResponse(res);
}

export interface AdminAttendanceOverviewRow {
  _id: string;
  name: string;
  rollNumber: string;
  department: string;
  coursesCount: number;
  totalClasses: number;
  attendedClasses: number;
  attendancePercentage: number;
  statusKey: string;
  statusLabel: string;
}

export async function getAdminAttendanceOverview(): Promise<AdminAttendanceOverviewRow[]> {
  const res = await fetch(`${API_BASE}/attendance/admin/overview`, { headers: authHeaders() });
  return handleResponse(res);
}
