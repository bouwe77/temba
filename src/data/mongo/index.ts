import { type Db, connect } from '@rakered/mongo'
import type { Item, ItemWithoutId, Queries } from '../types'
import type { Logger } from '../../log/logger'

let uri: string
let db: Db

type MongoItem = {
  _id: string
  [key: string]: unknown
}

const removeUnderscoreFromId = ({ _id: id, ...updatedItem }: MongoItem): Item => ({
  id,
  ...updatedItem,
})

export const createMongoQueries = (connectionString: string, logger: Logger) => {
  uri = connectionString

  const connectToDatabase = async () => {
    if (!db) {
      logger.debug('Connecting to MongoDB...')
      try {
        db = await connect(uri)
        logger.debug('Connected to MongoDB!')
      } catch (error) {
        logger.debug('Error connecting to MongoDB')
        logger.error(error)
      }
    }
  }

  const getAll = async (resource: string) => {
    await connectToDatabase()

    const items = (await db[resource].find({})) as MongoItem[]

    if (!items) return []

    return items.map((item) => removeUnderscoreFromId(item))
  }

  const getById = async (resource: string, id: string) => {
    await connectToDatabase()

    const item = await db[resource].findOne({ _id: id })

    if (!item) return null

    return removeUnderscoreFromId(item)
  }

  const create = async (resource: string, item: ItemWithoutId) => {
    await connectToDatabase()

    const createdItem = await db[resource].insertOne(item)

    return removeUnderscoreFromId(createdItem.ops[0])
  }

  const update = async (resource: string, item: Item) => {
    await connectToDatabase()

    const { id, ...itemWithoutId } = item

    const updatedItem = await db[resource].findOneAndUpdate(
      { _id: id },
      { $set: itemWithoutId },
      { returnOriginal: false },
    )

    return removeUnderscoreFromId(updatedItem.value)
  }

  const replace = async (resource: string, item: Item) => {
    await connectToDatabase()

    const { id, ...itemWithoutId } = item

    const replacedItem = await db[resource].findOneAndReplace({ _id: id }, itemWithoutId, {
      returnOriginal: false,
    })

    return removeUnderscoreFromId(replacedItem.value)
  }

  const deleteById = async (resource: string, id: string) => {
    await connectToDatabase()

    await db[resource].deleteOne({ _id: id })
  }

  const deleteAll = async (resource: string) => {
    await connectToDatabase()

    await db[resource].deleteMany({})
  }

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
