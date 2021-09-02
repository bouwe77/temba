const { query } = require("../data");

async function handlePost(req, res) {
  const { resource, id } = req.requestInfo;

  const newItem = await query.create(resource, req.body);

  res.status(201).json(newItem).send();
}

module.exports = handlePost;
