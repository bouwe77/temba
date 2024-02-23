import { connect } from '@rakered/mongo'
import { Item, ItemWithoutId, Queries } from './types'

let uri
let db

export default function createMongoQueries(connectionString: string) {
  uri = connectionString

  const mongoQueries: Queries = {
    getAll,
    getById,
    create,
    update,
    replace,
    deleteById,
    deleteAll,
  }

  return mongoQueries
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

async function getAll(resource: string) {
  await connectToDatabase()

  const items = await db[resource].find({})

  if (!items) return []

  return items.map((item) => removeUnderscoreFromId(item))
}

async function getById(resource: string, id: string) {
  await connectToDatabase()

  const item = await db[resource].findOne({ _id: id })

  if (!item) return null

  return removeUnderscoreFromId(item)
}

async function create(resource: string, item: ItemWithoutId) {
  await connectToDatabase()

  const createdItem = await db[resource].insertOne(item)

  return removeUnderscoreFromId(createdItem.ops[0])
}

async function update(resource: string, item: Item) {
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

async function replace(resource: string, item: Item) {
  await connectToDatabase()

  const id = item.id
  delete item.id

  const replacedItem = await db[resource].findOneAndReplace({ _id: id }, item, {
    returnOriginal: false,
  })

  return removeUnderscoreFromId(replacedItem.value)
}

async function deleteById(resource: string, id: string) {
  await connectToDatabase()

  await db[resource].deleteOne({ _id: id })
}

async function deleteAll(resource: string) {
  await connectToDatabase()

  await db[resource].deleteMany({})
}

type MongoItem = {
  _id: string
  [key: string]: unknown
}

function removeUnderscoreFromId(item: MongoItem) {
  const { _id, ...updatedItem } = item
  return updatedItem as Item
}
