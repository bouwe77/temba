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

This library is my gift to you... 🧔🏻 💖

## Getting Started

Prerequisites you need to have:

- Node, NPM
- Optional: A MongoDB database, either locally or in the cloud

> Wthout a database, Temba also works. However, then data is kept in memory and flushed every time the server restarts.

### Use the `temba-starter` project

Clone the [temba-starter](https://github.com/bouwe/temba-starter) repo and you are up and running! Refer to the [Features](#features) section for configuration options.

### Manually adding to an existing app

1. `npm i temba`

2. Example code to create a Temba server:

```js
const temba = require("temba");
const server = temba.create();

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Temba is running on port ${port}`);
});
```

## Features

Temba gives you a CRUD REST API to the resource names you have configured when creating the server:

```js
const config = { resourceNames: ["movies", "actors"] };
const server = temba.create(config);
```

> Providing a configuration is not required. Also providing the `config.resourceNames` is not required. If you don't provide them, you have the default "articles" resource at your disposal.

As we have configured the `movies` resource, the following requests are supported:

- `GET /movies` - Get all movies
- `GET /movies/:id` - Get a movie by its ID
- `POST /movies` - Create a new movie
- `PUT /movies/:id` - Update (fully replace) a movie by its ID
- `DELETE /movies` - Delete all movies
- `DELETE /movies/:id` - Delete a movie by its ID

When sending JSON data (`POST` and `PUT` requests), adding a `Content-Type: application/json` header is required.

IDs are auto generated when creating resources. IDs in the JSON request body are ignored.

If you request a resource (URI) that does not exist, a `404 Not Found` response is returned.

Temba only supports JSON. If you send a request with invalid formatted JSON, a `400 Bad Request` response is returned.

If you use an HTTP method that is not supported (everything but `GET`, `POST`, `PUT` and `DELETE`), a `405 Method Not Allowed` response is returned.

On the root URI (e.g. http://localhost:8080/) only a `GET` request is supported, which shows you a message indicating the API is working. All other HTTP methods on the root URI return a `405 Method Not Allowed` response.

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
