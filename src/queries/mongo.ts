import { connect } from '@rakered/mongo'

let uri
let db

export default function createMongoQueries(connectionString) {
  uri = connectionString

  return {
    connectToDatabase,
    getAll,
    getById,
    create,
    replace,
    deleteById,
    deleteAll,
  }
}

async function connectToDatabase() {
  if (!db) {
    console.log('Connecting...')
    db = await connect(uri)
  }
}

async function getAll(resourceName) {
  await connectToDatabase()

  const items = await db[resourceName].find({})

  if (!items) return []

  return items.map((item) => removeUnderscoreFromId(item))
}

async function getById(resourceName, id) {
  await connectToDatabase()

  const item = await db[resourceName].findOne({ _id: id })

  if (!item) return null

  return removeUnderscoreFromId(item)
}

async function create(resourceName, item) {
  await connectToDatabase()

  const createdItem = await db[resourceName].insertOne(item)

  return removeUnderscoreFromId(createdItem.ops[0])
}

async function replace(resourceName, item) {
  await connectToDatabase()

  const id = item.id
  delete item.id

  const replacedItem = await db[resourceName].findOneAndUpdate(
    { _id: id },
    { $set: item },
    { returnOriginal: false },
  )

  return removeUnderscoreFromId(replacedItem.value)
}

async function deleteById(resourceName, id) {
  await connectToDatabase()

  await db[resourceName].deleteOne({ _id: id })
}

async function deleteAll(resourceName) {
  await connectToDatabase()

  await db[resourceName].deleteMany({})
}

function removeUnderscoreFromId(item) {
  const updatedItem = { ...item, id: item._id }
  delete updatedItem._id
  return updatedItem
}
