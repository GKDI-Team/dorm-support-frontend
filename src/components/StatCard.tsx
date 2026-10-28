export default function StatCard({label, icon, tone, value, caption}: {
    label: string;
    icon: string;
    tone?: string;
    value: string;
    caption: string;
}) {
    return (
        <div className="stat-card">
            <span className={`stat-icon ${tone || ''}`}>{icon}</span>
            <div>
                <p>{label}</p>
                <strong>{value}</strong>
                <small>{caption}</small>
            </div>
        </div>
    );
}
