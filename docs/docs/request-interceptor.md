---
id: request-interceptor
title: Intercepting requests
sidebar_label: Request interception
sidebar_position: 7
---

# Intercepting requests

With the `requestInterceptor` setting you can intercept requests before Temba handles them. This lets you inspect or modify a request, or overrule Temba's response entirely — for any kind of request Temba handles.

The interceptor is organised per HTTP method (`get`, `post`, `put`, `patch`, `delete`). Each configured method callback is called when a matching request comes in, whether it targets a resource (e.g. `GET /movies`) or a non-resource route such as the API root URL, an OpenAPI endpoint, or a static file.

```js
const config = {
  requestInterceptor: {
    get: ({ type, headers, url, resource, id }, actions) => {
      // Called for ALL GET requests, resource and non-resource alike
    },
    post: ({ type, headers, url, resource, id, body }, actions) => {
      // Called for POST requests to resources
    },
  },
}

const server = await create(config)
```

**The `type` discriminator:**

Every request object has a `type` field indicating what kind of request is being intercepted: `'resource'`, `'root'`, `'openapi'`, or `'static'`. Use it to branch your logic and determine which other fields are available.

**Function Signatures:**

Each interceptor method receives two parameters:

1. **Request object** — properties vary by method and request type
2. **Actions object** — for returning instructions

```typescript
// GET interceptor — fires for resource and non-resource requests
get?: (
  request:
    | { type: 'resource'; headers: IncomingHttpHeaders; url: string; resource: string; id: string | null }
    | { type: 'root' | 'openapi' | 'static'; headers: IncomingHttpHeaders; url: string },
  actions: ResourceActions | NonResourceActions
) => void | InterceptorAction | Promise<void | InterceptorAction>

// DELETE interceptor — fires for resource requests only
delete?: (
  request: { type: 'resource'; headers: IncomingHttpHeaders; url: string; resource: string; id: string | null },
  actions: ResourceActions
) => void | InterceptorAction | Promise<void | InterceptorAction>

// POST interceptor — fires for resource requests only
post?: (
  request: { type: 'resource'; headers: IncomingHttpHeaders; url: string; resource: string; id: string | null; body: object | string | Buffer | null },
  actions: ResourceActions
) => void | InterceptorAction | Promise<void | InterceptorAction>

// PUT interceptor — fires for resource requests only
put?: (
  request: { type: 'resource'; headers: IncomingHttpHeaders; url: string; resource: string; id: string; body: object | string | Buffer | null },
  actions: ResourceActions
) => void | InterceptorAction | Promise<void | InterceptorAction>

// PATCH interceptor — fires for resource requests only
patch?: (
  request: { type: 'resource'; headers: IncomingHttpHeaders; url: string; resource: string; id: string; body: object | string | Buffer | null },
  actions: ResourceActions
) => void | InterceptorAction | Promise<void | InterceptorAction>
```

**Actions API:**

The available actions depend on the request type. For resource requests, both actions are available. For non-resource requests (when `type` is `'root'`, `'openapi'`, or `'static'`), only `response` is available — `setRequestBody` does not apply because there is nothing to persist.

After checking `request.type`, TypeScript will narrow the `actions` type accordingly.

```typescript
// Available for resource requests
type ResourceActions = {
  // Modify the request body before it's saved
  setRequestBody: (body: unknown) => SetRequestBodyAction
  // Return a custom response, bypassing normal Temba processing
  response: (options?: { body?: unknown; status?: number }) => ResponseAction
}

// Available for non-resource requests (root, openapi, static)
type NonResourceActions = {
  // Return a custom response, bypassing normal Temba processing
  response: (options?: { body?: unknown; status?: number }) => ResponseAction
}
```

**Return Values:**

* **`void` or no return:** Temba continues with normal processing
* **`actions.setRequestBody(newBody)`:** The modified body is saved (resource requests only)
* **`actions.response({ body, status })`:** Temba skips normal processing and sends your response immediately

**Important Notes:**

* All interceptor functions can be **async** (return a Promise)
* Non-resource requests (`'root'`, `'openapi'`, `'static'`) only ever appear in the `get` callback, because those routes only support `GET` — other methods return `405 Method Not Allowed` before the interceptor is called
* The interceptor is **not** called for WebSocket upgrade requests or OPTIONS (CORS preflight) requests
* For resource requests, the interceptor runs **before** JSON Schema validation (if configured)
* The `body` parameter is the parsed JSON request body
* The `url` field is the full request URL including protocol, host, path, and query string — e.g. `http://localhost:3000/movies/123?genre=sci-fi`

**Examples:**

```js
const config = {
  requestInterceptor: {
    // Intercept all GET requests
    get: ({ type, resource, id, headers, url }, actions) => {

      // Branch on type to handle resource vs non-resource requests
      if (type === 'resource') {
        // resource and id are available here
        if (resource === 'movies' && id === null) {
          // e.g. do something specific for GET /movies
        }
      } else {
        // type is 'root', 'openapi', or 'static'
        // Only actions.response() is available here
        if (type === 'openapi') {
          // e.g. do something specific for GET /openapi.json etc.
        }
      }
    },

    post: ({ resource, body }, actions) => {

      // 1. Update the request body
      // Add a genre to Star Trek films before saving
      if (resource === 'movies' && body.title.startsWith('Star Trek')) {
        const newBody = { ...body, genre: 'Science Fiction' }
        return actions.setRequestBody(newBody)
      }

      // 2. Overrule the processing
      // Return a 400 Bad Request for Pokemons
      if (resource === 'pokemons') {
        return actions.response({ 
          status: 400, 
          body: { error: 'You are not allowed to create new Pokemons' } 
        })
      }

      // 3. Continue as-is
      // If you don't return anything, the original request will just be used.
    },
  },
}
```
