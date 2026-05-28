import { inject } from 'vitest'

// Runs in each worker process before any test file is imported.
// Picks up the MongoDB URI provided by globalSetup and writes it into
// process.env so createServer.ts can read it.
const mongoUri = inject('mongoUri')
if (mongoUri) {
  process.env.TEMBA_TEST_MONGODB_URI = mongoUri
}
