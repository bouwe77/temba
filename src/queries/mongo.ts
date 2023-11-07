import { connect } from '@rakered/mongo'

let uri
let db

export default function createMongoQueries(connectionString: string) {
  uri = connectionString

  return {
    connectToDatabase,
    getAll,
    getById,
    create,
    update,
    replace,
    deleteById,
    deleteAll,
  }
}

async function connectToDatabase() {
  if (!db) {
    console.log('Connecting to MongoDB...')
    try {
      db = await connect(uri)
      console.log('Connected to MongoDB!')
    } catch (error) {
      console.log('Error connecting to MongoDB:')
      console.error(error)
    }
  }
}

async function getAll(resource) {
  await connectToDatabase()

  const items = await db[resource].find({})

  if (!items) return []

  return items.map((item) => removeUnderscoreFromId(item))
}

async function getById(resource, id) {
  await connectToDatabase()

  const item = await db[resource].findOne({ _id: id })

  if (!item) return null

  return removeUnderscoreFromId(item)
}

async function create(resource, item) {
  await connectToDatabase()

  const createdItem = await db[resource].insertOne(item)

  return removeUnderscoreFromId(createdItem.ops[0])
}

async function update(resource, item) {
  await connectToDatabase()

  const id = item.id
  delete item.id

  const updatedItem = await db[resource].findOneAndUpdate(
    { _id: id },
    { $set: item },
    { returnOriginal: false },
  )

  return removeUnderscoreFromId(updatedItem.value)
}

async function replace(resource, item) {
  await connectToDatabase()

  const id = item.id
  delete item.id

  const replacedItem = await db[resource].findOneAndReplace({ _id: id }, item, {
    returnOriginal: false,
  })

  return removeUnderscoreFromId(replacedItem.value)
}

async function deleteById(resource, id) {
  await connectToDatabase()

  await db[resource].deleteOne({ _id: id })
}

async function deleteAll(resource) {
  await connectToDatabase()

  await db[resource].deleteMany({})
}

function removeUnderscoreFromId(item) {
  const updatedItem = { ...item, id: item._id }
  delete updatedItem._id
  return updatedItem
}
