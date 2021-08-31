const query = require("../data/queries");

async function handlePut(req, res) {
  const { resource, id } = req.maklik;

  if (!id) {
    const error = new Error("bla bla");
    error.status = 404;
    next(error);
  }

  let item = await query.getById(resource, id);
  if (!item) {
    const error = new Error("bla bla");
    error.status = 404;
    next(error);
  }

  item = req.body;

  await query.update(resource, item);

  res.status(200).json(item).send();
}

module.exports = handlePut;
