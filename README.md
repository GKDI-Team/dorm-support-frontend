# DormSupport Frontend

Шаблонный пользовательский интерфейс первого этапа на React и TypeScript: вход, текущий пользователь, выход и создание аккаунтов через API авторизации.

**Технологии:** React, TypeScript, Vite, nginx.

## Локальный запуск

Интерфейс запускается из общего репозитория инфраструктуры через Docker Compose и доступен через Gateway на `http://localhost:8080`.

Для запуска всего проекта выполните `make up` в папке `dorm-support-infrastructure`. Для локальной разработки из папки интерфейса:

```bash
npm install
npm run dev
```

Для работы API необходим запущенный Gateway.
