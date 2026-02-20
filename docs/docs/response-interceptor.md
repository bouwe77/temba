---
id: response-interceptor
title: Response body interception
sidebar_label: Response interception
sidebar_position: 8
---

# Response body interception

To change the response body of a `GET` request, before it's being sent to the client, configure a `responseBodyInterceptor`, and return the updated response body:

```js
const config = {
  responseBodyInterceptor: ({ resource, body, id }) => {
    if (resource === 'movies') {
      if (id) {
        // response body is an object
        return {
          ...body,
          stuff: 'more stuff',
        }
      } else {
        // response body is an array
        return body.map((x) => ({
          ...x,
          stuff: 'more stuff',
        }))
      }
    }

    // If you end up here, the response body will just be returned unchanged.
  },
}

const server = await create(config)
```

**Function Signature:**

```typescript
responseBodyInterceptor?: (
  info: 
    | { resource: string; body: Item; id: string }      // Single item GET request
    | { resource: string; body: Item[] }                 // Collection GET request
) => unknown | Promise<unknown>

// Where Item is:
type Item = {
  id: string
  [key: string]: unknown
}
```

**Parameters:**

* **`resource`**: The name of the resource (e.g., `"movies"`)
* **`body`**: The data retrieved from the database
  * For **single item** requests (`GET /movies/123`): An object with `id` and other fields
  * For **collection** requests (`GET /movies`): An array of objects
* **`id`**: Present **only** for single item requests (e.g., `"123"`)

**Return Value:**

* Return the modified body (object or array). This will be JSON-stringified and sent to the client.
* If you return `undefined` or nothing, the original body is sent unchanged.

**Important Notes:**

* The interceptor is called **only for successful responses** (HTTP 200 OK)
* The `body` parameter is the actual data object from the database.
* The function can be **async** (return a Promise)
* You can differentiate between single-item and collection requests by checking for the presence of `id` or by checking `Array.isArray(body)`

**Example with Type Safety:**

```js
const config = {
  responseBodyInterceptor: ({ resource, body, id }) => {
    if (resource === 'movies') {
      // Type-safe check for single vs collection
      if (Array.isArray(body)) {
        // Collection: add computed field to each item
        return body.map((movie) => ({
          ...movie,
          displayTitle: `${movie.title} (${movie.year})`,
        }))
      } else {
        // Single item: add computed field
        return {
          ...body,
          displayTitle: `${body.title} (${body.year})`,
        }
      }
    }
    
    // Return undefined to use original body for other resources
  },
}
```
