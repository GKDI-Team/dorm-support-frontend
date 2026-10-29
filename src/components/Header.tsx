import {useAuth} from '../auth/AuthContext';
import {roleLabels} from '../lib/labels';
import {getInitials} from '../lib/format';
import Brand from './Brand';

export default function Header() {
    const {user, signOut} = useAuth();

    if (!user) return null;

    return (
        <header className="app-header">
            <div className="mobile-brand">
                <Brand/>
            </div>
            <div className="header-spacer"/>
            <div className="header-actions">
                <span className="header-date">Портал общежития</span>
                <button className="notification-button" type="button" aria-label="Уведомления">♧</button>
                <div className="user-menu">
                    <span className="user-avatar">{getInitials(user.fullName || user.login)}</span>
                    <span className="user-summary">
                        <strong>{user.fullName}</strong>
                        <small>{roleLabels[user.role]}</small>
                    </span>
                    <button
                        className="logout-button"
                        type="button"
                        aria-label="Выйти"
                        onClick={() => {
                            void signOut();
                        }}
                    >
                        ↪
                    </button>
                </div>
            </div>
        </header>
    );
}
