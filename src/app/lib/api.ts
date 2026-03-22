import { API_BASE_URL, AUTH_TOKEN_KEY } from './config';

function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  try {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Xatolik' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error(`API error at ${endpoint}:`, error);
    throw error;
  }
}

export const authAPI = {
  signup: (email: string, password: string, name?: string) =>
    fetchAPI('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  login: (email: string, password: string) =>
    fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getMe: () => fetchAPI('/auth/me'),
  updateProfile: (name: string) =>
    fetchAPI('/auth/profile', { method: 'PUT', body: JSON.stringify({ name }) }),
  changePassword: (currentPassword: string, newPassword: string) =>
    fetchAPI('/auth/change-password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) }),
};

export const tasksAPI = {
  getAll: () => fetchAPI('/tasks'),
  getById: (id: string) => fetchAPI(`/tasks/${id}`),
  create: (task: any) =>
    fetchAPI('/tasks', { method: 'POST', body: JSON.stringify(task) }),
  update: (id: string, task: any) =>
    fetchAPI(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(task) }),
  delete: (id: string) =>
    fetchAPI(`/tasks/${id}`, { method: 'DELETE' }),
  toggleComplete: (id: string) =>
    fetchAPI(`/tasks/${id}/complete`, { method: 'PATCH' }),
  toggleArchive: (id: string) =>
    fetchAPI(`/tasks/${id}/archive`, { method: 'PATCH' }),
};

export const categoriesAPI = {
  getAll: () => fetchAPI('/categories'),
  getById: (id: string) => fetchAPI(`/categories/${id}`),
  create: (category: any) =>
    fetchAPI('/categories', { method: 'POST', body: JSON.stringify(category) }),
  update: (id: string, category: any) =>
    fetchAPI(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(category) }),
  delete: (id: string) =>
    fetchAPI(`/categories/${id}`, { method: 'DELETE' }),
};

export const statisticsAPI = {
  get: () => fetchAPI('/statistics'),
};