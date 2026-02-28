// Temba example: Intercepting requests (token-based auth)
// Docs: https://temba.bouwe.io/docs/request-interceptor
//
// `requestInterceptor` lets you hook into requests before Temba handles them,
// per HTTP method. You can inspect headers, modify the request body, or return
// a custom response entirely.
//
// This example checks for a secret token on all write requests.
// In a real app, use a proper JWT library instead of a hardcoded token.
//
// Try it — rejected (missing token):
//   POST http://localhost:8362/movies
//   Body: { "title": "Dune" }
//   → 401 Unauthorized
//
// Try it — accepted (correct token):
//   POST http://localhost:8362/movies
//   Headers: X-Token: secret
//   Body: { "title": "Dune" }
//   → 201 Created

import { create } from 'temba'

const SECRET_TOKEN = 'secret'

function requireToken(request, actions) {
  if (request.headers['x-token'] !== SECRET_TOKEN) {
    return actions.response({ status: 401, body: { error: 'Unauthorized' } })
  }
}

const server = await create({
  requestInterceptor: {
    post: requireToken,
    put: requireToken,
    patch: requireToken,
    delete: requireToken,
  },
})

server.start()
