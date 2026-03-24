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

В сервер были внесены 2 минимальные правки, без которых фронтенд не мог корректно работать с текущим API:

1. `GET /items` теперь возвращает `id` у элементов списка.
   Причина: без `id` невозможно корректно перейти со списка на страницу объявления `/ads/:id`.

2. Сервер теперь читает `PORT`, а не только `port`.
   Причина: в задании и обычной практике переменная окружения называется именно `PORT`.

Файл с изменениями: [server/server.ts](/ads-app/server/server.ts)

## CORS setup (Fastify)

Для локальной совместной работы фронтенда и бэкенда CORS включен в server/server.ts через @fastify/cors.
Это добавлено как временный обход из-за изначально некорректной CORS-конфигурации на стороне сервера в исходных файлах.
Плагин регистрируется до объявления роутов:

```ts
await fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```
