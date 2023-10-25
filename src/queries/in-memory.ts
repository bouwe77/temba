const data = {}

function connectToDatabase() {
  // do nothing
}

function getAll(resource) {
  createResourceArrayIfNecessary(resource)

  return new Promise((resolve) => {
    resolve(data[resource])
  })
}

function getById(resource, id) {
  createResourceArrayIfNecessary(resource)

  return new Promise((resolve) => {
    resolve(data[resource].find((item) => item.id === id))
  })
}

function create(resource, item) {
  createResourceArrayIfNecessary(resource)

  const newItem = { ...item, id: String(new Date().getTime()) }

  data[resource] = [...data[resource], newItem]

  return new Promise((resolve) => {
    resolve(newItem)
  })
}

function update(resource, item) {
  createResourceArrayIfNecessary(resource)

  const updatedItem = { ...item }
  data[resource] = [...data[resource].filter((r) => r.id !== item.id), updatedItem]
  return new Promise((resolve) => {
    resolve(updatedItem)
  })
}

function replace(resource, item) {
  return update(resource, item)
}

function deleteById(resource, id) {
  createResourceArrayIfNecessary(resource)

  data[resource] = data[resource].filter((item) => item.id !== id)
  return new Promise<void>((resolve) => {
    resolve()
  })
}

function deleteAll(resource) {
  createResourceArrayIfNecessary(resource)

  data[resource] = []
  return new Promise((resolve) => {
    resolve([])
  })
}

function createResourceArrayIfNecessary(resource) {
  if (!data.hasOwnProperty(resource)) data[resource] = []
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
