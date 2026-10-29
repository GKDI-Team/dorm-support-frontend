import {Link} from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <main className="auth-page">
            <section className="auth-card">
                <div className="auth-card-heading">
                    <span className="icon-circle">?</span>
                    <div>
                        <h2>Страница не найдена</h2>
                        <p>Такого адреса в DormSupport нет</p>
                    </div>
                </div>
                <Link className="primary-button full-width" to="/">Вернуться на главную</Link>
            </section>
        </main>
    );
}
