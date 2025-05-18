---
id: documentation
title: Documentation
sidebar_position: 2
---

# Documentation

**Create a simple REST API with zero coding in less than 30 seconds (seriously).**

For developers that need a **quick NodeJS backend** for small projects.

**No need for any coding**, unless you want to opt-out of the defaults, or want to do more customization.

An **OpenAPI specification** is generated and enabled by default, providing **interactive documentation** and allowing you to generate client code from it.

Data is kept **in memory**, but you can also store it in a **JSON file** or **MongoDB database**.

## Table of contents

[Temba?](#temba-1)

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
✅ Server listening on port 3000
```

Now you can send any HTTP request to any resource on localhost:3000 — and it just works.

Or headover to the interactive OpenAPI specification of your API in your browser at `/openapi`.

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
✅ Server listening on port 3000
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

On the root URI (e.g. http://localhost:8080/) only a `GET` request is supported, which shows you a message indicating the API is working. All other HTTP methods on the root URI return a `405 Method Not Allowed` response.

### JSON

Temba supports JSON only.

Request bodies sent with a `POST`, `PATCH`, and `PUT` requests are valid when the request body is either empty, or when it's valid formatted JSON. If you send a request with invalid formatted JSON, a `400 Bad Request` response is returned.

Any valid formatted JSON is accepted and stored. If you want to validate or even change the JSON in the request bodies, check out [JSON Schema request body validation](#json-schema-request-body-validation) and the [`requestInterceptor`](#request-validation-or-mutation).

IDs are auto generated when creating resources, unless you specify an ID in the `POST` request URL.

Providing IDs in the request body of `POST`, `PUT`, or `PATCH` requests is not allowed and will return a `400 Bad Request` response. Instead, provide the ID in the request URL. However, omitting an ID in a `PUT` or `PATCH` request URL also returns a `400 Bad Request` response.

## Usage

### Data persistency

By default data is stored in memory. This means the data is flushed when the server restarts. To persist your data, provide the `connectionString` config setting for your JSON file or MongoDB database.

#### JSON file

```js
const config = {
  connectionString: 'data.json',
}
const server = await create(config)
```

All resources are saved in a single JSON file. The file is not created or updated unless you create, update, or delete resources.

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

After configuring the `apiPrefix`, requests to the root URL (e.g. http://localhost:1234/), will now either return a `404 Not Found` on `GET` requests, or a `405 Method Not Allowed` for any other HTTP method.

### Static assets

If you want to host static assets, for example a web app consuming the API, you can configure a `staticFolder`:

```js
const config = {
  staticFolder: 'build',
}
const server = await create(config)
```

With this setting, sending a `GET` request to the root URL, returns the content that is in the `'./build'` folder in your project, for example an HTML page.

To prevent conflicts between the API resources and the web app routes, configuring a `staticFolder` also automatically sets the `apiPrefix` to "`api"`. Of course you can always change the `apiPrefix` to something else.

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

In addition to (or instead of) validating the request using JSON Schema, you can also intercept the request before it is persisted, using the `requestInterceptor` setting.

It allows you to implement your own validation, or even change the request body.

```js
const config = {
  requestInterceptor: {
    get: ({ headers, resource, id }) => {
      //...
    },
    post: ({ headers, resource, id, body }) => {
      // Validate, or even change the request body
    },
    put: ({ headers, resource, id, body }) => {
      // Validate, or even change the request body
    },
    patch: ({ headers, resource, id, body }) => {
      // Validate, or even change the request body
    },
    delete: ({ headers, resource, id }) => {
      //...
    },
  },
}

const server = await create(config)
```

The `requestInterceptor` is an object with fields for each of the HTTP methods you might want to intercept, and the callback function you want Temba to call, before processing the request, i.e. going to the database.

Each callback function receives an object containing the request headers and the `resource` (e.g. `"movies"`). Depending on the HTTP method, also the `id` from the URL, and the request `body` are provided. `body` is a JSON object of the request body.

> Request headers are not used by Temba internally when processing requests, so they are only passed into the `requestInterceptor` callback so you can do your own custom header validation.

Your callback function can return the following things:

- `void`: Temba will just save the request body as-is. An example of this is when you have validated the request body and everything looks fine.
- `object`: Return an object if you want to change the request body. Temba will save the returned object instead of the original request body.
- Throw an `Error` if you want to stop processing the request any further and return a `500 Internal Server Error` response. Or throw the custom `TembaError` to provide a status code.

Example:

```js
const config = {
  requestInterceptor: {
    post: ({ headers, resource, id, body }) => {      
      // Add a genre to Star Trek films:
      if (resource === 'movies' && body.title.startsWith('Star Trek'))
        return { ...body, genre: 'Science Fiction' }

      // Throw a regular error for a 500 Internal Server Error status code
      if (resource === 'foobar') {
        throw new Error('Something went foobar')
      }

      // Throw a custom error to specify the status code
      if (resource === 'pokemons') {
        throw new TembaError('You are not allowed to create new Pokemons', 400)
      }

      // If you don't return anything, the original request will just be used.
    },
  },
}

const server = await create(config)
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

`responseBodyInterceptor` is a callback function that provides an object containing the `resource`, `body`, and the `id`. Depending on whether it's a collection or item request, the `body` is either an array or object, and the `id` can be `undefined`.

In the example above we check for the `id` being defined, but a runtime check to determine the type of `body` would also suffice.

Whatever you return in this function will become the response body and will be serialized as JSON and returned to the client.

If you don't return anything, the response body will be sent as-is.

The `responseBodyInterceptor` will only be called when the response was successful, i.e. a `200 OK` status code.

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
    get: ({ headers, resource, id }) => {
      //...
    },
    post: ({ headers, resource, id, body }) => {
      // Validate, or even change the request body
    },
    put: ({ headers, resource, id, body }) => {
      // Validate, or even change the request body
    },
    patch: ({ headers, resource, id, body }) => {
      // Validate, or even change the request body
    },
    delete: ({ headers, resource, id }) => {
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
}
const server = await create(config)
```

These are all the possible settings:

| Config setting            | Description                                                                                  | Default value    |
| :------------------------ | :------------------------------------------------------------------------------------------- | :--------------- |
| `allowDeleteCollection`   | Whether a `DELETE` request on a collection is allowed to delete all items.                   | `false`          |
| `apiPrefix`               | See [API prefix](#api-prefix)                                                                | `null` | `'api'` |
| `connectionString`        | See [Data persistency](#data-persistency)                                                    | `null`           |
| `delay`                   | The delay, in milliseconds, after processing the request before sending the response.        | `0`              |
| `etags`                   | See [Caching and consistency with Etags](#caching-and-consistency-with-etags)                | `false`          |
| `openapi`                 | Enable or disable OpenAPI, or supply your custom spec object to merge into the default spec. | `true`           |
| `port`                    | The port your Temba server listens on                                                        | `3000`           |
| `requestInterceptor`      | See [Request validation or mutation](#request-validation-or-mutation)                        | `noop`           |
| `resources`               | See [Allowing specific resources only](#allowing-specific-resources-only)                    | `[]`             |
| `responseBodyInterceptor` | See [Response body interception](#response-body-interception)                                | `noop`           |
| `returnNullFields`        | Whether fields with a null value should be returned in responses.                            | `true`           |
| `schema`                  | See [JSON Schema request body validation](#json-schema-request-body-validation)              | `null`           |
| `staticFolder`            | See [Static assets](#static-assets)                                                          | `null`           |

## Under the hood

Temba is built with TypeScript, [Node](https://nodejs.org), [Vitest](https://vitest.dev/), [Supertest](https://www.npmjs.com/package/supertest), [@rakered/mongo](https://www.npmjs.com/package/@rakered/mongo), and [lowdb](https://www.npmjs.com/package/lowdb).

# License

MIT, see [LICENSE](https://github.com/bouwe77/temba/blob/main/LICENSE).