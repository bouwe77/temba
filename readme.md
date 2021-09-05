# Temba

> Get a simple REST API backed by MongoDB with zero coding in less than 30 seconds (seriously).
>
> For developers who need a quick backend for their small and/or hobby projects.

Powered by NodeJS, Express and MongoDB.

This project is inspired by [json-server](https://github.com/typicode/json-server), but instead of a JSON file it uses a real database. The goal, however, is the same: Get you started with a REST API very quickly.

## Table of contents

[Temba?](#temba)

[Which problem does Temba solve?](#which-problem-does-temba-solve)

[Getting started](#getting-started)

[Features](#features)

[Not supported (yet?)](#not-supported-yet)

[When NOT to use?](#when-not-to-use)

[Under the hood](#under-the-hood)

## Temba?

> _"Temba, at rest"_

A metaphor for the declining of a gift. [Star Trek - The Next Generation, episode "Darmok"](https://memory-alpha.fandom.com/wiki/Temba)

In the fictional Tamarian language the word _"Temba"_ means something like _"gift"_. This is my gift to you... 🧔🏻 💖

## Which problem does Temba solve?

The problem with JSON file solutions like json-server is the limitations you have when hosting your app.

For example, hosting json-server on GitHub Pages means your API is essentially readonly, because although mutations are supported, your data is not really persisted.

And hosting json-server on Heroku does give you persistence, but is not reliable because of its [ephemeral filesystem](https://devcenter.heroku.com/articles/dynos#ephemeral-filesystem).

These limitations are the whole idea behind json-server, but if you don't like the persistence limitation and don't mind having a database, you might want to try Temba.

## Getting Started

Prerequisites you need to have:

- Node, NPM
- Optional: A MongoDB database, either locally or in the cloud

If you don't have a MongoDB (yet) Temba works with in memory data which is flushed everytime the server is restarted. This is good enough to give Temba a quick try.

Now follow these steps to get Temba up and running:

1. Clone the repo

2. `npm i ci`

3. Optional: Rename the `.env.example` to `.env` and add your MongoDB connection settings

4. Edit `temba-config.js` to enter the resource names you want to support

5. Start Temba: `npm start`

6. Open your favorite HTTP client and start requesting data!

## Features

Once you have the app up and running you can do CRUD requests to the resources you have configured in `temba-config.js`:

```js
const resourceNames = ["articles", "authors"];
```

So let's say we want to use the `articles` resource, then the following requests are supported:

- `GET /articles` - Get all articles
- `GET /articles/:id` - Get an article by its ID
- `POST /articles` - Create a new article
- `PUT /articles/:id` - Update (fully replace) an article by its ID
- `DELETE /articles` - Delete all articles
- `DELETE /articles/:id` - Delete an article by its ID

Partial updates using `PATCH`, or other HTTP methods are not (yet?) supported.

When sending JSON data (`POST` and `PUT` requests), adding a `Content-Type: application/json` header is required.

IDs are auto generated when creating resources. IDs in the JSON request body are ignored.

If you request a resource (URI) that does not exist, a `404 Not Found` response is returned.

Temba only supports JSON. If you send a request with invalid formatted JSON, a `400 Bad Request` response is returned.

If you use an HTTP method that is not supported (everything but `GET`, `POST`, `PUT` and `DELETE`), a `405 Method Not Allowed` response is returned.

On the root URI (e.g. http://localhost:8080/) only a `GET` request is supported, which shows you a message indicating the API is working. All other HTTP methods on the root URI return a `405 Method Not Allowed` response.

## Not supported (yet?)

Temba does not have any model validation, so you can store your resources in any format you like.
So for example, creating the following two (very different) articles just works:

```
POST /articles
{
    "title": "This is an article",
    "text": "Lorem ipsum dolor..."
}

POST /articles
{
    "foo": "bar",
    "baz": "boo"
}
```

Temba offers no ways for authentication or authorization (yet?), so if someone knows how to reach the API, they can read and mutate all your data, unless you restrict this in another way.

Also nested (parent-child) are not supported (yet?), so every URI has the /:resource/:id structure and there is no way to indicate any relation, apart from within the JSON itself perhaps.

Also there is no filtering, sorting, searching, custom routes, etc. (yet?).

## When NOT to use

As you've read, Temba is very, very, limited in its functionality and this is mostly deliberate to keep it simple. It is not meant as an enterprise solution.

However, because it uses a database instead of a JSON file, it may be a quite robust solution for your use case.

## Under the hood

Temba is built with JavaScript, Node and Express.
