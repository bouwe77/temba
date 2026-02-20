---
id: serving-a-frontend
title: Serving a Frontend with the API
sidebar_position: 2
---

# Serving a Frontend with the API

Temba is a single Node process that can serve both your REST API and a frontend app's static files. This means you can build your frontend, point Temba at the output folder, and deploy the whole thing as one service — no separate static hosting needed.

## How it works

Configure `staticFolder` with the path to your frontend's build output:

```js
import { create } from 'temba'

const server = await create({
  staticFolder: 'build',
})

server.start()
```

Temba will:

- Serve your frontend from `/` (e.g. `build/index.html` for `GET /`)
- Automatically set `apiPrefix` to `'api'`, so all API routes live under `/api`

The resulting URL structure:

| Request | Result |
|---|---|
| `GET /` | Serves `build/index.html` |
| `GET /about.html` | Serves `build/about.html` |
| `GET /api/movies` | API — returns all movies |
| `POST /api/movies` | API — creates a movie |

Your frontend calls the API at `/api/<resource>`, and Temba handles both from the same port.

## Building the frontend

This recipe is framework-agnostic. Any tool that produces a static build folder works — React, Vue, Svelte, plain HTML, etc. For example, with Vite the default output folder is `dist`:

```js
const server = await create({
  staticFolder: 'dist',
})
```

Make sure to build the frontend before starting Temba:

```bash
npm run build   # builds frontend into dist/ or build/
node server.js  # starts Temba
```

## Deploying to a cloud provider

Because Temba serves everything from a single Node process on a single port, deploying is straightforward — just deploy the Node app and the built frontend together.

**What to include in your deployment:**

- Your `server.js` (or equivalent entry point)
- The frontend build folder (`build/` or `dist/`)
- `package.json` and `node_modules` (or let the platform install dependencies)

**Example: deploying to [Railway](https://railway.app), [Render](https://render.com), or [Fly.io](https://fly.io)**

These platforms all work the same way:

1. Push your project to a Git repository
2. Connect the repository to the platform
3. Set the start command to `node server.js` (or your entry point)
4. Deploy — the platform installs dependencies, and your app is live

Make sure your frontend build step runs before the deploy, or configure a build command on the platform (e.g. `npm run build && node server.js`).

**Port binding:**

Cloud platforms typically assign a port via the `PORT` environment variable. Pass it through to Temba:

```js
const server = await create({
  staticFolder: 'build',
  port: process.env.PORT || 8362,
})

server.start()
```

That's all it takes — one repo, one deployment, one running process serving both your frontend and your API.

## Taking it further with WebSockets

Once your frontend and API are running together, you can enable [WebSockets](/docs/websockets) to push live data updates to your app:

```js
const server = await create({
  staticFolder: 'build',
  port: process.env.PORT || 8362,
  webSocket: true,
})
```

Your frontend connects to `ws://localhost:8362/ws` (or your deployed URL) and receives a message whenever a resource is created, updated, or deleted — no polling needed. This is an easy way to make your app feel noticeably more dynamic, especially for collaborative or real-time use cases.
