const { v4: uuidv4 } = require("uuid");

const data = {};

//TODO Refactor hasOwnProperty check

function getAll(resourceName) {
  if (!data.hasOwnProperty(resourceName)) data[resourceName] = [];

  return new Promise((resolve) => {
    resolve(data[resourceName]);
  });
}

function getById(resourceName, id) {
  if (!data.hasOwnProperty(resourceName)) data[resourceName] = [];

  return new Promise((resolve) => {
    resolve(data[resourceName].find((item) => item.id === id));
  });
}

function create(resourceName, item) {
  if (!data.hasOwnProperty(resourceName)) data[resourceName] = [];

  const newItem = { ...item, id: uuidv4() };

  data[resourceName] = [...data[resourceName], newItem];

  return new Promise((resolve) => {
    resolve(newItem);
  });
}

function update(resourceName, item) {
  if (!data.hasOwnProperty(resourceName)) data[resourceName] = [];

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
  if (!data.hasOwnProperty(resourceName)) data[resourceName] = [];

  data[resourceName].filter((item) => item.id !== id);
  return new Promise((resolve) => {
    resolve();
  });
}

function deleteAll(resourceName) {
  if (!data.hasOwnProperty(resourceName)) data[resourceName] = [];

  data[resourceName] = [];
  return new Promise((resolve) => {
    resolve([]);
  });
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  deleteById,
  deleteAll,
};
