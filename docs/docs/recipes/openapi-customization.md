---
id: openapi-customization
title: Customizing the OpenAPI spec
sidebar_position: 4
---

# Customizing the OpenAPI spec

Temba generates an OpenAPI spec automatically, but it can't look inside user-defined code. When you configure a `responseBodyInterceptor` or `requestInterceptor`, Temba adds a generic notice to the spec description — because it has no way to know what your code actually does.

This recipe shows how to use the `openapi` config option to replace that generic notice with precise, useful documentation.

## The scenario

A movies API where a `responseBodyInterceptor` adds a computed `displayTitle` field to every movie response, combining the title and release year:

```js
import { create } from 'temba'

const server = await create({
  resources: ['movies'],
  schemas: {
    movies: {
      post: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          year: { type: 'integer' },
        },
        required: ['title', 'year'],
        additionalProperties: false,
      },
    },
  },
  responseBodyInterceptor: ({ body }) => {
    if (Array.isArray(body)) {
      return body.map((movie) => ({
        ...movie,
        displayTitle: `${movie.title} (${movie.year})`,
      }))
    }
    return { ...body, displayTitle: `${body.title} (${body.year})` }
  },
})

server.start()
```

Every `GET /movies` and `GET /movies/{movieId}` response will now include a `displayTitle` field — but clients reading the spec have no idea, because Temba can only generate this:

```
A response body interceptor is configured. GET response bodies may differ
from the schemas documented here.
```

## Enriching the spec

Pass an `openapi` object to deep-merge your own additions on top of the generated spec. You only need to specify what you want to override — everything else stays auto-generated.

```js
const movieResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    year: { type: 'integer' },
    displayTitle: {
      type: 'string',
      description: 'Computed field combining title and year, e.g. "O Brother, Where Art Thou? (2000)".',
    },
  },
  required: ['id', 'title', 'year', 'displayTitle'],
}

const server = await create({
  resources: ['movies'],
  schemas: {
    movies: {
      post: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          year: { type: 'integer' },
        },
        required: ['title', 'year'],
        additionalProperties: false,
      },
    },
  },
  responseBodyInterceptor: ({ body }) => {
    if (Array.isArray(body)) {
      return body.map((movie) => ({
        ...movie,
        displayTitle: `${movie.title} (${movie.year})`,
      }))
    }
    return { ...body, displayTitle: `${body.title} (${body.year})` }
  },
  openapi: {
    info: {
      title: 'Movies API',
      description:
        'A movies API powered by [Temba](https://github.com/bouwe77/temba). ' +
        'GET responses include a computed `displayTitle` field combining the movie title and release year.',
    },
    paths: {
      '/movies': {
        get: {
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: movieResponseSchema,
                  },
                },
              },
            },
          },
        },
      },
      '/movies/{movieId}': {
        get: {
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: movieResponseSchema,
                },
              },
            },
          },
        },
      },
    },
  },
})

server.start()
```

The spec now accurately documents the actual response shape, including `displayTitle`. The deep-merge means all the other auto-generated paths, parameters, and responses are preserved — you only replaced the specific pieces you needed to.

## The same technique for requestInterceptor

If your `requestInterceptor` changes behaviour in a way that affects the spec — for example, adding a `403 Forbidden` response to `POST /movies` when a user lacks permission — you can document that the same way:

```js
openapi: {
  paths: {
    '/movies': {
      post: {
        responses: {
          '403': {
            description: 'Forbidden. You do not have permission to create movies.',
          },
        },
      },
    },
  },
},
```

## Notes

- The `openapi` object is deep-merged into the generated spec, so you can override any field at any depth without losing the rest of the auto-generated content.
- The `openapi` object must follow the [OpenAPIObject](https://github.com/metadevpro/openapi3-ts/blob/71b55d772bacc58c127540b6a75d1b17a7ddadbb/src/model/openapi31.ts) interface from `openapi3-ts`.
- See the [OpenAPI](/docs/openapi) page for a full description of the `openapi` config option.
