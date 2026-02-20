---
id: schema-validation
title: JSON Schema request body validation
sidebar_label: Validation
sidebar_position: 6
---

# JSON Schema request body validation

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
