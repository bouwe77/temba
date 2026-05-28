// Temba example: Filtering collections with query strings
// Docs: https://temba.bouwe.io/docs/filtering
//
// No configuration needed — filtering is built into Temba.
// Use LHS bracket query strings to filter GET and DELETE requests.
// String matching is case-insensitive.
//
// Supported operators: [eq], [neq]
// Omitting the operator defaults to [eq].
//
// Try it — first add some data:
//   POST http://localhost:8362/movies
//   Body: { "title": "Dune", "genre": "sci-fi" }
//
//   POST http://localhost:8362/movies
//   Body: { "title": "The Godfather", "genre": "drama" }
//
// Then filter:
//   GET http://localhost:8362/movies?filter.genre[eq]=sci-fi
//   GET http://localhost:8362/movies?filter.genre[neq]=drama

import { create } from 'temba'

const server = await create()

server.start()
