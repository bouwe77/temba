# Temba

[![Temba on NPM](https://img.shields.io/npm/v/temba)](https://www.npmjs.com/package/temba)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

**Get a simple REST API with zero coding in less than 30 seconds (seriously).**

For developers that need a quick NodeJS backend for small projects.

No need for any coding, unless you want to opt-out of the defaults, or want to do more customization.

Data is kept in memory, but you can also store it in a JSON file or MongoDB database.

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

Create your own Temba server with the following command and you are up and running!

```bash
npx create-temba-server@latest my-rest-api
cd my-rest-api
npm start
```

This command clones the [Temba-starter](https://github.com/bouwe77/temba-starter) repository, installs all dependencies, and starts the server.

Once the server is running, you can issue any HTTP request, and it probably will just work, but [learn more here](#what-temba-does).

### Adding to an existing app

Alternatively, add Temba to your app manually:

1. `npm i temba`

2. Example code to create a Temba server:

```js
import temba from 'temba'
const server = temba.create()
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
- `PATCH /movies/:id` - Partially update a movie by its ID
- `PUT /movies/:id` - Fully replace a movie by its ID
- `DELETE /movies` - Delete all movies
- `DELETE /movies/:id` - Delete a movie by its ID
- `HEAD /movies` - Get all movies, but without the response body
- `HEAD /movies/:id` - Get a movie by its ID, but without the response body

### Supported HTTP methods

The HTTP methods that are supported are `GET`, `POST`, `PATCH`, `PUT`, `DELETE`, and `HEAD`.

On the root URI (e.g. http://localhost:8080/) only a `GET` request is supported, which shows you a message indicating the API is working. All other HTTP methods on the root URI return a `405 Method Not Allowed` response.

The `OPTIONS` method also works, but because Temba uses Express' default implementation for that, the `Access-Control-Allow-Methods` response header might not always be correct.

### JSON

Temba supports JSON only.

Request bodies sent with a `POST`, `PATCH`, and `PUT` requests are valid when the request body is either empty, or when it's valid formatted JSON. Adding a `Content-Type: application/json` header is required. If you send a request with invalid formatted JSON, a `400 Bad Request` response is returned.

Any valid formatted JSON is accepted and stored. If you want to validate or even change the JSON in the request bodies, check out [JSON Schema request body validation](#json-schema-request-body-validation) and the [`requestBodyInterceptor`](#request-body-validation-or-mutation).

IDs are auto generated when creating resources. IDs in the JSON request body are always ignored.

## Usage

### Data persistency

By default data is stored in memory. This means the data is flushed when the server restarts. To persist your data, provide the `connectionString` config setting for your JSON file or MongoDB database.

#### JSON file

```js
const config = {
  connectionString: 'data.json',
}
const server = temba.create(config)
```

All resources are saved in a single JSON file. The file is not created or updated unless you create, update, or delete resources.

#### MongoDB

```js
const config = {
  connectionString: 'mongodb://localhost:27017',
}
const server = temba.create(config)
```

For every resource you use in your requests, a collection is created in the database. However, not until you actually create a resource with a `POST`.

### Allowing specific resources only

If you only want to allow specific resource names, configure them by providing a `resources` key in the config object when creating the Temba server:

```js
const config = {
  resources: ['movies', 'actors'],
}
const server = temba.create(config)
```

Requests on these resources only give a `404 Not Found` if the ID does not exist. Requests on any other resource will always return a `404 Not Found`.

### Static assets

If you want to host static assets, for example next to the API, a web app consuming it, you can configure a `staticFolder`:

```js
const config = {
  staticFolder: 'build',
}
const server = temba.create(config)
```

With this setting, sending a `GET` request to the root URL, returns the content that is in the `'./build'` folder in your project.

Without configuring a `staticFolder`, a `GET` to the root URL returns `"It works! ツ"`. When the `staticFolder` is configured, it returns whatever is in the `build` folder in your project, for example an HTML page.

However, this might cause conflicts between the API resources and the web app routes: If the web app in the `build` folder has a route to `/products`, but there is also a `/products` API resource, the web app route is returned.

To be able to still access the `/products` API resource, configure an `apiPrefix`:

### API prefix

With the `apiPrefix` config setting, all resources get an extra path segment in front of them. If the `apiPrefix` is `'api'`, then `/movies/12345` becomes `/api/movies/12345`:

```js
const config = {
  apiPrefix: 'api',
}
const server = temba.create(config)
```

A request to the `apiPrefix` (e.g. http://localhost:1234/api) will now return the `"It works! ツ"` response message.

After configuring the `apiPrefix`, requests to the root URL (e.g. http://localhost:1234/), instead of the `"It works! ツ"` response message, will now either return a `404 Not Found` on `GET` requests, or a `405 Method Not Allowed` for all other HTTP methods.

However, if you configured both an `apiPrefix` and a `staticFolder`, a `GET` on the root URL will return the content in the `staticFolder`.

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

const server = temba.create(config)
```

If a request is not valid according to the schema, a `400 Bad Request` response is returned, and a message in the response body indicating the validation error.

### Intercepting requests

In addition to (or instead of) validating the request using JSON Schema, you can also intercept the request body before it is persisted, using the `requestBodyInterceptor` setting.

It allows you to implement your own validation, or even change the request body.

```js
const config = {
  requestBodyInterceptor: {
    post: ({ resource, body }) => {
      // Validate, or even change the request body
    },
    put: ({ resource, body }) => {
      // Validate, or even change the request body
    },
    patch: ({ resource, body }) => {
      // Validate, or even change the request body
    },
  },
}

const server = temba.create(config)
```

The `requestBodyInterceptor` is an object with a `post`, and/or `patch`, and/or `put` field, which contains the callback function you want Temba to call before the JSON is persisted.

The callback function receives an object containing the `resource`, which for example is `movies` if you request `POST /movies`, and the `body`, which is the JSON object of the request body.

Your callback function can return the following things:

- `void`: Temba will just save the request body as-is. An example of this is when you have validated the request body and everything looks fine.
- `string`: If you return a string Temba will return a `400 Bad Request` with the string as error message.
- `object`: Return an object if you want to change the request body. Temba will save the returned object instead of the original request body.

Example:

```js
const config = {
  requestBodyInterceptor: {
    post: ({ resource, body }) => {
      // Do not allow Pokemons to be created: 400 Bad Request
      if (resource === 'pokemons') return 'You are not allowed to create new Pokemons'

      // Add a genre to Star Trek films:
      if (resource === 'movies' && body.title.startsWith('Star Trek'))
        return { ...body, genre: 'Science Fiction' }

      // If you end up here, void will be returned, so the request will just be saved.
    },
  },
}

const server = temba.create(config)
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

const server = temba.create(config)
```

`responseBodyInterceptor` is a callback function that provides an object containing the `resource`, `body`, and the `id`. Depending on whether it's a collection or item request, the `body` is either an array or object, and the `id` can be `undefined`.

In the example above we check for the `id` being defined, but a runtime check to determine the type of `body` would also suffice.

Whatever you return in this function will become the response body and will be serialized as JSON and returned to the client.

If you don't return anything, the response body will be sent as-is.

The `responseBodyInterceptor` will only be called when the response was successful, i.e. a `200 OK` status code.

### Custom router

Because Temba uses Express under the hood, you can create an Express router, and configure it as a `customRouter`:

```js
// Example code of how to create an Express router, from the official Express docs at https://expressjs.com/en/guide/routing.html:
const express = require('express')
const router = express.Router()

// middleware that is specific to this router
router.use((req, res, next) => {
  console.log('Time: ', Date.now())
  next()
})
// define the home page route
router.get('/', (req, res) => {
  res.send('Birds home page')
})
// define the about route
router.get('/about', (req, res) => {
  res.send('About birds')
})

// Add the custom router to Temba config
const config = {
  customRouter: router,
}

const server = temba.create(config)
```

> 💁 Don't overuse `customRouter`, as it defeats the purpose of Temba being a simple out-of-the-box solution.

A `customRouter` can only overrule resource routes. The root URL (with or without `staticFolder`) will always be handled by Temba.

So for the following router and config:

```
router.get('/', (req, res) => {
  res.send('Birds home page')
})
router.get('/stuff', (req, res) => {
  res.send('Some stuff')
})
router.get('api/stuff', (req, res) => {
  res.send('Some API stuff')
})

const config = {
  apiPrefix: 'api',
  customRouter: router,
  resources: ['stuff'],
  staticFolder: 'build',
}
const server = temba.create(config)
```

- `/` will be handled by Temba, and will return the `staticFolder` (`build`) folder contents
- `/stuff` and `/api/stuff` will be handled by the custom router
- `/movies` will return a `404 Not Found`, because of `apiPrefix`
- `/api/movies` will return movies, handled by Temba

## Config settings overview

Configuring Temba is optional, it already works out of the box.

Here is an example of the config settings for Temba, and how you define them:

```js
const config = {
  apiPrefix: 'api',
  cacheControl: 'public, max-age=300',
  connectionString: 'mongodb://localhost:27017',
  customRouter: router,
  delay: 500,
  port: 4321,
  requestBodyInterceptor: {
    post: ({ resource, body }) => {
      // Validate, or even change the request body
    },
    patch: ({ resource, body }) => {
      // Validate, or even change the request body
    },
    put: ({ resource, body }) => {
      // Validate, or even change the request body
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
const server = temba.create(config)
```

These are all the possible settings:

| Config setting            | Description                                                                                | Default value |
| :------------------------ | :----------------------------------------------------------------------------------------- | :------------ |
| `apiPrefix`               | See [API prefix](#api-prefix)                                                              | `null`        |
| `cacheControl`            | The `Cache-control` response header value for each GET request.                            | `'no-store'`  |
| `connectionString`        | See [Data persistency](#data-persistency)                                                                    | `null`        |
| `customRouter`            | See [Custom router](#custom-router)                                                        | `null`        |
| `delay`                   | After processing the request, the delay in milliseconds before the response should be sent. | `0`           |
| `port`                    | The port your Temba server listens on                                                      | `3000`        |
| `requestBodyInterceptor`  | See [Request body validation or mutation](#request-body-validation-or-mutation)            | `noop`        |
| `resources`               | See [Allowing specific resources only](#allowing-specific-resources-only)                  | `[]`          |
| `responseBodyInterceptor` | See [Response body interception](#request-body-validation-or-mutation)                     | `noop`        |
| `returnNullFields`        | Whether fields with a `null` value should be returned in responses.                        | `true`        |
| `schema`                  | See [JSON Schema request body validation](#json-schema-request-body-validation)                                                                                         | `null`        |
| `staticFolder`            | See [Static assets](#static-assets)                                                        | `null`        |

## Roadmap

Although I won't promise if and when, these are some things to consider for the future:

- **Authorization bearer tokens**, probably by providing a callback function so you can check the token however you want.

- Better **security**, for example CORS, CSRF, etc.

- Opt-in logging with debug-js events

- Generic **filtering and sorting**, for example: `GET /api/movies?filter=releaseYear ge 1980 and releaseYear le 1989&sort=-releaseYear,title&page=2&limit=20&fields=title,releaseYear,genre`

- Intial data seed when using in-memory.

## Under the hood

Temba is built with TypeScript, [Node](https://nodejs.org), [Express](https://expressjs.com/), [Vitest](https://vitest.dev/), [Supertest](https://www.npmjs.com/package/supertest), [@rakered/mongo](https://www.npmjs.com/package/@rakered/mongo), and [lowdb](https://www.npmjs.com/package/lowdb).

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://bouwe.io"><img src="https://avatars.githubusercontent.com/u/4126793?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Bouwe K. Westerdijk</b></sub></a><br /><a href="https://github.com/bouwe77/temba/commits?author=bouwe77" title="Code">💻</a> <a href="https://github.com/bouwe77/temba/issues?q=author%3Abouwe77" title="Bug reports">🐛</a> <a href="https://github.com/bouwe77/temba/commits?author=bouwe77" title="Documentation">📖</a> <a href="#ideas-bouwe77" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/bouwe77/temba/commits?author=bouwe77" title="Tests">⚠️</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
