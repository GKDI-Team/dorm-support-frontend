import {useEffect, useState} from 'react';
import type {FormEvent} from 'react';
import {useNavigate} from 'react-router-dom';
import {apiRequest} from '../api';
import type {Issue, IssueCategory} from '../api';
import PageHeading from '../components/PageHeading';
import Field from '../components/Field';
import NoticeBox from '../components/NoticeBox';
import type {Notice} from '../components/NoticeBox';

export default function CreateIssuePage() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<IssueCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState<Notice>();

    useEffect(() => {
        apiRequest<IssueCategory[]>('/api/v1/categories')
            .then(setCategories)
            .catch(() => setNotice({type: 'error', text: 'Не удалось загрузить категории'}))
            .finally(() => setLoading(false));
    }, []);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setSaving(true);
        setNotice(undefined);
        try {
            const issue = await apiRequest<Issue>('/api/v1/issues', {
                method: 'POST',
                body: JSON.stringify({
                    title: String(form.get('title')),
                    description: String(form.get('description')),
                    categoryId: String(form.get('categoryId')),
                    locationDetails: String(form.get('locationDetails'))
                })
            });
            navigate(`/issues/${issue.id}`);
        } catch (e) {
            setNotice({type: 'error', text: e instanceof Error ? e.message : 'Не удалось создать заявку'});
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="view-stack narrow-view">
            <PageHeading
                eyebrow="Новое обращение"
                title="Создать заявку"
                description="Опишите проблему — ответственный сотрудник увидит её в рабочей очереди."
                action={
                    <button className="quiet-button" type="button" onClick={() => navigate('/issues')}>
                        ← Назад к списку
                    </button>
                }
            />
            <form className="panel form-card" onSubmit={submit}>
                <div className="form-intro">
                    <span className="form-icon">✦</span>
                    <div>
                        <h2>Что случилось?</h2>
                        <p>Чем подробнее описание, тем быстрее мы сможем помочь.</p>
                    </div>
                </div>
                <Field label="Название проблемы">
                    <input name="title" maxLength={150} placeholder="Например, не работает лампочка" required/>
                </Field>
                <Field label="Категория">
                    <select name="categoryId" disabled={loading} required>
                        <option value="">{loading ? 'Загружаем категории…' : 'Выберите категорию'}</option>
                        {categories.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
                    </select>
                </Field>
                <Field label="Где это произошло?" hint="Укажите конкретное место: этаж, коридор, кухня и т. д.">
                    <input name="locationDetails" maxLength={250} placeholder="Например, коридор на 3 этаже"
                           required/>
                </Field>
                <Field label="Описание">
                    <textarea name="description" rows={6} placeholder="Расскажите подробнее, что произошло…"
                              required/>
                </Field>
                <NoticeBox notice={notice}/>
                <div className="form-actions">
                    <button type="button" className="secondary-button" onClick={() => navigate('/issues')}>
                        Отменить
                    </button>
                    <button className="primary-button" disabled={saving}>
                        {saving ? 'Отправляем…' : 'Отправить заявку'}<span>→</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
