var url = require("url");
const { query } = require("../data");

async function handlePost(req, res) {
  const { resourceName } = req.requestInfo;

  const newItem = await query.create(resourceName, req.body);

  res
    .set({
      Location: url.format({
        protocol: req.protocol,
        host: req.get("host"),
        pathname: `${resourceName}/${newItem.id}`,
      }),
    })
    .status(201)
    .json(newItem)
    .send();
}

module.exports = handlePost;
