// Temba example: Custom CORS configuration
// Docs: https://temba.bouwe.io/docs/cors
//
// Temba sends CORS headers automatically on every response.
// By default, all origins are allowed (`origin: '*'`).
//
// Override only the fields you need. All other defaults are preserved.
//
// Default values:
//   origin: '*'
//   methods: 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS'
//   headers: 'Content-Type, X-Token'
//   credentials: false
//
// This example restricts the API to a specific origin and enables credentials.
// Note: `credentials: true` requires a specific `origin` (not '*').
//
// Try it:
//   From a browser on https://myapp.example.com:
//     fetch('http://localhost:8362/movies', { credentials: 'include' })
//     → works (origin matches)
//
//   From any other origin:
//     → CORS preflight blocked

import { create } from 'temba'

const server = await create({
  cors: {
    origin: 'https://myapp.example.com',
    credentials: true,
  },
})

server.start()
