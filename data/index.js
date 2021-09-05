import inMemoryQueries from "./in-memory";
import { connectDatabase } from "./mongo/mongo-client";
import mongoQueries from "./mongo";

//TODO Rename "query" to queries"?

function createQuery(connectionString) {
  if (!connectionString) {
    return inMemoryQueries;
  }

  connectDatabase(connectionString);
  return mongoQueries;
}

export default { createQuery };
