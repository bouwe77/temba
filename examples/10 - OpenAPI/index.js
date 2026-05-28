// Temba example: Custom OpenAPI spec metadata
// Docs: https://temba.bouwe.io/docs/openapi
//
// OpenAPI is enabled by default (`openapi: true`). Temba generates a full
// OpenAPI 3.x spec and serves it at:
//   /openapi        → HTML Swagger UI
//   /openapi.json   → JSON spec
//   /openapi.yaml   → YAML spec
//
// Pass an object to deep-merge your own metadata into the generated spec.
// This lets you add a title, description, contact info, etc.
//
// Try it:
//   GET http://localhost:8362/openapi      → Swagger UI with custom title
//   GET http://localhost:8362/openapi.json → full spec with merged metadata

import { create } from 'temba'

const server = await create({
  openapi: {
    info: {
      title: 'My Movie API',
      description: 'A simple API for managing movies, built with Temba.',
      version: '1.0.0',
      contact: {
        name: 'API Support',
        url: 'https://example.com/support',
      },
    },
  },
})

server.start()
