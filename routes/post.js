const query = require("../data/queries");

async function handlePost(req, res) {
  const { resource, id } = req.maklik;

  const newItem = await query.create(resource, req.body);

  res.status(201).json(newItem).send();
}

module.exports = handlePost;
