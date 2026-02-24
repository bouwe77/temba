---
id: cors
title: CORS
sidebar_position: 12
---

# CORS

Temba automatically sends CORS headers on every response, so your API works out of the box with browser-based frontends on different origins. No configuration required.

The default behaviour allows all origins (`*`) and supports all HTTP methods Temba handles:

```js
const config = {
  cors: {
    origin: '*',
    methods: 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS',
    headers: 'Content-Type, X-Token',
    credentials: false,
    exposeHeaders: null,
    maxAge: null,
  },
}
```

You only need to configure `cors` when you want to override one or more of these defaults. Any field you omit keeps its default value:

```js
const config = {
  cors: {
    origin: 'https://myapp.com',
  },
}
const server = await create(config)
```

## Settings

| Setting        | Description                                                                                                          | Default                                          |
| :------------- | :------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------- |
| `origin`       | Value of the `Access-Control-Allow-Origin` header.                                                                   | `'*'`                                            |
| `methods`      | Value of the `Access-Control-Allow-Methods` header.                                                                  | `'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS'` |
| `headers`      | Value of the `Access-Control-Allow-Headers` header.                                                                  | `'Content-Type, X-Token'`                        |
| `credentials`  | When `true`, sends `Access-Control-Allow-Credentials: true`. Required when the client sends cookies or auth headers. | `false` (header omitted)                         |
| `exposeHeaders`| Value of the `Access-Control-Expose-Headers` header. Lists response headers the browser is allowed to read.          | `null` (header omitted)                          |
| `maxAge`       | Value of the `Access-Control-Max-Age` header, in seconds. Controls how long browsers cache preflight responses.      | `null` (header omitted)                          |

## OPTIONS preflight requests

Temba automatically responds to all `OPTIONS` requests with `204 No Content`, including the configured CORS headers. No additional setup is needed.
