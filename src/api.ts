const SESSION_KEY = 'dormsupport.sessionId';

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
  sessionId: string;
  user: User;
}

interface ApiError {
  message?: string;
}

export function getSessionId(): string | null { return sessionStorage.getItem(SESSION_KEY); }
export function saveSessionId(sessionId: string): void { sessionStorage.setItem(SESSION_KEY, sessionId); }
export function clearSessionId(): void { sessionStorage.removeItem(SESSION_KEY); }

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set('Content-Type', 'application/json');
  const sessionId = getSessionId();
  if (sessionId) headers.set('X-Session-Id', sessionId);

  const response = await fetch(path, { ...options, headers });
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') as boolean
    ? await response.json() as ApiError
    : null;

  if (!response.ok) {
    if (response.status === 401) clearSessionId();
    throw new Error(body?.message || `Request failed with status ${response.status}`);
  }
  return body as T;
}
