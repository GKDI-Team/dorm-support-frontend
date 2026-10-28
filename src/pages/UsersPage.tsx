import {useState} from 'react';
import type {FormEvent} from 'react';
import {apiRequest} from '../api';
import type {User, UserRole} from '../api';
import PageHeading from '../components/PageHeading';
import Field from '../components/Field';
import NoticeBox from '../components/NoticeBox';
import type {Notice} from '../components/NoticeBox';

export default function UsersPage() {
    const [notice, setNotice] = useState<Notice>();
    const [creating, setCreating] = useState(false);

    async function createUser(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formElement = event.currentTarget;
        const form = new FormData(formElement);
        setCreating(true);
        setNotice(undefined);
        try {
            await apiRequest<User>('/api/v1/admin/users', {
                method: 'POST',
                body: JSON.stringify({
                    login: String(form.get('login')),
                    password: String(form.get('password')),
                    fullName: String(form.get('fullName')),
                    role: String(form.get('role')) as UserRole,
                    blockId: String(form.get('blockId')),
                    roomNumber: String(form.get('roomNumber'))
                })
            });
            formElement.reset();
            setNotice({
                type: 'success',
                text: 'Аккаунт создан. Передайте пользователю логин и первоначальный пароль.'
            });
        } catch (e) {
            setNotice({
                type: 'error',
                text: e instanceof Error ? e.message : 'Не удалось создать аккаунт'
            });
        } finally {
            setCreating(false);
        }
    }

    return (
        <div className="view-stack narrow-view">
            <PageHeading
                eyebrow="Управление доступом"
                title="Пользователи"
                description="Создавайте аккаунты жильцов и ответственных сотрудников."
            />
            <form className="panel form-card" onSubmit={createUser}>
                <div className="form-intro">
                    <span className="form-icon">♙</span>
                    <div>
                        <h2>Новый аккаунт</h2>
                        <p>Пользователь получит эти данные для первого входа.</p>
                    </div>
                </div>
                <Field label="ФИО">
                    <input name="fullName" placeholder="Иван Иванов" maxLength={150} required/>
                </Field>
                <div className="two-fields">
                    <Field label="Логин">
                        <input name="login" placeholder="ivanov" minLength={3} maxLength={64} required/>
                    </Field>
                    <Field label="Роль">
                        <select name="role" defaultValue="RESIDENT">
                            <option value="RESIDENT">Жилец</option>
                            <option value="REVIEWER">Ответственный</option>
                        </select>
                    </Field>
                </div>
                <Field label="Первоначальный пароль" hint="Минимум 8 символов">
                    <input name="password" type="password" minLength={8} maxLength={128} required/>
                </Field>
                <div className="two-fields">
                    <Field label="Block ID" hint="UUID корпуса">
                        <input name="blockId" placeholder="UUID блока" required/>
                    </Field>
                    <Field label="Комната">
                        <input name="roomNumber" placeholder="203" maxLength={20} required/>
                    </Field>
                </div>
                <NoticeBox notice={notice}/>
                <button className="primary-button full-width" disabled={creating}>
                    {creating ? 'Создаём аккаунт…' : 'Создать аккаунт'}<span>→</span>
                </button>
            </form>
        </div>
    );
}
