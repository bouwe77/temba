const mongoUrl = process.env.MONGO_URL || null;

let query;
if (mongoUrl) {
  const { connectDatabase } = require("./mongo/mongo-client");
  const mongoQueries = require("./mongo");
  connectDatabase();
  query = mongoQueries;
} else {
  const inMemoryQueries = require("./in-memory");
  query = inMemoryQueries;
}

module.exports = { query };
