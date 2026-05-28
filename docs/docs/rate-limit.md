---
id: rate-limit
title: Rate limiting
sidebar_position: 13
---

# Rate limiting

Temba enables rate limiting by default to protect your API from accidental request floods
(for example, a runaway `useEffect` in React) and intentional abuse. No configuration
is required — it works out of the box.

By default, each client IP address is limited to **100 requests per minute**:

```js
const config = {
  rateLimit: {
    max: 100,
    windowMs: 60_000,
  },
}
const server = await create(config)
```

When the limit is exceeded, Temba responds with `429 Too Many Requests`, a
`Retry-After` header indicating how many seconds until the window resets, and a JSON
error body:

```json
{ "message": "Too many requests" }
```

Rate limiting applies to all routes: API resources, the root URL, the OpenAPI spec,
and static files.

## Disabling rate limiting

If you need to disable rate limiting entirely, set `rateLimit` to `false`:

```js
const config = {
  rateLimit: false,
}
const server = await create(config)
```

## Settings

| Setting      | Description                                                               | Default  |
| :----------- | :------------------------------------------------------------------------ | :------- |
| `max`        | Maximum number of requests allowed per IP within the window.              | `100`    |
| `windowMs`   | Duration of the rate limit window in milliseconds.                        | `60000`  |
| `trustProxy` | When `true`, uses the `x-forwarded-for` header to identify the client IP. | `false`  |

## Behind a reverse proxy

By default, Temba identifies clients by their TCP connection address (`remoteAddress`),
which cannot be spoofed. This is the correct and safe behaviour when Temba is accessed
directly.

If Temba is running behind a trusted reverse proxy (such as nginx, Caddy, or
Cloudflare), the TCP address will always be the proxy's IP, causing all clients to
share a single rate limit bucket. In this case, enable `trustProxy` so Temba reads the
client IP from the `x-forwarded-for` header set by the proxy:

```js
const config = {
  rateLimit: {
    max: 100,
    windowMs: 60_000,
    trustProxy: true,
  },
}
const server = await create(config)
```

> **Only enable `trustProxy` when Temba is behind a proxy you control.** The
> `x-forwarded-for` header can be set to any value by clients, so enabling this option
> without a proxy in front allows anyone to spoof their IP and bypass the rate limit.
