import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {AuthProvider} from './auth/AuthContext';
import {RequireAuth, RequireRole} from './auth/RequireAuth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';
import IssuesPage from './pages/IssuesPage';
import CreateIssuePage from './pages/CreateIssuePage';
import IssueDetailsPage from './pages/IssueDetailsPage';
import UsersPage from './pages/UsersPage';
import NotFoundPage from './pages/NotFoundPage';

/**
 * Корневой компонент: провайдеры + таблица маршрутов. Бизнес-логики здесь нет.
 *
 *   /login            — вход (публичный)
 *   /                 — обзор (Личный кабинет)
 *   /issues           — список заявок
 *   /issues/new       — создание заявки
 *   /issues/:issueId  — карточка заявки
 *   /users            — управление пользователями (только ADMIN)
 *   *                 — 404
 */
export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>

                    {/* Pathless layout route: RequireAuth охраняет всё поддерево,
                        Layout рисует сайдбар/шапку и подставляет <Outlet/>. */}
                    <Route element={<RequireAuth><Layout/></RequireAuth>}>
                        <Route path="/" element={<OverviewPage/>}/>
                        <Route path="/issues" element={<IssuesPage/>}/>
                        <Route path="/issues/new" element={<CreateIssuePage/>}/>
                        <Route path="/issues/:issueId" element={<IssueDetailsPage/>}/>
                        <Route
                            path="/users"
                            element={<RequireRole role="ADMIN"><UsersPage/></RequireRole>}
                        />
                    </Route>

                    <Route path="*" element={<NotFoundPage/>}/>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
