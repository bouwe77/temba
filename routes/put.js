const query = require("../data/queries");
const { get404NotFoundError } = require("./../errors");

async function handlePut(req, res) {
  const { resource, id } = req.maklik;

  let item = null;
  if (id) item = await query.getById(resource, id);

  if (!item) next(get404NotFoundError(`ID '${id}' not found`));

  item = req.body;

  await query.update(resource, item);

  res.status(200).json(item).send();
}

module.exports = handlePut;
