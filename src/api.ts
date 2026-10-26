const TOKEN_KEY = 'dormsupport.accessToken';

export type UserRole = 'RESIDENT' | 'REVIEWER' | 'ADMIN';
export type IssueStatus = 'NEW' | 'IN_PROGRESS' | 'CLOSED';

export interface User {
  id: string;
  login: string;
  fullName: string;
  role: UserRole;
  blockId: string | null;
  roomNumber: string | null;
  createdAt: string;
}

export interface LoginResponse { accessToken: string; user: User; }
export interface IssueCategory { id: string; name: string; description?: string; }
export interface Issue {
  id: string;
  residentId: string;
  blockId: string;
  roomNumber: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  status: IssueStatus;
  locationDetails: string;
  createdAt: string;
  updatedAt: string;
}
export interface StatusHistory { id: string; fromStatus: IssueStatus | null; toStatus: IssueStatus; changedBy: string; changedAt: string; }
export interface IssueDetails extends Issue { statusHistory: StatusHistory[]; }
export interface ApiErrorBody { code?: string; message?: string; }

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
  const body = response.status === 204 ? null : contentType.includes('application/json') ? await response.json() as ApiErrorBody : null;
  if (!response.ok) {
    if (response.status === 401) clearAccessToken();
    throw new Error((body as ApiErrorBody | null)?.message || `Ошибка запроса (${response.status})`);
  }
  return body as T;
}
