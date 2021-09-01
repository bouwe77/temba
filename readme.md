# Soksawat

## Introduction

Get a full REST API with zero coding in less than 30 seconds (seriously). For developers who need a quick back-end for their hobby projects.

Powered by NodeJS, Express and MongoDB.

Inspired by json-server although instead of a JSON file, Soksawat is backed by a database. However, it is pretty similar. The goal is to get you started very fast and the database is used as a simple key value store of JSON documents.

## Which problem does it solve?

The problem Soksawat solves compared to a JSON file solution is that you are less dependent on the hosting solution you choose for your app. For example, hosting json-server on GitHub Pages means your API is readonly, mutations aren't persisted. Hosting json-server on Heroku does give you persistence, but is not reliable because of the [temporary lifetime](https://devcenter.heroku.com/articles/dynos#ephemeral-filesystem) of your app (and therefore JSON data) on their filesystem.

# Getting Started

Prerequisites you need to have:

- Node, NPM
- A MongoDB database, either locally or in the cloud

Now follow these steps to get soksawat up and running:

1. Clone the repo

2. `npm i ci`

3. Rename the `.env.example` to `.env` and add your MongoDB connection settings

4. Edit `config.js` to enter the resource names you want to support

5. Start soksawat: `npm start`

6. Open your favorite HTTP client and start requesting data!

## When to use

...

The following requests are supported:

- GET /resource
- GET /resource/:id
- POST /resource
- PUT /resource/:id
- DELETE /resource
- DELETE /resource/:id

Partial updates using PATCH, or other HTTP methods are not (yet?) supported.

## When NOT to use

Soksawat is very limited in its functionality and this is mostly deliberate to keep it simple. It should not be used as an enterprise solution.

### No model validation (yet)

At the moment Soksawat does not have any model validation, so you can store your resources in any format you like.

For example, creating the following two (very different) articles just works:

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

### No auth (yet)

Soksawat offers no ways for authentication or authorization, so if someone knows how to reach the API, they can read and mutate all your data.

# Features

Current:
...

Upcoming:
...

Not (and never will be) supported:
...

# Under the hood

...

# Roadmap

...
