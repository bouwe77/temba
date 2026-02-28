---
id: custom-routes
title: Custom routes
sidebar_position: 3
---

# Custom routes

Temba's built-in routes always return JSON. If your API needs routes that return something else (an image, a PDF, a CSV export), you can combine Temba with your own Node.js HTTP server, all on a single port.

## Before reaching for this

Check whether an existing Temba feature already covers your need:

- **Serve HTML or a frontend app**: use [`staticFolder`](/docs/static-assets). See also the [Serving a Frontend](/docs/recipes/serving-a-frontend) recipe.
- **Return a custom status code or body for a resource route**: use [`requestInterceptor`](/docs/request-interceptor) with `actions.response()`.
- **Modify the JSON response body before it's sent**: use [`responseBodyInterceptor`](/docs/response-interceptor).

Custom routes are the right tool when you need a response format that isn't JSON: binary data, CSV, plain text, etc.

## How it works

`create()` returns a `server` property: the raw Node.js `http.Server` that Temba uses internally. You can delegate requests to it from your own server using Node's standard `emit('request', req, res)`.

Your server runs in front. It handles the routes it knows about and falls through to Temba for everything else:

```js
import { create } from 'temba'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'

const temba = await create()
// deliberately NOT calling temba.start()

const server = createServer(async (req, res) => {
  // Serve a PNG image from disk
  if (req.method === 'GET' && req.url === '/logo.png') {
    const image = await readFile('./public/logo.png')
    res.writeHead(200, { 'Content-Type': 'image/png' })
    res.end(image)
    return
  }

  // Everything else goes to Temba
  temba.server.emit('request', req, res)
})

server.listen(8362)
```

The key detail: do not call `temba.start()`. Temba will not listen on any port unless you explicitly call `start()` or `server.listen()`. Your outer server owns the port.

## Why this works

`temba.server` is a standard Node.js `http.Server`. Its internal routing lives in a `request` event listener. Calling `emit('request', req, res)` fires that listener directly with the original request and response objects, with no proxy, no extra overhead, and no second port.

## URL structure

| Request | Handled by |
|---|---|
| `GET /logo.png` | Your custom handler |
| `GET /report.csv` | Your custom handler |
| `GET /movies` | Temba |
| `POST /movies` | Temba |
| `GET /openapi.json` | Temba |

Custom routes take priority because your handler runs first. If your handler writes a response and returns, Temba never sees the request.

## Overriding a Temba route

Your custom handler also runs before Temba for any route, including ones Temba would normally handle. This means you can override Temba's response for a specific route:

```js
const server = createServer(async (req, res) => {
  // Return a CSV instead of Temba's JSON for GET /movies
  if (req.method === 'GET' && req.url === '/movies') {
    const movies = await fetchMoviesFromSomewhere()
    const csv = movies.map((m) => `${m.id},${m.title}`).join('\n')
    res.writeHead(200, { 'Content-Type': 'text/csv' })
    res.end(`id,title\n${csv}`)
    return
  }

  temba.server.emit('request', req, res)
})
```

## Using an API prefix

If you configure an `apiPrefix`, your Temba routes are scoped under that prefix. Your custom routes are entirely separate and unaffected:

```js
const temba = await create({ apiPrefix: 'api' })

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/logo.png') {
    // custom route, no prefix needed
    res.writeHead(200, { 'Content-Type': 'image/png' })
    res.end(await readFile('./public/logo.png'))
    return
  }

  temba.server.emit('request', req, res)
})

server.listen(8362)
```

| Request | Handled by |
|---|---|
| `GET /logo.png` | Your custom handler |
| `GET /api/movies` | Temba |
| `POST /api/movies` | Temba |

---

For isolated, runnable examples of the features used here, see [example 11 (API Prefix)](https://github.com/bouwe77/temba/tree/main/examples/11%20-%20API%20Prefix) in the [Examples](/docs/examples) section.
