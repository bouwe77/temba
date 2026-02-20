---
id: documentation
title: Documentation
sidebar_position: 1
---

# Documentation

**Create a simple REST API with zero coding in less than 30 seconds (seriously).**

For developers that need a **quick NodeJS backend** for small projects.

**No need for any coding**, unless you want to opt-out of the defaults, or want to do more customization.

An **OpenAPI specification** is generated and enabled by default, providing **interactive documentation** and allowing you to generate client code from it.

Data is kept **in memory**, but you can also store it in a **JSON file** or **MongoDB database**.

## Table of contents

[Temba?](#temba)

[Getting Started](#getting-started)

[What Temba does](#what-temba-does)

[Usage](#usage)

[Config settings overview](#config-settings-overview)

## Temba?

> _"Temba, at REST"_

A metaphor for the declining of a gift, from the [Star Trek - The Next Generation episode "Darmok"](https://memory-alpha.fandom.com/wiki/Temba).

In the fictional Tamarian language the word _"Temba"_ means something like _"gift"_.

## Getting Started

Prerequisites you need to have:

* Node
* NPM

- Optional: A MongoDB database, either locally or in the cloud

### Use the starter with `npx`

Create your own Temba server instantly:

```
npx temba-cli create my-rest-api
```

This command will:

* Create a new folder called `my-rest-api`
* Install Temba as a dependency
* Generate a `server.js` file
* Automatically start your brand-new Temba API

You’ll see:

```
✅ Server listening on port 8362
```

Now you can send any HTTP request to any resource on localhost:8362 — and it just works.

Or head over to the interactive OpenAPI specification of your API in your browser at `/openapi`.

### Adding to an existing app

Alternatively, add Temba to your app manually:

1. `npm i temba`

2. Example code to create a Temba server:

```js
import { create } from "temba"
const server = await create()
server.start()
```

3. In your console you'll see:

```
✅ Server listening on port 8362
```

### Configuration

To opt-out or customize Temba's workings, pass a `config` object to the `create` function. Learn more in the [Usage](#usage) section, or check out the [config settings](#config-settings-overview).

## What Temba does

Out of the box, Temba gives you a CRUD REST API to any resource name you can think of.

Whether you `GET` either `/people`, `/movies`, `/pokemons`, or whatever, it all returns a `200 OK` with a `[]` JSON response. As soon as you `POST` a new resource, followed by a `GET` of that resource, the new resource will be returned. You can also `DELETE`, `PATCH`, or `PUT` resources by its ID.

For every resource (`movies` is just an example), Temba supports the following requests:

- `GET /movies` - Get all movies
- `GET /movies/:id` - Get a movie by its ID
- `POST /movies` - Create a new movie
- `POST /movies:/id` - Create a new movie specifying the ID yourself
- `PATCH /movies/:id` - Partially update a movie by its ID
- `PUT /movies/:id` - Fully replace a movie by its ID
- `DELETE /movies` - Delete all movies (if configured)
- `DELETE /movies/:id` - Delete a movie by its ID
- `HEAD /movies` - Get all movies, but without the response body
- `HEAD /movies/:id` - Get a movie by its ID, but without the response body

### Supported HTTP methods

The HTTP methods that are supported are `GET`, `POST`, `PATCH`, `PUT`, `DELETE`, and `HEAD`.

On the root URI (e.g. http://localhost:8362/) only a `GET` request is supported, which shows you a message indicating the API is working. All other HTTP methods on the root URI return a `405 Method Not Allowed` response.

### JSON

Temba supports JSON only.

Request bodies sent with a `POST`, `PATCH`, and `PUT` requests are valid when the request body is either empty, or when it's valid formatted JSON. If you send a request with invalid formatted JSON, a `400 Bad Request` response is returned.

Any valid formatted JSON is accepted and stored. If you want to validate or even change the JSON in the request bodies, check out [JSON Schema request body validation](#json-schema-request-body-validation) and the [`requestInterceptor`](#intercepting-requests).

IDs are auto generated when creating resources, unless you specify an ID in the `POST` request URL.

Providing IDs in the request body of `POST`, `PUT`, or `PATCH` requests is not allowed and will return a `400 Bad Request` response. Instead, provide the ID in the request URL. However, omitting an ID in a `PUT` or `PATCH` request URL also returns a `400 Bad Request` response.

## Usage

### Data persistency

By default data is stored in memory. This means the data is flushed when the server restarts. To persist your data, provide the `connectionString` config setting for your JSON file(s) or MongoDB database.

**How Temba determines the storage type:**

Temba inspects the `connectionString` value to decide which adapter to use:

1. **MongoDB**: Starts with `"mongodb"` → MongoDB database
2. **Single JSON file**: Ends with `".json"` → Single file for all resources
3. **Directory of JSON files**: Matches `/^[a-zA-Z0-9_-]+$/` → Folder with one file per resource
4. **Fallback**: Any other value → In-memory storage

#### JSON file

```js
const config = {
  connectionString: 'data.json',
}
const server = await create(config)
```

All resources are stored in a single JSON file with the structure:
```json
{
  "movies": [{ "id": "1", "title": "..." }, ...],
  "actors": [{ "id": "2", "name": "..." }, ...]
}
```

The file is created automatically when the first resource is added (`POST`).

To store each resource in its own JSON file, use a folder name instead:

```js
const config = {
  connectionString: 'data',
}
const server = await create(config)
```

Each resource will be saved in a separate JSON file inside the `data` folder, created on demand when data for that resource is first added. For example:
* `data/movies.json` — Contains an array of movie objects
* `data/actors.json` — Contains an array of actor objects

**Valid folder names:** Only alphanumeric characters, hyphens, and underscores are allowed (e.g., `"data"`, `"my_data"`, `"api-db"`).

#### MongoDB

```js
const config = {
  connectionString: 'mongodb://localhost:27017/myDatabase',
}
const server = await create(config)
```

For every resource you use in your requests, a collection is created in the database. However, not until you actually create a resource with a `POST`.

### OpenAPI specification

OpenAPI support in Temba is enabled by default, automatically generating both JSON and YAML specifications that accurately reflect your configured resources and settings. 

Alongside these specs, Temba serves interactive HTML documentation (i.e. Swagger UI) out of the box. 

OpenAPI support is controlled through the `openapi` setting, which accepts two forms:

* **Boolean**

  * `true` (default) enables OpenAPI support.
  * `false` disables it completely.

* **Object**

  * Supplying an object both enables OpenAPI **and** lets you customize the spec.
  * The object must adhere to the `OpenAPIObject` interface (see [openapi3-ts model](https://github.com/metadevpro/openapi3-ts/blob/71b55d772bacc58c127540b6a75d1b17a7ddadbb/src/model/openapi31.ts)).
  * Temba will deep-merge your custom specification into its default spec, preserving all auto-generated endpoints and schemas while applying your overrides.

### Allowing specific resources only

If you only want to allow specific resource names, configure them by providing a `resources` key in the config object when creating the Temba server:

```js
const config = {
  resources: ['movies', 'actors'],
}
const server = await create(config)
```

Requests on these resources only give a `404 Not Found` if the ID does not exist. Requests on any other resource will always return a `404 Not Found`.

### API prefix

With the `apiPrefix` config setting, all resources get an extra path segment in front of them. If the `apiPrefix` is `'api'`, then `/movies/12345` becomes `/api/movies/12345`:

```js
const config = {
  apiPrefix: 'api',
}
const server = await create(config)
```

Notes:

* Only alphanumeric characters are kept—special characters are stripped. For example, `apiPrefix: 'api/v1'` becomes `'apiv1'`.
* After configuring the `apiPrefix`, requests to the root URL (e.g., `http://localhost:8362/`) will return:
  * `404 Not Found` on `GET` requests
  * `405 Method Not Allowed` for any other HTTP method
* The new root becomes `/api` (or whatever your prefix is), which returns an informational page.

### Static assets

If you want to host static assets, for example a web app consuming the API, you can configure a `staticFolder`:

```js
const config = {
  staticFolder: 'build',
}
const server = await create(config)
```

With this setting, sending a `GET` request to the root URL returns the content from the `'./build'` folder in your project, for example an HTML page. Files are served relative to this folder (e.g., `/index.html` → `build/index.html`, `/css/style.css` → `build/css/style.css`).

**Automatic `apiPrefix` behavior:**

To prevent conflicts between the API resources and the web app routes, configuring a `staticFolder` **automatically sets the `apiPrefix` to `"api"`**. Of course you can always change the `apiPrefix` to something else by explicitly setting it.

**Request routing order (precedence):**

When both `staticFolder` and API routes are configured, Temba processes requests in this order:

1. **Check if the request path starts with `apiPrefix + '/'`** (e.g., `/api/`)
   * If yes → Route to API handler (resources, OpenAPI, root API page)
   * If no → Continue to step 2

2. **Check if a static file exists** in the `staticFolder`
   * If yes → Serve the static file
   * If no → Return `404 Not Found`

**Example scenarios:**

| Configuration | Request | Result |
|--------------|---------|--------|
| `staticFolder: 'build'` | `GET /` | Serves `build/index.html` (if it exists) |
| `staticFolder: 'build'` | `GET /about.html` | Serves `build/about.html` (if it exists) |
| `staticFolder: 'build'` (auto-sets `apiPrefix: 'api'`) | `GET /api/movies` | API request to `/movies` resource |
| `staticFolder: 'build'`, `apiPrefix: 'v1'` | `GET /v1/movies` | API request to `/movies` resource |
| `staticFolder: 'build'`, `apiPrefix: 'v1'` | `GET /movies` | Tries to serve `build/movies` as static file |

**Key takeaway:** Static files **never** conflict with API routes when `apiPrefix` is set, because they're checked only when the request path doesn't start with the API prefix.

### JSON Schema request body validation

By default, Temba does not validate request bodies.

This means you can store your resources in any format you like. So creating the following two (very different) _movies_ is perfectly fine:

```
POST /movies
{
    "title": "O Brother, Where Art Thou?",
    "description": "In the deep south during the 1930s, three escaped convicts search for hidden treasure while a relentless lawman pursues them."
}

POST /movies
{
    "foo": "bar",
    "baz": "boo"
}
```

You can even omit a request body when doing a `POST`, `PATCH`, or `PUT`. While this might be fine or even convenient when using Temba for prototyping, at some some point you might want to validate the request body.

With the `schema` setting, you can define a [JSON Schema](https://json-schema.org/), per resource, and per request method. Here we define that when creating or replacing a movie, the `title` is required, the `description` is optional, and we don't allow any other fields. Updating movies has the same schema, except there are no required fields:

```js
const schemaNewMovie = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
  },
  required: ['title'],
  additionalProperties: false,
}

const schemaUpdateMovie = { ...schemaNewMovie, required: [] }

const config = {
  schema: {
    movies: {
      post: schemaNewMovie,
      put: schemaNewMovie,
      patch: schemaUpdateMovie,
    },
  },
}

const server = await create(config)
```

If a request is not valid according to the schema, a `400 Bad Request` response is returned, and a message in the response body indicating the validation error.

### Intercepting requests

With the `requestInterceptor` setting you can intercept requests before Temba handles them. This lets you inspect or modify a request, or overrule Temba's response entirely — for any kind of request Temba handles.

The interceptor is organised per HTTP method (`get`, `post`, `put`, `patch`, `delete`). Each configured method callback is called when a matching request comes in, whether it targets a resource (e.g. `GET /movies`) or a non-resource route such as the API root URL, an OpenAPI endpoint, or a static file.

```js
const config = {
  requestInterceptor: {
    get: ({ type, headers, resource, id }, actions) => {
      // Called for ALL GET requests, resource and non-resource alike
    },
    post: ({ type, headers, resource, id, body }, actions) => {
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
    | { type: 'resource'; headers: IncomingHttpHeaders; resource: string; id: string | null }
    | { type: 'root' | 'openapi' | 'static'; headers: IncomingHttpHeaders },
  actions: ResourceActions | NonResourceActions
) => void | InterceptorAction | Promise<void | InterceptorAction>

// DELETE interceptor — fires for resource requests only
delete?: (
  request: { type: 'resource'; headers: IncomingHttpHeaders; resource: string; id: string | null },
  actions: ResourceActions
) => void | InterceptorAction | Promise<void | InterceptorAction>

// POST interceptor — fires for resource requests only
post?: (
  request: { type: 'resource'; headers: IncomingHttpHeaders; resource: string; id: string | null; body: object | string | Buffer | null },
  actions: ResourceActions
) => void | InterceptorAction | Promise<void | InterceptorAction>

// PUT interceptor — fires for resource requests only
put?: (
  request: { type: 'resource'; headers: IncomingHttpHeaders; resource: string; id: string; body: object | string | Buffer | null },
  actions: ResourceActions
) => void | InterceptorAction | Promise<void | InterceptorAction>

// PATCH interceptor — fires for resource requests only
patch?: (
  request: { type: 'resource'; headers: IncomingHttpHeaders; resource: string; id: string; body: object | string | Buffer | null },
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

**Examples:**

```js
const config = {
  requestInterceptor: {
    // Intercept all GET requests
    get: ({ type, resource, id, headers }, actions) => {

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

### Response body interception

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

### Caching and consistency with Etags

To optimize `GET` requests, and only send JSON over the wire when it changed, you can configure to enable Etags. Etags also prevent so-called mid-air collisions, where a client tries to update en item that has been updated by another client in the meantime:

```js
const config = {
  etags: true,
}
const server = await create(config)
```

After enabling etags, every `GET` request will return an `etag` response header, which clients can (optionally) send as an `If-None-Match` header with every subsequent `GET` request. Only if the resource changed in the meantime the server will return the new JSON, and otherwise it will return a `304 Not Modified` response with an empty response body.

For updating or deleting items with a `PUT`, `PATCH`, or `DELETE`, after enabling etags, these requests are _required_ to provide an `If-Match` header with the etag. Only if the etag represents the latest version of the resource the update is made, otherwise the server responds with a `412 Precondition Failed` status code.

## Filtering

Temba supports JSON:API style filtering on `GET` and `DELETE` collection requests by appending square-bracket operators to your field names in the query string. Every filter expression must start with the exact, lowercase `filter` prefix. For example:

`GET /items?filter.name[eq]=Alice&filter.status[neq]=archived`

You can mix dots and brackets in any combination when specifying filters (e.g. `filter.role.eq=admin`, `filter.role[eq]=admin`, `filter[role].eq=admin`, `filter[role][eq]=admin`, etc.), but the recommended—and most common—style is to put the operator between brackets:

```http
GET /users?filter.role[eq]=admin
```

Omitting the operator defaults to an `[eq]` operator, so both of these are equivalent:

```http
GET /users?filter.role=admin
GET /users?filter.role[eq]=admin
```

**Note on validation:** Unknown field names are safely ignored (returning empty results). However, malformed expressions, incorrectly cased operators (e.g., `[EQ]`), or unsupported operators will return a `400 Bad Request`.

The following operators are supported:

| Operator       | Description                                   | Example                                            |
| -------------- | --------------------------------------------- | -------------------------------------------------- |
| `[eq]`         | strict equals                                 | `?filter.name[eq]=Alice` (or `?filter.name=Alice`) |
| `[ieq]`        | case-insensitive equals                       | `?filter.name[ieq]=alice`                          |
| `[neq]`        | strict not equals                             | `?filter.status[neq]=archived`                     |
| `[ineq]`       | case-insensitive not equals                   | `?filter.status[ineq]=ARCHIVED`                    |

### WebSockets

Temba can automatically broadcast data changes to connected clients via WebSockets. 

To enable WebSocket support:

```js
const config = {
  webSocket: true,
}
```

Once enabled, the WebSocket server is available at the same host and port as your API, using the /ws path, for example: `ws://localhost:8362/ws`

Once connected, whenever a resource is changed via a `POST`, `PUT`, `PATCH`, or `DELETE` request a message will be sent.

The broadcast message is a JSON object containing the name of the resource, the type of change (`"CREATE"`, `"UPDATE"`, `"DELETE"`, or `"DELETE_ALL"`), and the updated resource object:

```json
{
  "resource": "movies",
  "action": "CREATE",
  "data": {
    "id": "123",
    "title": "O Brother, Where Art Thou?",
    "description": "In the deep south..."
  }
}
```

For a single deletion (e.g., `DELETE /movies/123`), the data object contains only the ID of the deleted item:

```json
{
  "resource": "movies",
  "action": "DELETE",
  "data": { "id": "123" }
}
```

For a collection deletion (e.g., `DELETE /movies`), the action is `"DELETE_ALL"` and the data property is omitted entirely:

```json
{
  "resource": "movies",
  "action": "DELETE_ALL"
}
```

## Config settings overview

Configuring Temba is optional, it already works out of the box.

Here is an example of the config settings for Temba, and how you define them:

```js
const config = {
  allowDeleteCollection: true,
  apiPrefix: 'api',
  connectionString: 'mongodb://localhost:27017/myDatabase',
  delay: 500,
  etags: true,
  openapi: true,
  port: 4321,
  requestInterceptor: {
    get: ({ type, headers, resource, id }) => {
      // type is 'resource', 'root', 'openapi', or 'static'
      // resource and id are only present when type === 'resource'
    },
    post: ({ type, headers, resource, id, body }) => {
      // Validate, or even change the request body
    },
    put: ({ type, headers, resource, id, body }) => {
      // Validate, or even change the request body
    },
    patch: ({ type, headers, resource, id, body }) => {
      // Validate, or even change the request body
    },
    delete: ({ type, headers, resource, id }) => {
      //...
    },
  },
  resources: ['movies', 'actors'],
  responseBodyInterceptor: ({ resource, body, id }) => {
    // Change the response body before it is sent to the client
  },
  returnNullFields: false,
  schema: {
    movies: {
      post: {
        type: 'object',
        properties: {
          title: { type: 'string' },
        },
        required: ['title'],
      },
    },
  },
  staticFolder: 'build',
  webSocket: true,
}
const server = await create(config)
```

These are all the possible settings:

| Config setting            | Description                                                                                  | Default value |
| :------------------------ | :------------------------------------------------------------------------------------------- | :------------ |
| `allowDeleteCollection`   | Whether a `DELETE` request on a collection is allowed to delete all items.                   | `false`       |
| `apiPrefix`               | See [API prefix](#api-prefix)                                                                | `null`        |
| `connectionString`        | See [Data persistency](#data-persistency)                                                    | `null`        |
| `delay`                   | The delay, in milliseconds, after processing the request before sending the response.        | `0`           |
| `etags`                   | See [Caching and consistency with Etags](#caching-and-consistency-with-etags)                | `false`       |
| `openapi`                 | Enable or disable OpenAPI, or supply your custom spec object to merge into the default spec. | `true`        |
| `port`                    | The port your Temba server listens on                                                        | `8362`        |
| `requestInterceptor`      | See [Intercepting requests](#intercepting-requests)                                          | `null`        |
| `resources`               | See [Allowing specific resources only](#allowing-specific-resources-only)                    | `[]`          |
| `responseBodyInterceptor` | See [Response body interception](#response-body-interception)                                | `null`        |
| `returnNullFields`        | Whether fields with a null value should be returned in responses.                            | `true`        |
| `schema`                  | See [JSON Schema request body validation](#json-schema-request-body-validation)              | `null`        |
| `staticFolder`            | See [Static assets](#static-assets)                                                          | `null`        |
| `webSocket`               | See [WebSockets](#websockets)                                                                | `false`       |

## Under the hood

Temba is built with TypeScript, [Node](https://nodejs.org), [Vitest](https://vitest.dev/), [Supertest](https://www.npmjs.com/package/supertest), [@rakered/mongo](https://www.npmjs.com/package/@rakered/mongo), and [lowdb](https://www.npmjs.com/package/lowdb).

# License

MIT, see [LICENSE](https://github.com/bouwe77/temba/blob/main/LICENSE).