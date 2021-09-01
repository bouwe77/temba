const query = require("../data/queries");

async function handleDelete(req, res) {
  const { resource, id } = req.requestInfo;

  if (id) {
    const item = await query.getById(resource, id);
    if (item) {
      await query.deleteById(resource, id);
    }
  } else {
    await query.deleteAll(resource);
  }

  res.status(204).send();
}

module.exports = handleDelete;
