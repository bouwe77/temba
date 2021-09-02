const { getConnection } = require("./mongo-client");

async function getAll(resourceName) {
  const db = getConnection();

  const stuff = await db.songs.find({});
  return stuff;
}

async function getById(resourceName, id) {
  const db = getConnection();

  const item = await db.songs.findOne({ _id: id });
  return item;
}

async function create(resourceName, item) {
  const db = getConnection();

  const createdItem = await db.songs.insertOne(item);
  return createdItem.ops[0];
}

async function update(resourceName, item) {
  const db = getConnection();

  const id = item.id;
  delete item.id;

  const updatedItem = await db.songs.findOneAndUpdate(
    { _id: id },
    { $set: item },
    { returnOriginal: false }
  );

  return updatedItem.value;
}

async function deleteById(resourceName, id) {
  const db = getConnection();

  await db.songs.deleteOne({ _id: id });
}

async function deleteAll(resourceName) {
  const db = getConnection();

  await db.songs.deleteMany({});
}

module.exports = { getAll, getById, create, update, deleteById, deleteAll };
