import createFileQueries from './file'
import inMemoryQueries from './in-memory'
import createMongoQueries from './mongo'

function createQueries(connectionString) {
  // TODO figure out config later
  return createFileQueries()

  if (!connectionString) {
    return inMemoryQueries
  }

  const mongoQueries = createMongoQueries(connectionString)
  return mongoQueries
}

export { createQueries }
