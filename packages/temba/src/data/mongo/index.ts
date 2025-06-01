import { type Db, connect } from '@rakered/mongo'
import type { Item, ItemWithoutId, Queries } from '../types'
import type { Logger } from '../../log/logger'
import type { Filter } from '../../filtering/filter'

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

export const createMongoQueries = (connectionString: string, log: Logger) => {
  uri = connectionString

  const connectToDatabase = async () => {
    if (!db) {
      log.debug('Connecting to MongoDB...')
      try {
        db = await connect(uri)
        log.debug('Connected to MongoDB!')
      } catch (error) {
        log.debug('Error connecting to MongoDB')
        log.error(error)
      }
    }
  }

  const getAll = async ({ resource }: { resource: string }) => {
    await connectToDatabase()

    const items = (await db[resource].find({})) as MongoItem[]

    if (!items) return []

    return items.map((item) => removeUnderscoreFromId(item))
  }

  const getById = async ({ resource, id }: { resource: string; id: string }) => {
    await connectToDatabase()

    const item = await db[resource].findOne({ _id: id })

    if (!item) return null

    return removeUnderscoreFromId(item)
  }

  const create = async ({
    resource,
    id,
    item,
  }: {
    resource: string
    id: string | null
    item: ItemWithoutId
  }) => {
    await connectToDatabase()

    const createdItem = await db[resource].insertOne(id ? { ...item, _id: id } : item)

    return removeUnderscoreFromId(createdItem.ops[0])
  }

  const update = async ({ resource, item }: { resource: string; item: Item }) => {
    await connectToDatabase()

    const { id, ...itemWithoutId } = item

    const updatedItem = await db[resource].findOneAndUpdate(
      { _id: id },
      { $set: itemWithoutId },
      { returnOriginal: false },
    )

    return removeUnderscoreFromId(updatedItem.value)
  }

  const replace = async ({ resource, item }: { resource: string; item: Item }) => {
    await connectToDatabase()

    const { id, ...itemWithoutId } = item

    const replacedItem = await db[resource].findOneAndReplace({ _id: id }, itemWithoutId, {
      returnOriginal: false,
    })

    return removeUnderscoreFromId(replacedItem.value)
  }

  const deleteById = async ({ resource, id }: { resource: string; id: string }) => {
    await connectToDatabase()

    await db[resource].deleteOne({ _id: id })
  }

  const deleteAll = async ({ resource }: { resource: string }) => {
    await connectToDatabase()

    await db[resource].deleteMany({})
  }

  const deleteByFilter = async (_: { resource: string; filter: Filter }) => {
    throw new Error('NOT IMPLEMENTED YET')
  }

  const mongoQueries: Queries = {
    getAll,
    getById,
    create,
    update,
    replace,
    deleteById,
    deleteAll,
    deleteByFilter,
  }

  return mongoQueries
}
