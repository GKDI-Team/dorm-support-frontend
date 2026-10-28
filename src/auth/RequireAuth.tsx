import type {ReactNode} from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import {useAuth} from './AuthContext';
import Brand from '../components/Brand';
import Loading from '../components/Loading';
import type {UserRole} from '../api';

/**
 * Пускает дальше только авторизованного пользователя.
 * Пока идёт проверка токена — показывает экран загрузки, чтобы не мигать логином.
 */
export function RequireAuth({children}: { children: ReactNode }) {
    const {user, initializing} = useAuth();
    const location = useLocation();

    if (initializing) {
        return (
            <main className="loading-screen">
                <Brand/>
                <Loading text="Проверяем сессию…"/>
            </main>
        );
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{from: `${location.pathname}${location.search}`}}
            />
        );
    }

    return <>{children}</>;
}

/** Дополнительный guard для разделов, доступных только конкретной роли. */
export function RequireRole({role, children}: { role: UserRole; children: ReactNode }) {
    const {user} = useAuth();

    if (!user) return <Navigate to="/login" replace/>;
    if (user.role !== role) return <Navigate to="/" replace/>;

    return <>{children}</>;
}
