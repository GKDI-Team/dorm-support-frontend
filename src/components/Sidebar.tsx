import {Link, useLocation} from 'react-router-dom';
import {useAuth} from '../auth/AuthContext';
import Brand from './Brand';

interface NavItem {
    to: string;
    label: string;
    icon: string;
    isActive: (pathname: string) => boolean;
}

export default function Sidebar() {
    const {user} = useAuth();
    const {pathname} = useLocation();

    if (!user) return null;

    const isStaff = user.role !== 'RESIDENT';

    const items: NavItem[] = [
        {
            to: '/',
            label: 'Обзор',
            icon: '⌂',
            isActive: path => path === '/'
        },
        {
            to: '/issues',
            label: isStaff ? 'Все заявки' : 'Мои заявки',
            icon: '☷',
            // Подсвечиваем и карточку заявки, но не страницу создания.
            isActive: path => path === '/issues' || /^\/issues\/(?!new$)[^/]+$/.test(path)
        },
        ...(isStaff ? [] : [{
            to: '/issues/new',
            label: 'Создать заявку',
            icon: '＋',
            isActive: (path: string) => path === '/issues/new'
        }]),
        ...(user.role === 'ADMIN' ? [{
            to: '/users',
            label: 'Пользователи',
            icon: '♙',
            isActive: (path: string) => path === '/users' || path.startsWith('/users/')
        }] : [])
    ];

    return (
        <aside className="sidebar">
            <Brand/>
            <nav className="main-nav">
                {items.map(item => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={item.isActive(pathname) ? 'nav-item active' : 'nav-item'}
                    >
                        <span>{item.icon}</span> {item.label}
                    </Link>
                ))}
            </nav>
            <div className="sidebar-bottom">
                <div className="sidebar-version">DormSupport MVP <span>•</span> 1.0</div>
            </div>
        </aside>
    );
}