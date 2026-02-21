import type { TestProject } from 'vitest/node'

const BASE_URI = process.env.TEMBA_MONGODB_BASE_URI ?? 'mongodb://localhost:27017'
const DB_NAME = `temba_test_${Date.now()}`

let mongoUri: string | undefined

export const setup = async (project: TestProject) => {
  mongoUri = `${BASE_URI}/${DB_NAME}`
  // Provide the URI to worker processes via Vitest's cross-process channel
  project.provide('mongoUri', mongoUri)
}

export const teardown = async () => {
  if (!mongoUri) return
  // Use the native mongodb driver (already a transitive dependency) to drop the
  // test database. @rakered/mongo's Db proxy does not expose dropDatabase().
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MongoClient } = require('mongodb')
  const client = new MongoClient(mongoUri)
  await client.connect()
  await client.db(DB_NAME).dropDatabase()
  await client.close()
}

declare module 'vitest' {
  export interface ProvidedContext {
    mongoUri: string
  }
}
