# DormSupport Frontend

Пользовательский интерфейс системы заявок общежития: вход, работа с заявками и пользователями.

**Технологии:** React, TypeScript, Vite, nginx.
Для запуска всего проекта выполните `make up` в папке `dorm-support-infrastructure`. Основные страницы: `/login`, `/issues`, `/users`.

## Стек

- **React 19** — UI
- **React Router DOM 7** — маршрутизация (URL-based навигация)
- **TypeScript 5.9** — типы
- **Vite 7** — сборка и dev-сервер
- **Обычный CSS** (`src/styles.css`) — без Tailwind и CSS-in-JS

## Установка и запуск

```bash
npm install
npm run dev
```

Открыть: http://localhost:5173/

Все запросы на `/api/**` проксируются на `http://localhost:8080` (gateway-service),
поэтому бэкенд и инфраструктура должны быть запущены через `docker compose up`.

## Сборка

```
npm run build     # dist/ — статика для раздачи через nginx
npm run preview   # локальная проверка сборки
```

Для production за nginx нужен SPA-fallback:

```
location / {
    try_files $uri $uri/ /index.html;
}
```

## Структура

```
src/
├── main.tsx                    # bootstrap: createRoot + <App/>
├── App.tsx                     # провайдеры + таблица маршрутов
├── api.ts                      # fetch-обёртка, типы, работа с JWT
├── styles.css                  # глобальные стили (единственный CSS-файл)
│
├── auth/
│   ├── AuthContext.tsx         # сессия: user, signIn, signOut
│   └── RequireAuth.tsx         # guard'ы: RequireAuth, RequireRole
│
├── lib/
│   ├── labels.ts               # человекочитаемые подписи статусов и ролей
│   └── format.ts               # formatDate, shortId, pluralize, getInitials
│
├── components/                 # переиспользуемые куски UI
│   ├── Layout.tsx              # каркас: Sidebar + Header + <Outlet/>
│   ├── Sidebar.tsx             # навигация (Link + активный пункт)
│   ├── Header.tsx              # шапка с пользователем и logout
│   ├── Brand.tsx
│   ├── Loading.tsx
│   ├── Field.tsx               # label + input + hint
│   ├── NoticeBox.tsx           # success/error уведомление + тип Notice
│   ├── PageHeading.tsx         # заголовок страницы
│   ├── StatusBadge.tsx         # цветной бейдж статуса
│   ├── EmptyState.tsx          # пустой список
│   ├── StatCard.tsx            # карточка на дашборде
│   ├── Info.tsx                # label + value в профиле
│   └── Step.tsx                # шаг в «Как это работает»
│
└── pages/                      # экраны, привязанные к маршрутам
    ├── LoginPage.tsx           # /login
    ├── OverviewPage.tsx        # /
    ├── IssuesPage.tsx          # /issues
    ├── CreateIssuePage.tsx     # /issues/new
    ├── IssueDetailsPage.tsx    # /issues/:issueId
    ├── UsersPage.tsx           # /users (только ADMIN)
    └── NotFoundPage.tsx        # * (404)
```

## Маршруты

| URL ↕▾ | Компонент ↕▾ | Доступ ↕▾ |
|---|---|---|
| −`/login` | LoginPage | публичный |
| −`/` | OverviewPage | авторизованные |
| −`/issues` | IssuesPage | авторизованные |
| −`/issues/new` | CreateIssuePage | авторизованные (UI) |
| −`/issues/:issueId` | IssueDetailsPage | авторизованные |
| −`/users` | UsersPage | ADMIN |
| −`*` | NotFoundPage | все |
⚙

Guard для `/users` реализован через `<RequireRole role="ADMIN">`.
Все остальные приватные маршруты обёрнуты в pathless layout-route
`<Route element={<RequireAuth><Layout/></RequireAuth>}>`.

## Аутентификация

Токен хранится в `sessionStorage` под ключом `dormsupport.accessToken`
(см. `src/api.ts`). При старте приложения `AuthContext` делает `GET /api/v1/auth/me`,
чтобы восстановить пользователя после перезагрузки. На `401` токен автоматически чистится.

</BDS:create_file>
<BDS:create_file fileName="frontend/src/api.ts">

```ts
const TOKEN_KEY = 'dormsupport.accessToken';

export type UserRole = 'RESIDENT' | 'REVIEWER' | 'ADMIN';
export type IssueStatus = 'NEW' | 'IN_PROGRESS' | 'CLOSED';

export interface User {
    id: string;
    login: string;
    fullName: string;
    role: UserRole;
    blockId: string | null;
    roomNumber: string | null;
    createdAt: string;
}

export interface LoginResponse {
    accessToken: string;
    user: User;
}

export interface IssueCategory {
    id: string;
    name: string;
    description?: string;
}

export interface Issue {
    id: string;
    residentId: string;
    blockId: string;
    roomNumber: string;
    title: string;
    description: string;
    categoryId: string;
    categoryName: string;
    status: IssueStatus;
    locationDetails: string;
    createdAt: string;
    updatedAt: string;
}

export interface StatusHistory {
    id: string;
    fromStatus: IssueStatus | null;
    toStatus: IssueStatus;
    changedBy: string;
    changedAt: string;
}

export interface IssueDetails extends Issue {
    statusHistory: StatusHistory[];
}

export interface ApiErrorBody {
    code?: string;
    message?: string;
}

export function getAccessToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
}

export function saveAccessToken(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
    sessionStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    if (options.body) headers.set('Content-Type', 'application/json');
    const accessToken = getAccessToken();
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

    const response = await fetch(path, {...options, headers});
    const contentType = response.headers.get('content-type') || '';
    const body = response.status === 204
        ? null
        : contentType.includes('application/json')
            ? await response.json() as ApiErrorBody
            : null;

    if (!response.ok) {
        if (response.status === 401) clearAccessToken();
        throw new Error((body as ApiErrorBody | null)?.message || `Ошибка запроса (${response.status})`);
    }
    return body as T;
}
