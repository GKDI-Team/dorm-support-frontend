export interface Notice {
    type: 'success' | 'error';
    text: string;
}

export default function NoticeBox({notice}: { notice?: Notice }) {
    if (!notice) return null;
    return (
        <div className={`notice ${notice.type}`} role="alert">
            {notice.text}
        </div>
    );
}
