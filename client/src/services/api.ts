const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('gbase_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('gbase_token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('gbase_token');
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || 'API Request failed');
  }

  return data as T;
}

export const api = {
  getOauthConfig: () =>
    request<{ googleClientId: string; githubClientId: string }>('/config/oauth'),

  // Auth
  register: (email: string, password?: string) =>
    request<{ success: boolean; message: string; userId: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  verifyRegister: (email: string, code: string) =>
    request<{ success: boolean; token: string; user: { id: string; email: string; isVerified: boolean } }>('/auth/register/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),

  login: (email: string, password?: string) =>
    request<{ success: boolean; token: string; user: { id: string; email: string; isVerified: boolean } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  oauthLogin: (provider: 'google' | 'github', tokenOrCode: string) =>
    request<{ success: boolean; token: string; user: { id: string; email: string; isVerified: boolean } }>('/auth/oauth', {
      method: 'POST',
      body: JSON.stringify({ provider, tokenOrCode }),
    }),

  changeEmail: (newEmail: string) =>
    request<{ success: boolean; message: string }>('/auth/change-email', {
      method: 'POST',
      body: JSON.stringify({ newEmail }),
    }),

  verifyChangeEmail: (newEmail: string, code: string) =>
    request<{ success: boolean; message: string; email: string }>('/auth/change-email/verify', {
      method: 'POST',
      body: JSON.stringify({ newEmail, code }),
    }),

  changePassword: () =>
    request<{ success: boolean; message: string }>('/auth/change-password', {
      method: 'POST',
    }),

  verifyChangePassword: (code: string, newPassword?: string) =>
    request<{ success: boolean; message: string }>('/auth/change-password/verify', {
      method: 'POST',
      body: JSON.stringify({ code, newPassword }),
    }),

  // Containers
  listContainers: () =>
    request<{ success: boolean; containers: any[] }>('/containers'),

  createContainer: (name?: string) =>
    request<{ success: boolean; container: any }>('/containers', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  getContainerInfo: (id: string) =>
    request<{ success: boolean; container: any; details: any }>(`/containers/${id}`),

  deleteContainer: (id: string) =>
    request<{ success: boolean; message: string }>(`/containers/${id}`, {
      method: 'DELETE',
    }),
};
