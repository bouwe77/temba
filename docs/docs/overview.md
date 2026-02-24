---
id: overview
title: Overview
sidebar_position: 2
---

# Overview

**Create a simple REST API with zero coding in less than 30 seconds (seriously).**

For developers that need a **quick NodeJS backend** for small projects.

**No need for any coding**, unless you want to opt-out of the defaults, or want to do more customization.

An **OpenAPI specification** is generated and enabled by default, providing **interactive documentation** and allowing you to generate client code from it.

Data is kept **in memory**, but you can also store it in a **JSON file** or **MongoDB database**.

## Temba?

> _"Temba, at REST"_

A metaphor for the declining of a gift, from the [Star Trek - The Next Generation episode "Darmok"](https://memory-alpha.fandom.com/wiki/Temba).

In the fictional Tamarian language the word _"Temba"_ means something like _"gift"_.

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

Any valid formatted JSON is accepted and stored. If you want to validate or even change the JSON in the request bodies, check out [JSON Schema request body validation](/docs/schema-validation) and the [`requestInterceptor`](/docs/request-interceptor).

IDs are auto generated when creating resources, unless you specify an ID in the `POST` request URL.

Providing IDs in the request body of `POST`, `PUT`, or `PATCH` requests is not allowed and will return a `400 Bad Request` response. Instead, provide the ID in the request URL. However, omitting an ID in a `PUT` or `PATCH` request URL also returns a `400 Bad Request` response.

## Config settings overview

Configuring Temba is optional, it already works out of the box.

Here is an example of the config settings for Temba, and how you define them:

```js
const config = {
  allowDeleteCollection: true,
  apiPrefix: 'api',
  connectionString: 'mongodb://localhost:27017/myDatabase',
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
| `apiPrefix`               | See [API prefix](/docs/api-prefix)                                                           | `null`        |
| `connectionString`        | See [Data persistency](/docs/data-persistency)                                               | `null`        |
| `etags`                   | See [Caching and consistency with Etags](/docs/etags)                                        | `false`       |
| `openapi`                 | Enable or disable OpenAPI, or supply your custom spec object to merge into the default spec. | `true`        |
| `port`                    | The port your Temba server listens on                                                        | `8362`        |
| `requestInterceptor`      | See [Intercepting requests](/docs/request-interceptor)                                       | `null`        |
| `resources`               | See [Allowing specific resources only](/docs/resources)                                      | `[]`          |
| `responseBodyInterceptor` | See [Response body interception](/docs/response-interceptor)                                 | `null`        |
| `returnNullFields`        | Whether fields with a null value should be returned in responses.                            | `true`        |
| `schema`                  | See [JSON Schema request body validation](/docs/schema-validation)                           | `null`        |
| `staticFolder`            | See [Static assets](/docs/static-assets)                                                     | `null`        |
| `webSocket`               | See [WebSockets](/docs/websockets)                                                           | `false`       |

## Under the hood

Temba is built with TypeScript, [Node](https://nodejs.org), [Vitest](https://vitest.dev/), [Supertest](https://www.npmjs.com/package/supertest), [@rakered/mongo](https://www.npmjs.com/package/@rakered/mongo), and [lowdb](https://www.npmjs.com/package/lowdb).

# License

MIT, see [LICENSE](https://github.com/bouwe77/temba/blob/main/LICENSE).