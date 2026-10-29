import type {IssueStatus, UserRole} from '../api';

export const statusLabels: Record<IssueStatus, string> = {
    NEW: 'Новая',
    IN_PROGRESS: 'В работе',
    CLOSED: 'Закрыта'
};

export const statusDescriptions: Record<IssueStatus, string> = {
    NEW: 'Заявка ожидает обработки',
    IN_PROGRESS: 'Ответственный уже занимается проблемой',
    CLOSED: 'Проблема решена'
};

export const roleLabels: Record<UserRole, string> = {
    RESIDENT: 'Жилец',
    REVIEWER: 'Ответственный',
    ADMIN: 'Администратор'
};

/** Порядок статусов для выпадающих списков. */
export const issueStatuses: IssueStatus[] = ['NEW', 'IN_PROGRESS', 'CLOSED'];
