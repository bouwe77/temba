// Temba example: Allowlisting specific resources
// Docs: https://temba.bouwe.io/docs/resources
//
// By default, any resource name is valid. Use `resources` to restrict
// the API to only the listed resource names. Any other resource will
// return 404 Not Found.
//
// Try it:
//   GET http://localhost:8362/movies      → 200 OK (allowed)
//   GET http://localhost:8362/actors      → 200 OK (allowed)
//   GET http://localhost:8362/directors   → 404 Not Found (not in the list)

import { create } from 'temba'

const server = await create({
  resources: ['movies', 'actors'],
})

server.start()
