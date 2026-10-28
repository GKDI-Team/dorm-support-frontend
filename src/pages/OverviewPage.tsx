import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {apiRequest} from '../api';
import type {Issue} from '../api';
import {useAuth} from '../auth/AuthContext';
import PageHeading from '../components/PageHeading';
import StatCard from '../components/StatCard';
import Info from '../components/Info';
import Step from '../components/Step';
import {formatDate, shortId} from '../lib/format';

export default function OverviewPage() {
    const {user} = useAuth();
    const navigate = useNavigate();
    const [issues, setIssues] = useState<Issue[]>([]);

    useEffect(() => {
        apiRequest<Issue[]>('/api/v1/issues')
            .then(setIssues)
            .catch(() => setIssues([]));
    }, []);

    if (!user) return null;

    const staff = user.role !== 'RESIDENT';
    const counts = {
        all: issues.length,
        new: issues.filter(i => i.status === 'NEW').length,
        progress: issues.filter(i => i.status === 'IN_PROGRESS').length,
        closed: issues.filter(i => i.status === 'CLOSED').length
    };

    return (
        <div className="view-stack">
            <PageHeading
                eyebrow="Личный кабинет"
                title={`Добрый день, ${user.fullName.split(' ')[0]}!`}
                description={staff
                    ? 'Здесь собраны заявки и рабочие задачи общежития.'
                    : 'Здесь вы можете сообщить о проблеме и следить за её решением.'}
            />
            <section className="welcome-banner">
                <div>
                    <span className="banner-kicker">DORMSUPPORT</span>
                    <h2>{staff ? 'Порядок начинается с одной заявки.' : 'Ваш комфорт — наша общая забота.'}</h2>
                    <p>{staff
                        ? 'Обработайте новые обращения жителей и помогите поддерживать порядок.'
                        : 'Опишите неисправность, а ответственный сотрудник займётся её решением.'}</p>
                    <button
                        className="white-button"
                        type="button"
                        onClick={() => navigate(staff ? '/issues' : '/issues/new')}
                    >
                        {staff ? 'Открыть список заявок' : 'Создать заявку'} <span>→</span>
                    </button>
                </div>
                <div className="banner-art"><span>✦</span><span>⌁</span><span>✚</span></div>
            </section>
            <div className="stats-grid">
                <StatCard
                    label={staff ? 'Всего заявок' : 'Мои заявки'}
                    value={String(counts.all)}
                    caption="Всего обращений"
                    icon="☷"
                />
                <StatCard label="Новые" value={String(counts.new)} caption="Ожидают внимания" icon="○" tone="green"/>
                <StatCard label="В работе" value={String(counts.progress)} caption="Заявки в обработке" icon="◷"
                          tone="orange"/>
                <StatCard label="Закрытые" value={String(counts.closed)} caption="Решённые проблемы" icon="✓"
                          tone="purple"/>
            </div>
            <div className="dashboard-grid">
                <section className="panel profile-panel">
                    <div className="panel-heading">
                        <div>
                            <span className="section-label">Мой профиль</span>
                            <h2>Данные аккаунта</h2>
                        </div>
                        <span className="role-chip">{user.role}</span>
                    </div>
                    <div className="profile-large">
                        <span className="profile-avatar">{(user.fullName || '?').charAt(0).toUpperCase()}</span>
                        <div>
                            <h3>{user.fullName}</h3>
                            <p>{user.login}</p>
                        </div>
                    </div>
                    <div className="profile-details">
                        <Info label="Корпус" value={user.blockId ? shortId(user.blockId) : 'Не указан'}/>
                        <Info label="Комната" value={user.roomNumber || 'Не указана'}/>
                        <Info label="В системе с" value={formatDate(user.createdAt)}/>
                    </div>
                </section>
                <section className="panel how-panel">
                    <span className="section-label">Как это работает</span>
                    <h2>Три шага до решения</h2>
                    <div className="steps">
                        <Step number="01" title="Опишите проблему"
                              text="Укажите, что случилось и где это находится."/>
                        <Step number="02" title="Заявка в работе"
                              text="Ответственный увидит обращение и изменит статус."/>
                        <Step number="03" title="Готово"
                              text="Следите за решением в личном кабинете."/>
                    </div>
                </section>
            </div>
        </div>
    );
}
