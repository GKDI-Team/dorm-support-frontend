export default function Step({number, title, text}: { number: string; title: string; text: string }) {
    return (
        <div className="step">
            <span>{number}</span>
            <div>
                <strong>{title}</strong>
                <p>{text}</p>
            </div>
        </div>
    );
}
