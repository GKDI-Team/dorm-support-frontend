import {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {apiRequest} from '../api';
import type {IssueDetails, IssueStatus} from '../api';
import {useAuth} from '../auth/AuthContext';
import PageHeading from '../components/PageHeading';
import NoticeBox from '../components/NoticeBox';
import type {Notice} from '../components/NoticeBox';
import Loading from '../components/Loading';
import StatusBadge from '../components/StatusBadge';
import {issueStatuses, statusDescriptions, statusLabels} from '../lib/labels';
import {formatDate, shortId} from '../lib/format';

export default function IssueDetailsPage() {
    const {issueId} = useParams<{ issueId: string }>();
    const {user} = useAuth();

    const [issue, setIssue] = useState<IssueDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<IssueStatus>('NEW');
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState<Notice>();

    const staff = user?.role !== 'RESIDENT';

    useEffect(() => {
        if (!issueId) return;
        setLoading(true);
        apiRequest<IssueDetails>(`/api/v1/issues/${issueId}`)
            .then(result => {
                setIssue(result);
                setStatus(result.status);
            })
            .catch(e => setNotice({
                type: 'error',
                text: e instanceof Error ? e.message : 'Не удалось загрузить заявку'
            }))
            .finally(() => setLoading(false));
    }, [issueId]);

    async function updateStatus() {
        if (!issue || status === issue.status) return;
        setSaving(true);
        setNotice(undefined);
        try {
            const updated = await apiRequest<IssueDetails>(`/api/v1/issues/${issue.id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({status})
            });
            setIssue(updated);
            setStatus(updated.status);
            setNotice({type: 'success', text: 'Статус заявки обновлён'});
        } catch (e) {
            setNotice({type: 'error', text: e instanceof Error ? e.message : 'Не удалось изменить статус'});
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="view-stack">
            <Link className="back-link" to="/issues">← Все заявки</Link>

            {loading ? (
                <Loading text="Загружаем заявку…"/>
            ) : !issue ? (
                <section className="panel">
                    <NoticeBox notice={notice}/>
                </section>
            ) : (
                <>
                    <PageHeading
                        eyebrow={`Заявка №${shortId(issue.id)}`}
                        title={issue.title}
                        description={`Создана ${formatDate(issue.createdAt)}`}
                    />
                    <div className="detail-grid">
                        <section className="panel detail-main">
                            <div className="detail-top">
                                <StatusBadge status={issue.status}/>
                                <span className="detail-category">{issue.categoryName}</span>
                            </div>
                            <div className="detail-section">
                                <span className="section-label">Описание проблемы</span>
                                <p className="description-text">{issue.description}</p>
                            </div>
                            <div className="detail-section">
                                <span className="section-label">Место</span>
                                <div className="location-box">
                                    <span>⌖</span>
                                    <div>
                                        <strong>Блок {issue.block || 'Не указан'}</strong>
                                        <p>{issue.locationDetails} · комната {issue.roomNumber}</p>
                                    </div>
                                </div>
                            </div>
                            <NoticeBox notice={notice}/>
                        </section>

                        <aside className="detail-side">
                            <section className="panel status-panel">
                                <span className="section-label">Текущий статус</span>
                                {staff ? (
                                    <>
                                        <select
                                            value={status}
                                            onChange={e => setStatus(e.target.value as IssueStatus)}
                                        >
                                            {issueStatuses.map(value => (
                                                <option value={value} key={value}>{statusLabels[value]}</option>
                                            ))}
                                        </select>
                                        <button
                                            className="primary-button full-width"
                                            type="button"
                                            onClick={updateStatus}
                                            disabled={saving || status === issue.status}
                                        >
                                            {saving ? 'Сохраняем…' : 'Сохранить статус'}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <StatusBadge status={issue.status}/>
                                        <p>{statusDescriptions[issue.status]}</p>
                                    </>
                                )}
                            </section>

                            <section className="panel history-panel">
                                <span className="section-label">История</span>
                                <div className="timeline">
                                    {issue.statusHistory.map(entry => (
                                        <div className="timeline-item" key={entry.id}>
                                            <span className="timeline-dot"/>
                                            <div>
                                                <strong>
                                                    {entry.toStatus === 'NEW'
                                                        ? 'Заявка создана'
                                                        : `Статус: ${statusLabels[entry.toStatus]}`}
                                                </strong>
                                                <small>{formatDate(entry.changedAt)}</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </aside>
                    </div>
                </>
            )}
        </div>
    );
}
