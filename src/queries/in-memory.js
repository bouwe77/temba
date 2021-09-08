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

function update(resourceName, item) {
  createResourceArrayIfNecessary(resourceName)

  const updatedItem = { ...item }
  data[resourceName] = [
    ...data[resourceName].filter((r) => r.id !== item.id),
    updatedItem,
  ]
  return new Promise((resolve) => {
    resolve(updatedItem)
  })
}

function deleteById(resourceName, id) {
  createResourceArrayIfNecessary(resourceName)

  data[resourceName].filter((item) => item.id !== id)
  return new Promise((resolve) => {
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
  update,
  deleteById,
  deleteAll,
}
