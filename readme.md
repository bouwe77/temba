# Temba

**Get a simple MongoDB REST API with zero coding in less than 30 seconds (seriously).**

For developers who need a quick backend for small projects.

Powered by NodeJS, Express and MongoDB.

This project is inspired by the fantastic [json-server](https://github.com/typicode/json-server) project, but instead of a JSON file Temba uses a real database. The goal, however, is the same: Get you started with a REST API very quickly.

## Table of contents

[Temba?](#temba)

[Getting Started](#getting-started)

[Features](#features)

[Not supported (yet?)](#not-supported-yet)

[When NOT to use?](#when-not-to-use)

[Under the hood](#under-the-hood)

[Which problem does Temba solve?](#which-problem-does-temba-solve)

## Temba?

> _"Temba, at rest"_

A metaphor for the declining of a gift, from the [Star Trek - The Next Generation, episode "Darmok"](https://memory-alpha.fandom.com/wiki/Temba).

In the fictional Tamarian language the word _"Temba"_ means something like _"gift"_.

## Getting Started

Prerequisites you need to have:

- Node, NPM
- Optional: A MongoDB database, either locally or in the cloud

> Wthout a database, Temba also works. However, then data is kept in memory and flushed every time the server restarts.

### Use the `temba-starter` project

Clone the [temba-starter](https://github.com/bouwe77/temba-starter) repo and you are up and running! Refer to the [Features](#features) section for configuration options.

### Manually adding to an existing app

If you don't want to (or can't) use the starter, add Temba to your app manually:

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

By passing a config object to the `create` function you can customize Temba's behavior. Refer to the documentation below for the various possibilities.

## Usage

### Introduction

Out of the box, Temba gives you a CRUD REST API to any resource name you can think of.

Whether you `GET` either `/people`, `/movies`, `/pokemons`, or whatever, it all returns a `200 OK` with a `[]` JSON response. As soon as you `POST` a resource, then that will be returned upon a `GET` of that collection. You can also `DELETE`, or `PUT` resources by its ID, unless it does not exist of course.

For a specific collection, Temba supports the following requests:

- `GET /movies` - Get all movies
- `GET /movies/:id` - Get a movie by its ID
- `POST /movies` - Create a new movie
- `PUT /movies/:id` - Update (fully replace) a movie by its ID
- `DELETE /movies` - Delete all movies
- `DELETE /movies/:id` - Delete a movie by its ID

### Supported HTTP methods

Requests with an HTTP method that is not supported, everything but `GET`, `POST`, `PUT` and `DELETE`, will return a `405 Method Not Allowed` response.

On the root URI (e.g. http://localhost:8080/) only a `GET` request is supported, which shows you a message indicating the API is working. All other HTTP methods on the root URI return a `405 Method Not Allowed` response.

### MongoDB

When starting Temba, you can use it for sending your requests to it immediately. However, then the data resides in memory and is flushed as soon as the server restarts. To persist your data, provide the `connectionString` config setting for your MongoDB database:

```js
const config = {
  connectionString: 'mongodb://localhost:27017',
}
const server = temba.create(config)
```

### Allowing specific resources only

If you only want to allow specific collection names, configure them by providing a `resourceNames` key in the config object when creating the Temba server:

```js
const config = { resourceNames: ['movies', 'actors'] }
const server = temba.create(config)
```

Requests on these resources only give a `404 Not Found` if the ID does not exist. Requests on any other resource will return a `404 Not Found`.

### JSON

When sending JSON data (`POST` and `PUT` requests), adding a `Content-Type: application/json` header is required.

IDs are auto generated when creating resources. IDs in the JSON request body are ignored.

Temba only supports JSON. If you send a request with invalid formatted JSON, a `400 Bad Request` response is returned.

### Static assets

If you want to host static assets next to the REST API, configure the `staticFolder`:

```js
const config = { staticFolder: 'build' }
const server = temba.create(config)
```

This way, you could build both a REST API as the web app consuming it into one project.

If you configure the `staticFolder`, assets in there are reached by the root URL. For example, if you have an index.html document in the static folder, the URL is `http://example.com/index.html`.

However, to avoid conflicts between the resourcee URIs and the routes in your web app you might want to add an `apiPrefix` to the REST API:

### REST URIs prefixes

With the `apiPrefix` config setting, all REST resources get an extra path segment in front of them. If the `apiPrefix` is `'api'`, `/movies/12345` becomes `/api/movies/12345`:

```js
const config = { apiPrefix: 'api' }
const server = temba.create(config)
```

### Config settings overview

Configuring Temba is optional, it already works out of the box.

However, if you want to use some or all of the settings, you can provide them when creating the Temba server:

```js
const config = {
  resourceNames: ['movies', 'actors'],
  connectionString: 'mongodb://localhost:27017',
  staticFolder: 'build',
  apiPrefix: 'api',
}
const server = temba.create(config)
```

Here are all the possible settings:

| Config setting     | Description                                                               |
| ------------------ | ------------------------------------------------------------------------- |
| `resourceNames`    | See [Allowing specific resources only](#allowing-specific-resources-only) |
| `connectionString` | See [MongoDB](#mongodb)                                                   |
| `staticFolder`     | See [Static assets](#static-assets)                                       |
| `apiPrefix`        | See [REST URIs prefixes](#rest-uris-prefixes)                             |

## Not supported (yet?)

Temba does not have any model validation, so you can store your resources in any format you like.

So creating the following two (very different) movies is perfectly fine:

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

Partial updates using `PATCH`, or other HTTP methods are not (yet?) supported.

Temba offers no ways for authentication or authorization (yet?), so if someone knows how to reach the API, they can read and mutate all your data, unless you restrict this in another way.

Also nested (parent-child) are not supported (yet?), so every URI has the /:resource/:id structure and there is no way to indicate any relation, apart from within the JSON itself perhaps.

Also there is no filtering, sorting, searching, custom routes, etc. (yet?).

## When NOT to use

As you've read, Temba is very, very, limited in its functionality and this is mostly deliberate to keep it simple. It is not meant as an enterprise solution.

However, because it uses a database instead of a JSON file, it may be a quite robust solution for your use case.

## Under the hood

Temba is built with JavaScript, Node and Express. To communicate with MongoDB we use the fantastic [@rakered/mongo](https://www.npmjs.com/package/@rakered/mongo) package.

## Which problem does Temba solve?

The problem with JSON file solutions like json-server is the limitations you have when hosting your app.

For example, hosting json-server on GitHub Pages means your API is essentially readonly, because although mutations are supported, your data is not really persisted.

And hosting json-server on Heroku does give you persistence, but is not reliable because of its [ephemeral filesystem](https://devcenter.heroku.com/articles/dynos#ephemeral-filesystem).

These limitations are of course the whole idea behind json-server, but if you want more persistence wise and don't mind having a database, you might want to try Temba.
