const { connect } = require("@rakered/mongo");

let mongoConnection;

async function connectDatabase() {
  mongoConnection = await connect();
}

async function disconnectDatabase() {
  await mongoConnection.disconnect();
}

function getConnection() {
  return mongoConnection;
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
  getConnection,
};
