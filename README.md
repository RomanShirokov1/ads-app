# ads-app

Структура проекта:

```text
ads-app/
  client/   # frontend на React + Vite
  server/   # backend на Fastify
```

## Запуск

### Backend

```powershell
cd server
npm i
npm start
```

### Frontend

```powershell
cd client
npm i
Copy-Item .env.example .env
npm run dev
```

Подробности по фронтенду и принятым решениям см. в [client/README.md](/c:/FrontProjects/ads-app/client/README.md).

## Изменения в сервере

Да, в сервер были внесены 2 минимальные правки, без которых фронтенд не мог корректно работать с текущим API:

1. `GET /items` теперь возвращает `id` у элементов списка.
   Причина: без `id` невозможно корректно перейти со списка на страницу объявления `/ads/:id`.

2. Сервер теперь читает `PORT`, а не только `port`.
   Причина: в задании и обычной практике переменная окружения называется именно `PORT`.

Файл с изменениями: [server/server.ts](/ads-app/server/server.ts)

## CORS setup (Fastify)

For local frontend/backend work, CORS is enabled in `server/server.ts` via `@fastify/cors`.
This was added as a workaround for an initial server-side CORS misconfiguration.
The plugin is registered before route declarations:

```ts
await fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```
