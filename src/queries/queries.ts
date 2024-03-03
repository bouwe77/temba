import inMemoryQueries from './in-memory'
import createMongoQueries from './mongo'

function createQueries(connectionString) {
  if (!connectionString) {
    return inMemoryQueries
  }

  const mongoQueries = createMongoQueries(connectionString)
  return mongoQueries
}

export { createQueries }
