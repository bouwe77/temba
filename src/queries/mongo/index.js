import { connect } from '@rakered/mongo'

let uri
let db

async function connectToDatabaseIfNecessary() {
  if (!db) {
    console.log('Connecting...')
    db = await connect(uri)
  }
}

export default function createMongoQueries(connectionString) {
  uri = connectionString

  return { getAll, getById, create, update, deleteById, deleteAll }
}

async function getAll(resourceName) {
  await connectToDatabaseIfNecessary()

  const items = await db[resourceName].find({})
  return items.map((item) => removeUnderscoreFromId(item))
}

async function getById(resourceName, id) {
  await connectToDatabaseIfNecessary()

  const item = await db[resourceName].findOne({ _id: id })

  return removeUnderscoreFromId(item)
}

async function create(resourceName, item) {
  await connectToDatabaseIfNecessary()

  const createdItem = await db[resourceName].insertOne(item)

  return removeUnderscoreFromId(createdItem.ops[0])
}

async function update(resourceName, item) {
  await connectToDatabaseIfNecessary()

  const id = item.id
  delete item.id

  const updatedItem = await db[resourceName].findOneAndUpdate(
    { _id: id },
    { $set: item },
    { returnOriginal: false },
  )

  return removeUnderscoreFromId(updatedItem.value)
}

async function deleteById(resourceName, id) {
  await connectToDatabaseIfNecessary()

  await db[resourceName].deleteOne({ _id: id })
}

async function deleteAll(resourceName) {
  await connectToDatabaseIfNecessary()

  await db[resourceName].deleteMany({})
}

function removeUnderscoreFromId(item) {
  const updatedItem = { ...item, id: item._id }
  delete updatedItem._id
  return updatedItem
}
