export default function EmptyState({staff, onCreate}: { staff: boolean; onCreate: () => void }) {
    return (
        <div className="empty-state">
            <span className="empty-icon">☷</span>
            <h3>Заявок пока нет</h3>
            <p>{staff
                ? 'Когда жильцы создадут обращения, они появятся здесь.'
                : 'Сообщите о бытовой проблеме, чтобы мы могли её решить.'}</p>
            {!staff && (
                <button className="primary-button" type="button" onClick={onCreate}>
                    Создать первую заявку
                </button>
            )}
        </div>
    );
}
