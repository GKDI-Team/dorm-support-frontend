import {useEffect, useMemo, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {apiRequest} from '../api';
import type {Issue, IssueStatus} from '../api';
import {useAuth} from '../auth/AuthContext';
import PageHeading from '../components/PageHeading';
import NoticeBox from '../components/NoticeBox';
import type {Notice} from '../components/NoticeBox';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import {statusLabels} from '../lib/labels';
import {formatDate, pluralize} from '../lib/format';

type Filter = 'ALL' | IssueStatus;

export default function IssuesPage() {
    const {user} = useAuth();
    const navigate = useNavigate();
    const [issues, setIssues] = useState<Issue[]>([]);
    const [filter, setFilter] = useState<Filter>('ALL');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const staff = user?.role !== 'RESIDENT';

    useEffect(() => {
        setLoading(true);
        apiRequest<Issue[]>('/api/v1/issues')
            .then(setIssues)
            .catch(e => setError(e instanceof Error ? e.message : 'Не удалось загрузить заявки'))
            .finally(() => setLoading(false));
    }, []);

    const visible = useMemo(
        () => filter === 'ALL' ? issues : issues.filter(i => i.status === filter),
        [issues, filter]
    );

    const counts = {
        all: issues.length,
        new: issues.filter(i => i.status === 'NEW').length,
        progress: issues.filter(i => i.status === 'IN_PROGRESS').length,
        closed: issues.filter(i => i.status === 'CLOSED').length
    };

    const notice: Notice | undefined = error ? {type: 'error', text: error} : undefined;

    return (
        <div className="view-stack">
            <PageHeading
                eyebrow={staff ? 'Рабочая очередь' : 'Личный кабинет'}
                title={staff ? 'Заявки жителей' : 'Мои заявки'}
                description={staff
                    ? 'Просматривайте обращения и обновляйте их статус.'
                    : 'История ваших обращений в общежитие.'}
                action={!staff && (
                    <Link className="primary-button" to="/issues/new">＋ Новая заявка</Link>
                )}
            />

            <div className="filter-tabs">
                {([
                    ['ALL', 'Все', counts.all],
                    ['NEW', 'Новые', counts.new],
                    ['IN_PROGRESS', 'В работе', counts.progress],
                    ['CLOSED', 'Закрытые', counts.closed]
                ] as const).map(([value, label, count]) => (
                    <button
                        key={value}
                        type="button"
                        className={filter === value ? 'filter-tab active' : 'filter-tab'}
                        onClick={() => setFilter(value)}
                    >
                        <span>{label}</span><b>{count}</b>
                    </button>
                ))}
            </div>

            <section className="panel issues-panel">
                <div className="table-heading">
                    <div>
                        <h2>{filter === 'ALL' ? 'Все обращения' : statusLabels[filter]}</h2>
                        <span>{visible.length} {pluralize(visible.length)}</span>
                    </div>
                    <button className="quiet-button" type="button">↕ Сортировка: новые</button>
                </div>
                <NoticeBox notice={notice}/>
                {loading ? (
                    <Loading text="Загружаем заявки…"/>
                ) : visible.length === 0 ? (
                    <EmptyState
                        staff={Boolean(staff)}
                        onCreate={() => navigate('/issues/new')}
                    />
                ) : (
                    <div className="issues-table">
                        <div className="table-row table-header">
                            <span>Заявка</span><span>Место</span><span>Статус</span><span>Дата</span><span/>
                        </div>
                        {visible.map(issue => (
                            <button
                                key={issue.id}
                                type="button"
                                className="table-row issue-row"
                                onClick={() => navigate(`/issues/${issue.id}`)}
                            >
                                <div className="issue-title">
                                    <span className="issue-dot"/>
                                    <div>
                                        <strong>{issue.title}</strong>
                                        <small>{issue.categoryName}</small>
                                    </div>
                                </div>
                                <div className="issue-place">
                                    <strong>Блок {issue.block || 'Не указан'}</strong>
                                    <small>Комната {issue.roomNumber}</small>
                                </div>
                                <StatusBadge status={issue.status}/>
                                <time>{formatDate(issue.createdAt)}</time>
                                <span className="row-arrow">→</span>
                            </button>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
