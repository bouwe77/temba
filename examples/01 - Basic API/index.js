// Temba example: Basic API
// Docs: https://temba.bouwe.io/docs/overview
//
// A zero-config REST API. Temba automatically supports full CRUD for
// any resource name you can think of — no routing, no schema needed.
//
// Try it:
//   POST http://localhost:8362/movies
//   Body: { "title": "Dune", "year": 2021 }
//
//   GET  http://localhost:8362/movies
//   GET  http://localhost:8362/movies/:id
//   PUT  http://localhost:8362/movies/:id
//   PATCH http://localhost:8362/movies/:id
//   DELETE http://localhost:8362/movies/:id
//
// OpenAPI/Swagger UI: http://localhost:8362/openapi

import { create } from 'temba'

const server = await create()

server.start()
