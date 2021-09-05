const inMemoryQueries = require("./in-memory");
const { connectDatabase } = require("./mongo/mongo-client");
const mongoQueries = require("./mongo");

//TODO Rename "query" to queries"?

function createQuery(connectionString) {
  if (!connectionString) {
    return inMemoryQueries;
  }

  connectDatabase(connectionString);
  return mongoQueries;
}

module.exports = { createQuery };
