import inMemoryQueries from './in-memory'
import mongoConnection from './mongo/connection'
import mongoQueries from './mongo'

//TODO Rename "query" to queries"?

function createQueries(connectionString) {
  if (!connectionString) {
    return inMemoryQueries
  }

  mongoConnection.connectDatabase(connectionString)
  return mongoQueries
}

export { createQueries }
