import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import {apiRequest, clearAccessToken, getAccessToken, saveAccessToken} from '../api';
import type {LoginResponse, User} from '../api';

interface AuthContextValue {
    /** Текущий пользователь или null, если сессии нет. */
    user: User | null;
    /** true, пока идёт первичная проверка сохранённого токена (/auth/me). */
    initializing: boolean;
    /** Логин по логину/паролю. Бросает Error с текстом от бэкенда. */
    signIn: (login: string, password: string) => Promise<User>;
    /** Выход: гасит сессию на бэкенде (best-effort) и чистит токен локально. */
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [initializing, setInitializing] = useState<boolean>(() => Boolean(getAccessToken()));

    useEffect(() => {
        if (!getAccessToken()) {
            setInitializing(false);
            return;
        }

        let cancelled = false;
        apiRequest<User>('/api/v1/auth/me')
            .then(current => {
                if (!cancelled) setUser(current);
            })
            .catch(() => {
                // Токен протух или отозван — apiRequest уже почистил sessionStorage на 401.
                if (!cancelled) {
                    clearAccessToken();
                    setUser(null);
                }
            })
            .finally(() => {
                if (!cancelled) setInitializing(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const signIn = useCallback(async (login: string, password: string) => {
        const result = await apiRequest<LoginResponse>('/api/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify({login, password})
        });
        saveAccessToken(result.accessToken);
        setUser(result.user);
        return result.user;
    }, []);

    const signOut = useCallback(async () => {
        try {
            await apiRequest<void>('/api/v1/auth/logout', {method: 'POST'});
        } catch {
            // Сеть/бэкенд недоступны — локальную сессию всё равно сбрасываем.
        }
        clearAccessToken();
        setUser(null);
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({user, initializing, signIn, signOut}),
        [user, initializing, signIn, signOut]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth должен использоваться внутри <AuthProvider>');
    }
    return context;
}
