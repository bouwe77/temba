// Temba example: JSON Schema request body validation
// Docs: https://temba.bouwe.io/docs/schema-validation
//
// By default, any JSON body is accepted. Use `schemas` to define
// JSON Schema rules per resource and per HTTP method.
// Invalid bodies return 400 Bad Request.
//
// Try it — valid request:
//   POST http://localhost:8362/movies
//   Body: { "title": "Dune", "year": 2021 }
//
// Try it — invalid (missing required `title`):
//   POST http://localhost:8362/movies
//   Body: { "year": 2021 }
//   → 400 Bad Request

import { create } from 'temba'

const server = await create({
  schemas: {
    movies: {
      post: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          year: { type: 'number' },
        },
        required: ['title'],
        additionalProperties: false,
      },
      put: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          year: { type: 'number' },
        },
        required: ['title'],
        additionalProperties: false,
      },
      patch: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          year: { type: 'number' },
        },
        additionalProperties: false,
      },
    },
  },
})

server.start()
