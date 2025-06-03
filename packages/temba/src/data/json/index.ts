import type { Item, ItemWithoutId, Queries } from '../types'
import { Low, type Adapter, Memory } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import type { PathLike } from 'node:fs'
import type { Filter } from '../../filtering/filter'
import { makePredicate } from './filtering'

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

  async function getAll({ resource }: { resource: string }) {
    return (await getDb()).data[resource] || []
  }

  async function getByFilter({ resource, filter }: { resource: string; filter: Filter }) {
    const data = (await getDb()).data[resource] || []
    const pred = makePredicate(filter)
    return data.filter((item) => {
      const ok = pred(item)
      return ok
    })
  }

  async function getById({ resource, id }: { resource: string; id: string }) {
    const db = await getDb()
    const data = db.data[resource] || []
    return (data || []).find((x) => x.id === id) || null
  }

  async function create({
    resource,
    id,
    item,
  }: {
    resource: string
    id: string | null
    item: ItemWithoutId
  }) {
    const db = await getDb()
    const itemWithId = {
      ...item,
      id: id || String(new Date().getTime()),
    } satisfies Item
    await db.update((data) => {
      data[resource] = [...(data[resource] || []), itemWithId]
    })

    return itemWithId
  }

  async function update({ resource, item }: { resource: string; item: Item }) {
    const updatedItem = { ...item } satisfies Item

    const db = await getDb()
    await db.update((data) => {
      data[resource] = [...(data[resource] || []).filter((r) => r.id !== item.id), updatedItem]
    })

    return updatedItem
  }

  async function replace(query: { resource: string; item: Item }) {
    return update(query)
  }

  async function deleteById({ resource, id }: { resource: string; id: string }) {
    const db = await getDb()
    await db.update((data) => {
      data[resource] = [...(data[resource] || []).filter((r) => r.id !== id)]
    })
  }

  async function deleteAll({ resource }: { resource: string }) {
    const db = await getDb()
    await db.update((data) => {
      data[resource] = []
    })
  }

  async function deleteByFilter({ resource, filter }: { resource: string; filter: Filter }) {
    const db = await getDb()
    const pred = makePredicate(filter)
    await db.update((data) => {
      data[resource] = (data[resource] || []).filter((item) => !pred(item))
    })
  }

  const fileQueries: Queries = {
    getAll,
    getByFilter,
    getById,
    create,
    update,
    replace,
    deleteById,
    deleteAll,
    deleteByFilter,
  }

  return fileQueries
}
