import {Outlet} from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * Каркас приложения: сайдбар + шапка + область контента.
 * Контент конкретной страницы подставляется через <Outlet/>.
 */
export default function Layout() {
    return (
        <div className="app-shell">
            <Sidebar/>
            <div className="content-area">
                <Header/>
                <main className="main-content">
                    <Outlet/>
                </main>
            </div>
        </div>
    );
}
