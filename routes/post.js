const { query } = require("../data");

//TODO Add Location header

async function handlePost(req, res) {
  const { resourceName } = req.requestInfo;

  const newItem = await query.create(resourceName, req.body);

  res.status(201).json(newItem).send();
}

module.exports = handlePost;
