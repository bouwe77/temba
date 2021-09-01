const query = require("../data/queries");

async function handleGetResource(req, res) {
  const { resource, id } = req.maklik;

  if (id) {
    const item = await query.getById(resource, id);

    if (!item) res.status(404);
    else res.status(200).json(item);
  } else {
    const items = await query.getAll(resource);
    res.status(200).json(items);
  }

  res.send();
}

function handleGetDefaultPage(_, res) {
  res.send("It works! (ツ)");
}

module.exports = { handleGetResource, handleGetDefaultPage };
