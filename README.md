# Temba

[![Temba on NPM](https://img.shields.io/npm/v/temba)](https://www.npmjs.com/package/temba)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

**Get a simple MongoDB REST API with zero coding in less than 30 seconds (seriously).**

For developers who need a quick backend for small projects.

Powered by NodeJS, Express and MongoDB.

This project is inspired by the fantastic [json-server](https://github.com/typicode/json-server) project, but instead of a JSON file Temba uses a real database. The goal, however, is the same: Get you started with a REST API very quickly.

## Table of contents

[Temba?](#temba-1)

[Getting Started](#getting-started)

[What Temba does](#what-temba-does)

[Usage](#usage)

## Temba?

> _"Temba, at rest"_

A metaphor for the declining of a gift, from the [Star Trek - The Next Generation, episode "Darmok"](https://memory-alpha.fandom.com/wiki/Temba).

In the fictional Tamarian language the word _"Temba"_ means something like _"gift"_.

## Getting Started

Prerequisites you need to have:

- Node, NPM
- Optional: A MongoDB database, either locally or in the cloud

> Wthout a database, Temba also works. However, then data is kept in memory and flushed every time the server restarts.

### Use the starter with `npx`

Create your own Temba server with the following command and you are up and running!

```bash
npx create-temba-server my-rest-api
```

This command clones the [Temba-starter](https://github.com/bouwe77/temba-starter) repository and installs all dependencies.

### Manually adding to an existing app

Alternatively, add Temba to your app manually:

1. `npm i temba`

2. Example code to create a Temba server:

```js
import temba from ("temba");
const server = temba.create();

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Temba is running on port ${port}`);
});
```

### Configuration

By passing a config object to the `create` function you can customize Temba's behavior. Refer to the [config settings](#config-settings-overview) below for the various possibilities.

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

### Supported HTTP methods

The HTTP methods that are supported are `GET`, `POST`, `PATCH`, `PUT` and `DELETE`.

On the root URI (e.g. http://localhost:8080/) only a `GET` request is supported, which shows you a message indicating the API is working. All other HTTP methods on the root URI return a `405 Method Not Allowed` response.

### JSON

Temba supports JSON only.

Request bodies sent with a `POST`, `PATCH`, and `PUT` requests are valid when the request body is either empty, or when it's valid formatted JSON. Adding a `Content-Type: application/json` header is required. If you send a request with invalid formatted JSON, a `400 Bad Request` response is returned.

Any valid formatted JSON is accepted and stored. If you want to validate or even change the JSON in the request bodies, check out the [`requestBodyValidator`](#request-body-validation-or-mutation) callbacks.

IDs are auto generated when creating resources. IDs in the JSON request body are ignored for any request.

## Usage

### In-memory or MongoDB

By default data is stored in memory. This means the data is flushed when the server restarts. To persist your data, provide the `connectionString` config setting for your MongoDB database:

```js
const config = {
  connectionString: 'mongodb://localhost:27017',
}
const server = temba.create(config)
```

For every resource you use in your requests, a collection is created in the database. However, not until you actually store (create) a resource with a `POST`.

### Allowing specific resources only

If you only want to allow specific resource names, configure them by providing a `resourceNames` key in the config object when creating the Temba server:

```js
const config = { resourceNames: ['movies', 'actors'] }
const server = temba.create(config)
```

Requests on these resources only give a `404 Not Found` if the ID does not exist. Requests on any other resource will always return a `404 Not Found`.

### Static assets

If you want to host static assets next to the REST API, configure the `staticFolder`:

```js
const config = { staticFolder: 'build' }
const server = temba.create(config)
```

This way, you could create a REST API, and the web app consuming it, in one project.

However, to avoid possible conflicts between the API resources and the web app routes you might want to add an `apiPrefix` to the REST API:

### REST URIs prefixes

With the `apiPrefix` config setting, all REST resources get an extra path segment in front of them. If the `apiPrefix` is `'api'`, then `/movies/12345` becomes `/api/movies/12345`:

```js
const config = { apiPrefix: 'api' }
const server = temba.create(config)
```

After configuring the `apiPrefix`, requests to the root URL will either return a `404 Not Found` or a `405 Method Not Allowed`, depending on the HTTP method.

If you have configured both an `apiPrefix` and a `staticFolder`, a `GET` on the root URL will return the `index.html` in the `staticFolder`, if there is one.

### Request body validation or mutation

Temba does not validate request bodies.

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

You can even omit a request body when doing a `POST`, `PATCH`, or `PUT`. If you don't want that, and want to have proper validation, use the `requestBodyValidator` config setting:

```js
const config = {
  requestBodyValidator: {
    post: (resourceName, requestBody) => {
      // Validate, or even change the requestBody
    },
    put: (resourceName, requestBody) => {
      // Validate, or even change the requestBody
    },
    patch: (resourceName, requestBody) => {
      // Validate, or even change the requestBody
    },
  },
}

const server = temba.create(config)
```

The `requestBodyValidator` is an object with a `post`, and/or `patch`, and/or `put` field, which contains the callback function you want Temba to call before the JSON is saved to the database.

The callback function receives two arguments: The `resourceName`, which for example is `movies` if you request `POST /movies`. The second argument is the `requestBody`, which is the JSON object in the request body.

Your callback function can return the following things:

- `void`: Temba will just save the request body as-is. An example of this is when you have validated the request body and everything looks fine.
- `string`: If you return a string Temba will return a `400 Bad Request` with the string as error message.
- `object`: Return an object if you want to change the request body. Temba will save the returned object instead of the original request body.

Example:

```js
const config = {
  requestBodyValidator: {
    post: (resourceName, requestBody) => {
      // Do not allow Pokemons to be created: 400 Bad Request
      if (resourceName === 'pokemons')
        return 'You are not allowed to create new Pokemons'

      // Add a genre to Star Trek films:
      if (
        resourceName === 'movies' &&
        requestBody.title.startsWith('Star Trek')
      )
        return { ...requestBody, genre: 'Science Fiction' }

      // If you end up here, void will be returned, so the request will just be saved.
    },
  },
}

const server = temba.create(config)
```

### Config settings overview

Configuring Temba is optional, it already works out of the box.

Here is an example of the config settings for Temba, and how you define them:

```js
const config = {
  resourceNames: ['movies', 'actors'],
  connectionString: 'mongodb://localhost:27017',
  staticFolder: 'build',
  apiPrefix: 'api',
  cacheControl: 'public, max-age=300',
  delay: 500,
  requestBodyValidator: {
    post: (resourceName, requestBody) => {
      // Validate, or even change the requestBody
    },
    patch: (resourceName, requestBody) => {
      // Validate, or even change the requestBody
    },
    put: (resourceName, requestBody) => {
      // Validate, or even change the requestBody
    },
  },
}
const server = temba.create(config)
```

None of the settings are required, and none of them have default values that actually do something. So only the settings you define are used.

These are all the possible settings:

| Config setting         | Description                                                                                |
| :--------------------- | :----------------------------------------------------------------------------------------- |
| `resourceNames`        | See [Allowing specific resources only](#allowing-specific-resources-only)                  |
| `connectionString`     | See [MongoDB](#mongodb)                                                                    |
| `staticFolder`         | See [Static assets](#static-assets)                                                        |
| `apiPrefix`            | See [REST URIs prefixes](#rest-uris-prefixes)                                              |
| `cacheControl`         | The `Cache-control` response header value for each GET request.                            |
| `delay`                | After processing the request, the delay in milliseconds before the request should be sent. |
| `requestBodyValidator` | See [Request body validation or mutation](#request-body-validation-or-mutation)            |

## Not supported (yet?)

The following features would be very nice for Temba to support:

### Auth

Temba offers no ways for authentication or authorization (yet?), so if someone knows how to reach the API, they can read and mutate all your data, unless you restrict this in another way.

### Nested parent-child resources

Also nested (parent-child) URI routes are not supported (yet?). So every URI has the /:resource/:id structure and there is no way to indicate any deeper relation through the URI.

### Filtering and sorting

And there is no filtering, sorting, searching, etc. (yet?).

## Under the hood

Temba is built with JavaScript, [Node](https://nodejs.org), [Express](https://expressjs.com/), [Jest](https://jestjs.io/), [Supertest](https://www.npmjs.com/package/supertest), and [@rakered/mongo](https://www.npmjs.com/package/@rakered/mongo).

## Which problem does Temba solve?

The problem with JSON file solutions like json-server is the limitations you have when hosting your app, because your data is stored in a file.

For example, hosting json-server on GitHub Pages means your API is essentially readonly, because, although mutations are supported, your data is not really persisted.

And hosting json-server on Heroku does give you persistence, but is not reliable because of its [ephemeral filesystem](https://devcenter.heroku.com/articles/dynos#ephemeral-filesystem).

These limitations are of course the whole idea behind json-server, it's for simple mocking and prototyping. But if you want more (persistence wise) and don't mind having a database, you might want to try Temba.

## Contributors ???

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://bouwe.io"><img src="https://avatars.githubusercontent.com/u/4126793?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Bouwe K. Westerdijk</b></sub></a><br /><a href="https://github.com/bouwe77/temba/commits?author=bouwe77" title="Code">????</a> <a href="https://github.com/bouwe77/temba/issues?q=author%3Abouwe77" title="Bug reports">????</a> <a href="https://github.com/bouwe77/temba/commits?author=bouwe77" title="Documentation">????</a> <a href="#ideas-bouwe77" title="Ideas, Planning, & Feedback">????</a> <a href="https://github.com/bouwe77/temba/commits?author=bouwe77" title="Tests">??????</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
