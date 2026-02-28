// Temba example: ETag caching and optimistic concurrency
// Docs: https://temba.bouwe.io/docs/etags
//
// Setting `etags: true` adds ETag headers to all GET responses.
// Clients can use these for:
//
// 1. Conditional GETs (caching):
//    Send `If-None-Match: <etag>` on subsequent GETs.
//    If unchanged, server responds 304 Not Modified (no body).
//
// 2. Optimistic concurrency (PUT/PATCH/DELETE):
//    These requests REQUIRE an `If-Match: <etag>` header.
//    If the resource changed since you fetched it, server responds 412.
//
// Try it:
//   POST http://localhost:8362/movies
//   Body: { "title": "Dune" }
//   → note the id
//
//   GET http://localhost:8362/movies/:id
//   → note the ETag response header value
//
//   GET http://localhost:8362/movies/:id
//   Headers: If-None-Match: <etag>
//   → 304 Not Modified
//
//   PATCH http://localhost:8362/movies/:id
//   Headers: If-Match: <etag>
//   Body: { "year": 2021 }
//   → 200 OK (or 412 if etag is stale)

import { create } from 'temba'

const server = await create({
  etags: true,
})

server.start()
