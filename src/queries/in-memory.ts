const data = {}

function connectToDatabase() {
  // do nothing
}

function getAll(resourceName) {
  createResourceArrayIfNecessary(resourceName)

  return new Promise((resolve) => {
    resolve(data[resourceName])
  })
}

function getById(resourceName, id) {
  createResourceArrayIfNecessary(resourceName)

  return new Promise((resolve) => {
    resolve(data[resourceName].find((item) => item.id === id))
  })
}

function create(resourceName, item) {
  createResourceArrayIfNecessary(resourceName)

  const newItem = { ...item, id: String(new Date().getTime()) }

  data[resourceName] = [...data[resourceName], newItem]

  return new Promise((resolve) => {
    resolve(newItem)
  })
}

function replace(resourceName, item) {
  createResourceArrayIfNecessary(resourceName)

  const replacedItem = { ...item }
  data[resourceName] = [
    ...data[resourceName].filter((r) => r.id !== item.id),
    replacedItem,
  ]
  return new Promise((resolve) => {
    resolve(replacedItem)
  })
}

function deleteById(resourceName, id) {
  createResourceArrayIfNecessary(resourceName)

  data[resourceName] = data[resourceName].filter((item) => item.id !== id)
  return new Promise<void>((resolve) => {
    resolve()
  })
}

function deleteAll(resourceName) {
  createResourceArrayIfNecessary(resourceName)

  data[resourceName] = []
  return new Promise((resolve) => {
    resolve([])
  })
}

function createResourceArrayIfNecessary(resourceName) {
  if (!data.hasOwnProperty(resourceName)) data[resourceName] = []
}

export default {
  connectToDatabase,
  getAll,
  getById,
  create,
  replace,
  deleteById,
  deleteAll,
}
