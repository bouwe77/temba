// Temba example: Transforming GET response bodies
// Docs: https://temba.bouwe.io/docs/response-interceptor
//
// `responseBodyInterceptor` lets you modify GET response bodies before
// they are sent. It is only called on successful 200 OK responses.
//
// The function receives { resource, body, id }. The `id` field is only
// present for single-item requests (GET /resource/:id).
// Return the modified body, or undefined to leave it unchanged.
//
// This example adds a computed `_link` field to every movie item.
//
// Try it:
//   POST http://localhost:8362/movies
//   Body: { "title": "Dune" }
//
//   GET http://localhost:8362/movies
//   → each item has a `_link` field added

import { create } from 'temba'

const server = await create({
  responseBodyInterceptor: ({ resource, body, id }) => {
    if (resource === 'movies') {
      const addLink = (item) => ({
        ...item,
        _link: `https://example.com/${resource}/${item.id}`,
      })

      return Array.isArray(body) ? body.map(addLink) : addLink(body)
    }
  },
})

server.start()
