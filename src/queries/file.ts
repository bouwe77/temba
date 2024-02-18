import { JSONFilePreset } from 'lowdb/node'
import { Item, ItemWithoutId, Queries } from './types'

export default function createFileQueries() {
  const fileQueries: Queries = {
    getAll,
    getById,
    create,
    update,
    replace,
    deleteById,
    deleteAll,
  }

  return fileQueries
}

async function openDatabase(resource: string) {
  type Data = { data: Item[] }
  const defaultData: Data = { data: [] }
  const db = await JSONFilePreset<Data>(`${resource}.json`, defaultData)
  return db
}

async function readData(resource: string) {
  const db = await openDatabase(resource)

  const {
    data: { data },
  } = db

  return data
}

async function getAll(resource: string) {
  const data = await readData(resource)
  return data
}

async function getById(resource: string, id: string) {
  const data = await readData(resource)
  return data.find((x) => x.id === id)
}

async function create(resource: string, item: ItemWithoutId) {
  const db = await openDatabase(resource)

  const itemWithId = { ...item, id: String(new Date().getTime()) }
  await db.update((data) => data.data.push(itemWithId))

  return itemWithId
}

async function update(resource: string, item: Item) {
  const db = await openDatabase(resource)

  const updatedItem = { ...item }

  db.update(({ data }) => {
    data = [...data.filter((x) => x.id !== item.id), updatedItem]
  })

  db.write()

  return updatedItem
}

async function replace(resource: string, item: Item) {
  return update(resource, item)
}

async function deleteById(resource: string, id: string) {
  const db = await openDatabase(resource)

  db.update(({ data }) => {
    data = [...data.filter((x) => x.id !== id)]
  })

  db.write()
}

async function deleteAll(resource: string) {
  const db = await openDatabase(resource)

  db.update(({ data }) => {
    data = []
  })

  db.write()
}
