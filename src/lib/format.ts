/** «12 мар. 2026 г.» */
export function formatDate(value: string): string {
    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(new Date(value));
}

/** Короткий идентификатор для UI: первые 8 символов в верхнем регистре. */
export function shortId(value: string | null | undefined): string {
    return value ? value.slice(0, 8).toUpperCase() : '—';
}

/** 1 заявка / 2 заявки / 5 заявок */
export function pluralize(value: number): string {
    const x = value % 10;
    const y = value % 100;
    if (x === 1 && y !== 11) return 'заявка';
    if (x >= 2 && x <= 4 && (y < 10 || y >= 20)) return 'заявки';
    return 'заявок';
}

/** «Иван Иванов» → «ИИ» */
export function getInitials(source: string): string {
    return (source || '?')
        .split(' ')
        .filter(Boolean)
        .map(part => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}
