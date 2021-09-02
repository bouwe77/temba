const { data } = require("./dummy-data");
const { v4: uuidv4 } = require("uuid");

function connectToDb() {
  // Nothing to connect to
}

function getAll(resourceName) {
  return new Promise((resolve) => {
    resolve(data[resourceName]);
  });
}

function getById(resourceName, id) {
  return new Promise((resolve) => {
    resolve(data[resourceName].find((item) => item.id === id));
  });
}

function create(resourceName, item) {
  const newItem = { ...item, id: uuidv4() };

  data[resourceName] = [...data[resourceName], newItem];

  return new Promise((resolve) => {
    resolve(newItem);
  });
}

function update(resourceName, item) {
  const updatedItem = { ...item };
  data[resourceName] = [
    ...data[resourceName].filter((r) => r.id !== item.id),
    updatedItem,
  ];
  return new Promise((resolve) => {
    resolve(updatedItem);
  });
}

function deleteById(resourceName, id) {
  data[resourceName].filter((item) => item.id !== id);
  return new Promise((resolve) => {
    resolve();
  });
}

function deleteAll(resourceName) {
  data[resourceName] = [];
  return new Promise((resolve) => {
    resolve([]);
  });
}

module.exports = {
  connectToDb,
  getAll,
  getById,
  create,
  update,
  deleteById,
  deleteAll,
};
