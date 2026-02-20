---
id: jwt-auth
title: JWT Token Authorization
sidebar_position: 1
---

# JWT Token Authorization

This recipe shows how to protect all routes of your Temba API with JWT token authorization using the `requestInterceptor`.

Temba does not issue or manage tokens — that is your responsibility. What Temba gives you is a hook to verify every incoming request before it is handled. This recipe shows how to plug in your own token verification logic.

## How it works

Every request — to resources, the API root, OpenAPI docs, and static files — passes through the `requestInterceptor`. By configuring the `get`, `post`, `put`, `patch`, and `delete` callbacks, you can verify a token on every request and return a `401 Unauthorized` response when verification fails.

## Implementation

First, implement your own `verifyToken` function. This recipe uses the [`jsonwebtoken`](https://www.npmjs.com/package/jsonwebtoken) package as an example, but any JWT library or auth mechanism works.

```js
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

/**
 * Returns the decoded token payload if valid, or null if not.
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}
```

Then configure the `requestInterceptor` to call `verifyToken` on every request:

```js
import { create } from 'temba'

function authInterceptor(request, actions) {
  const token = request.headers['authorization']?.replace('Bearer ', '')
  if (!verifyToken(token)) {
    return actions.response({ status: 401, body: { message: 'Unauthorized' } })
  }
}

const server = await create({
  requestInterceptor: {
    get: authInterceptor,
    post: authInterceptor,
    put: authInterceptor,
    patch: authInterceptor,
    delete: authInterceptor,
  },
})

server.start()
```

That's it. Every request to any route will now be checked for a valid JWT. If the token is missing or invalid, Temba immediately returns `401 Unauthorized` without processing the request further.

## Issuing tokens

How you issue tokens is entirely up to you, and it can still happen inside Temba. For example, you can treat `/login` as a resource and use the `post` interceptor to handle it: call your own auth function, and return a token via `actions.response()` — all without Temba persisting anything to its database.

```js
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

function issueToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '1h' })
}

const server = await create({
  requestInterceptor: {
    post: (request, actions) => {
      if (request.resource === 'login') {
        const { username, password } = request.body

        // Call your own auth logic here
        const userId = authenticate(username, password)
        if (!userId) {
          return actions.response({ status: 401, body: { message: 'Invalid credentials' } })
        }

        return actions.response({ status: 200, body: { token: issueToken(userId) } })
      }
    },
    // ... other interceptors for token verification
  },
})
```

If you use the `staticFolder` setting to serve a frontend at `/` (with the API under `apiPrefix` `/api`), the login form can live in your frontend bundle and call `POST /api/login` — handled entirely by Temba as shown above.

The only thing that lives outside Temba is the logic itself: a token signing library, a user database, or an external auth service. These are just functions you bring in and call from within your interceptor.

Clients then send the issued token in the `Authorization` header with every request:

```
Authorization: Bearer <token>
```

## Accessing the token payload

If you need the decoded token payload inside the interceptor — for example to restrict access by user — you can return it from `verifyToken` and use it in your logic:

```js
function authInterceptor(request, actions) {
  const token = request.headers['authorization']?.replace('Bearer ', '')
  const payload = verifyToken(token)

  if (!payload) {
    return actions.response({ status: 401, body: { message: 'Unauthorized' } })
  }

  // Example: only allow access to resources matching the user's id
  if (request.type === 'resource' && request.resource === 'users') {
    if (request.id && request.id !== payload.sub) {
      return actions.response({ status: 403, body: { message: 'Forbidden' } })
    }
  }
}
```

## Notes

- The `Authorization` header is available on all requests via `request.headers`.
- Use `request.type` to distinguish between resource requests (`'resource'`) and non-resource requests (`'root'`, `'openapi'`, `'static'`) if you want to apply different rules — for example, to allow public access to the OpenAPI docs.
- The interceptor is **not** called for `OPTIONS` (CORS preflight) requests, so those always pass through.
