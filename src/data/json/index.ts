import type { Item, ItemWithoutId, Queries } from '../types'
import { Low, type Adapter, Memory } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import type { PathLike } from 'node:fs'

//TODO
// - [ ] Error handling for accessing the file
// - [ ] JSON meuk async maken (zie https://github.com/typicode/lowdb/blob/main/src/presets/node.ts)

const getInMemoryDb = <Data>(defaultData: Data): Promise<Low<Data>> => {
  return getJsonDb(new Memory<Data>(), defaultData)
}

const getFileDb = async <Data>(filename: PathLike, defaultData: Data): Promise<Low<Data>> => {
  return await getJsonDb(new JSONFile<Data>(filename), defaultData)
}

const getJsonDb = async <Data>(adapter: Adapter<Data>, defaultData: Data): Promise<Low<Data>> => {
  const db = new Low<Data>(adapter, defaultData)
  await db.read()
  return db
}

type JsonConfig = {
  filename: string | null
}

export default function createJsonQueries({ filename }: JsonConfig) {
  const defaultData: { [key: string]: Item[] } = {}

  async function getDb() {
    const db = filename ? await getFileDb(filename, defaultData) : await getInMemoryDb(defaultData)
    return db
  }

  async function getAll(resource: string) {
    const db = await getDb()
    const data = db.data[resource] || []
    return data
  }

  async function getById(resource: string, id: string) {
    const db = await getDb()
    const data = db.data[resource] || []
    return (data || []).find((x) => x.id === id) || null
  }

  async function create(resource: string, item: ItemWithoutId) {
    const db = await getDb()
    const itemWithId = { ...item, id: String(new Date().getTime()) } satisfies Item
    await db.update((data) => {
      data[resource] = [...(data[resource] || []), itemWithId]
    })

    return itemWithId
  }

  async function update(resource: string, item: Item) {
    const updatedItem = { ...item } satisfies Item

    const db = await getDb()
    await db.update((data) => {
      data[resource] = [...(data[resource] || []).filter((r) => r.id !== item.id), updatedItem]
    })

    return updatedItem
  }

  async function replace(resource: string, item: Item) {
    return update(resource, item)
  }

  async function deleteById(resource: string, id: string) {
    const db = await getDb()
    await db.update((data) => {
      data[resource] = [...(data[resource] || []).filter((r) => r.id !== id)]
    })
  }

  async function deleteAll(resource: string) {
    const db = await getDb()
    await db.update((data) => {
      data[resource] = []
    })
  }

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
