import inMemoryQueries from './in-memory'
import connectDatabase from './mongo/connection'
import mongoQueries from './mongo'

//TODO Rename "query" to queries"?

function createQueries(connectionString) {
  if (!connectionString) {
    return inMemoryQueries
  }

  connectDatabase(connectionString)
  return mongoQueries
}

export { createQueries }
