// Temba example: Adding a path prefix to all API routes
// Docs: https://temba.bouwe.io/docs/api-prefix
//
// `apiPrefix` adds a prefix segment to every resource path.
// Only alphanumeric characters are allowed (special characters are stripped).
//
// With `apiPrefix: 'api'`:
//   All resources are now under /api/...
//   The root / returns 404 (new root is /api)
//
// This is useful when:
//   - You want versioned paths (use 'apiv1')
//   - You're serving a frontend from the same server (Temba sets this
//     automatically when `staticFolder` is configured)
//
// Try it:
//   GET http://localhost:8362/api/movies     → 200 OK
//   GET http://localhost:8362/movies         → 404 Not Found
//   GET http://localhost:8362/api            → API root listing

import { create } from 'temba'

const server = await create({
  apiPrefix: 'api',
})

server.start()
