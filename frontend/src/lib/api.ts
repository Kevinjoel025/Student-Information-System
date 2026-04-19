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
