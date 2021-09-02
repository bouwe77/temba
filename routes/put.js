const { query } = require("../data");
const { new404NotFoundError } = require("../errors");

async function handlePut(req, res, next) {
  const { resource, id } = req.requestInfo;

  let item = null;
  if (id) item = await query.getById(resource, id);

  if (!item) return next(new404NotFoundError(`ID '${id}' not found`));

  item = { ...req.body, id };

  const updatedItem = await query.update(resource, item);

  res.status(200).json(updatedItem).send();
}

module.exports = handlePut;
