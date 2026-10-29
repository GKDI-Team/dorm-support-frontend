import {useState} from 'react';
import type {FormEvent} from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import {useAuth} from '../auth/AuthContext';
import Brand from '../components/Brand';
import Field from '../components/Field';
import NoticeBox from '../components/NoticeBox';
import type {Notice} from '../components/NoticeBox';

export default function LoginPage() {
    const {user, signIn} = useAuth();
    const location = useLocation();
    const from = (location.state as { from?: string } | null)?.from || '/';

    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [notice, setNotice] = useState<Notice>();
    const [loading, setLoading] = useState(false);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setNotice(undefined);
        try {
            await signIn(login, password);
        } catch (e) {
            setNotice({type: 'error', text: e instanceof Error ? e.message : 'Не удалось войти'});
        } finally {
            setLoading(false);
        }
    }

    // Уже авторизован — на странице входа делать нечего.
    if (user) return <Navigate to={from} replace/>;

    return (
        <main className="auth-page">
            <div className="auth-decoration decoration-one"/>
            <div className="auth-decoration decoration-two"/>
            <section className="auth-layout">
                <div className="auth-intro">
                    <Brand/>
                    <div className="intro-copy">
                        <span className="eyebrow">Сервис общежития</span>
                        <h1>Пусть бытовые проблемы решаются проще.</h1>
                        <p>Создавайте заявки, следите за статусом и помогайте сделать общежитие комфортнее.</p>
                    </div>
                    <div className="intro-note">
                        <span>✦</span>
                        <p>Все заявки в одном месте — от перегоревшей лампы до протекающего крана.</p>
                    </div>
                </div>
                <form className="auth-card" onSubmit={submit}>
                    <div className="auth-card-heading">
                        <span className="icon-circle">↗</span>
                        <div>
                            <h2>Добро пожаловать</h2>
                            <p>Войдите в личный кабинет</p>
                        </div>
                    </div>
                    <div className="form-stack">
                        <Field label="Логин">
                            <input
                                value={login}
                                onChange={e => setLogin(e.target.value)}
                                placeholder="Введите логин"
                                autoComplete="username"
                                required
                            />
                        </Field>
                        <Field label="Пароль">
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Введите пароль"
                                autoComplete="current-password"
                                required
                            />
                        </Field>
                    </div>
                    <NoticeBox notice={notice}/>
                    <button className="primary-button full-width" disabled={loading}>
                        {loading ? 'Входим…' : 'Войти в аккаунт'}<span>→</span>
                    </button>
                    <p className="auth-help">Логин и первоначальный пароль выдаёт администратор общежития.</p>
                </form>
            </section>
        </main>
    );
}
