const { createGetRoutes } = require("./get");
const { createPostRoutes } = require("./post");
const { createPutRoutes } = require("./put");
const { createDeleteRoutes } = require("./delete");

function handleMethodNotAllowed(_, res) {
  res.status(405).json({ message: "Method Not Allowed" });
}

function createRoutes(query) {
  const getRoutes = createGetRoutes(query);
  const postRoutes = createPostRoutes(query);
  const putRoutes = createPutRoutes(query);
  const deleteRoutes = createDeleteRoutes(query);

  return {
    ...getRoutes,
    ...postRoutes,
    ...putRoutes,
    ...deleteRoutes,
    handleMethodNotAllowed,
  };
}

module.exports = {
  createRoutes,
};
