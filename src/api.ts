const TOKEN_KEY = 'dormsupport.accessToken';

export type UserRole = 'RESIDENT' | 'REVIEWER' | 'ADMIN';

export interface User {
  id: string;
  login: string;
  fullName: string;
  role: UserRole;
  blockId: string | null;
  roomNumber: string | null;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

interface ApiError {
  message?: string;
}

export function getAccessToken(): string | null { return sessionStorage.getItem(TOKEN_KEY); }
export function saveAccessToken(token: string): void { sessionStorage.setItem(TOKEN_KEY, token); }
export function clearAccessToken(): void { sessionStorage.removeItem(TOKEN_KEY); }

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set('Content-Type', 'application/json');
  const accessToken = getAccessToken();
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  const response = await fetch(path, { ...options, headers });
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') as boolean
    ? await response.json() as ApiError
    : null;

  if (!response.ok) {
    if (response.status === 401) clearAccessToken();
    throw new Error(body?.message || `Request failed with status ${response.status}`);
  }
  return body as T;
}
