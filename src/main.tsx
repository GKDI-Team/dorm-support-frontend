import { StrictMode, useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { apiRequest, clearAccessToken, getAccessToken, saveAccessToken } from './api';
import type { LoginResponse, User, UserRole } from './api';
import './styles.css';

interface LoginPageProps { onLogin: (user: User) => void; }
interface DashboardProps { user: User; onLogout: () => Promise<void>; }
interface FieldProps { label: string; children: ReactNode; }
interface MessageProps { type?: string; children: ReactNode; }
interface InfoRowProps { label: string; value: string; code?: boolean; }
interface CreateUserRequest { login: string; password: string; fullName: string; role: UserRole; blockId: string; roomNumber: string; }

function Field({ label, children }: FieldProps) { return <label className="field"><span>{label}</span>{children}</label>; }
function Message({ type, children }: MessageProps) { return <p className={`message ${type || ''}`}>{children}</p>; }
function InfoRow({ label, value, code = false }: InfoRowProps) { return <div className="info-row"><span>{label}</span>{code ? <code>{value}</code> : <strong>{value}</strong>}</div>; }

function LoginPage({ onLogin }: LoginPageProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError('');
    try {
      const result = await apiRequest<LoginResponse>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ login, password }) });
      saveAccessToken(result.accessToken); onLogin(result.user);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Не удалось войти'); } finally { setLoading(false); }
  }

  return <main className="page narrow-page">
    <section className="hero"><p className="eyebrow">DormSupport</p><h1>Вход в систему</h1><p className="muted">Шаблон авторизации. После входа интерфейс определяется ролью пользователя.</p></section>
    <form className="card form" onSubmit={submit}>
      <Field label="Логин"><input value={login} onChange={(event) => setLogin(event.target.value)} required minLength={3} maxLength={64} autoComplete="username" /></Field>
      <Field label="Пароль"><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={128} autoComplete="current-password" /></Field>
      <Message type="error">{error}</Message>
      <button className="button" disabled={loading}>{loading ? 'Входим...' : 'Войти'}</button>
    </form>
  </main>;
}

function Dashboard({ user, onLogout }: DashboardProps) {
  const [createMessage, setCreateMessage] = useState({ type: '', text: '' });
  const [creating, setCreating] = useState(false);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); setCreating(true); setCreateMessage({ type: '', text: 'Создаём аккаунт...' });
    const request: CreateUserRequest = { login: String(form.get('login')), password: String(form.get('password')), fullName: String(form.get('fullName')), role: String(form.get('role')) as UserRole, blockId: String(form.get('blockId')), roomNumber: String(form.get('roomNumber')) };
    try {
      await apiRequest<User>('/api/v1/admin/users', { method: 'POST', body: JSON.stringify(request) });
      event.currentTarget.reset(); setCreateMessage({ type: 'success', text: 'Пользователь создан.' });
    } catch (requestError) { setCreateMessage({ type: 'error', text: requestError instanceof Error ? requestError.message : 'Не удалось создать пользователя' }); } finally { setCreating(false); }
  }

  const initial = (user.fullName || user.login || '?').charAt(0).toUpperCase();
  return <div className="shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">D</span><strong>DormSupport</strong></div><div className="userbar"><span>{user.fullName} · {user.role}</span><button className="button danger" onClick={onLogout}>Выйти</button></div></header>
    <main className="page">
      <section className="hero"><p className="eyebrow">Личный кабинет</p><h1>Добро пожаловать</h1><p className="muted">Шаблонный экран для подключения команды к Auth API.</p></section>
      <div className="grid">
        <section className="card"><div className="profile"><div className="avatar">{initial}</div><div><h2>{user.fullName}</h2><span className="pill">{user.role}</span></div></div><div className="info-list"><InfoRow label="Логин" value={user.login} /><InfoRow label="User ID" value={user.id} code /><InfoRow label="Block ID" value={user.blockId || '—'} code /><InfoRow label="Комната" value={user.roomNumber || '—'} /></div></section>
        {user.role === 'ADMIN' && <section className="card"><h2>Создать пользователя</h2><p className="muted">ADMIN создаёт аккаунт и передаёт пользователю первоначальные данные для входа.</p><form className="form" onSubmit={createUser}><Field label="Логин"><input name="login" minLength={3} maxLength={64} required /></Field><Field label="Первоначальный пароль"><input name="password" type="password" minLength={8} maxLength={128} required /></Field><Field label="ФИО"><input name="fullName" maxLength={150} required /></Field><Field label="Роль"><select name="role" defaultValue="RESIDENT"><option value="RESIDENT">RESIDENT — жилец</option><option value="REVIEWER">REVIEWER — ответственный</option></select></Field><Field label="Block ID (UUID)"><input name="blockId" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required /></Field><Field label="Номер комнаты"><input name="roomNumber" maxLength={20} required /></Field><Message type={createMessage.type}>{createMessage.text}</Message><button className="button" disabled={creating}>{creating ? 'Создаём...' : 'Создать аккаунт'}</button></form></section>}
        <section className="card wide"><h2>Следующий модуль</h2><div className="empty">Здесь появится список заявок и рабочая очередь после реализации Issues Service.</div></section>
      </div>
    </main>
  </div>;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(Boolean(getAccessToken()));

  useEffect(() => {
    if (!getAccessToken()) return;
    apiRequest<User>('/api/v1/auth/me').then(setUser).catch(() => clearAccessToken()).finally(() => setCheckingSession(false));
  }, []);

  async function logout(): Promise<void> {
    try { await apiRequest<void>('/api/v1/auth/logout', { method: 'POST' }); } catch (_) { /* clear local state anyway */ }
    clearAccessToken(); setUser(null);
  }

  if (checkingSession) return <main className="page loading">Проверяем сессию...</main>;
  return user ? <Dashboard user={user} onLogout={logout} /> : <LoginPage onLogin={setUser} />;
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
