const { getConnection } = require("./mongo-client");

//TODO use this
function removeUnderscoreFromId(item) {
  const updatedItem = { ...item, id: item._id };
  delete updatedItem._id;
  return updatedItem;
}

async function getAll(resourceName) {
  const db = getConnection();

  const items = await db[resourceName].find({});
  return items.map((item) => removeUnderscoreFromId(item));
}

async function getById(resourceName, id) {
  const db = getConnection();

  const item = await db[resourceName].findOne({ _id: id });

  return removeUnderscoreFromId(item);
}

async function create(resourceName, item) {
  const db = getConnection();

  const createdItem = await db[resourceName].insertOne(item);

  //TODO InsertOne should return inserted document
  return removeUnderscoreFromId(createdItem.ops[0]);
}

async function update(resourceName, item) {
  const db = getConnection();

  const id = item.id;
  delete item.id;

  const updatedItem = await db[resourceName].findOneAndUpdate(
    { _id: id },
    { $set: item },
    { returnOriginal: false }
  );

  return removeUnderscoreFromId(updatedItem.value);
}

async function deleteById(resourceName, id) {
  const db = getConnection();

  await db[resourceName].deleteOne({ _id: id });
}

async function deleteAll(resourceName) {
  const db = getConnection();

  await db[resourceName].deleteMany({});
}

module.exports = { getAll, getById, create, update, deleteById, deleteAll };
