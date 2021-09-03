const data = {};

//TODO Refactor hasOwnProperty check so it's only called once

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

  const newItem = { ...item, id: String(new Date().getTime()) };

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
