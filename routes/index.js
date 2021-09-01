const { handleGetResource, handleGetDefaultPage } = require("./get");
const handlePost = require("./post");
const handlePut = require("./put");
const handleDelete = require("./delete");

function handleMethodNotAllowed(req, res) {
  res.status(405).send("Method Not Allowed");
}

module.exports = {
  handleGetResource,
  handleGetDefaultPage,
  handlePost,
  handlePut,
  handleDelete,
  handleMethodNotAllowed,
};
