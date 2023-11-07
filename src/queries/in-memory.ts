import { Item } from './types'

const data: { [key: string]: Item[] } = {}

function connectToDatabase() {
  return new Promise<void>((resolve) => {
    resolve()
  })
}

function getAll(resource: string) {
  createResourceArrayIfNecessary(resource)

  return new Promise<unknown[]>((resolve) => {
    resolve(data[resource])
  })
}

function getById(resource: string, id: string) {
  createResourceArrayIfNecessary(resource)

  return new Promise((resolve) => {
    resolve(data[resource].find((item) => item.id === id))
  })
}

function create(resource: string, item: Item) {
  createResourceArrayIfNecessary(resource)

  const newItem = { ...item, id: String(new Date().getTime()) }

  data[resource] = [...data[resource], newItem]

  return new Promise((resolve) => {
    resolve(newItem)
  })
}

function update(resource: string, item: Item) {
  createResourceArrayIfNecessary(resource)

  const updatedItem = { ...item }
  data[resource] = [...data[resource].filter((r) => r.id !== item.id), updatedItem]
  return new Promise((resolve) => {
    resolve(updatedItem)
  })
}

function replace(resource: string, item: Item) {
  return update(resource, item)
}

function deleteById(resource: string, id: string) {
  createResourceArrayIfNecessary(resource)

  data[resource] = data[resource].filter((item) => item.id !== id)
  return new Promise<void>((resolve) => {
    resolve()
  })
}

function deleteAll(resource: string) {
  createResourceArrayIfNecessary(resource)

  data[resource] = []
  return new Promise<void>((resolve) => {
    resolve()
  })
}

function createResourceArrayIfNecessary(resource: string) {
  if (!Object.hasOwn(data, resource)) data[resource] = []
}

export default {
  connectToDatabase,
  getAll,
  getById,
  create,
  update,
  replace,
  deleteById,
  deleteAll,
}
