export default function Loading({text}: { text: string }) {
    return (
        <div className="loading-state">
            <span className="spinner"/>
            {text}
        </div>
    );
}
