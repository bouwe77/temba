const { getResourceAndId } = require("./urls/middleware/getResourceAndId");
const { errorHandler } = require("./errors/middleware/errorHandler");
const {
  createValidateResourceMiddle,
} = require("./urls/middleware/validateResource");

const { createRoutes } = require("./routes");

const { createQuery } = require("./data");

const express = require("express");

function createServer(config) {
  if (!config) throw new Error("Please provide a config object");
  if (!config.resourceNames || config.resourceNames.length === 0)
    config.resourceNames = ["songs", "articles"];

  const validateResource = createValidateResourceMiddle(config.resourceNames);

  const query = createQuery(config.connectionString);

  const app = express();
  app.use(express.json());

  // Routes

  const routes = createRoutes(query);

  // A GET to the root URL shows a default message.
  app.get("/", routes.handleGetDefaultPage);

  // All other requests to the root URL are not allowed.
  app.all("/", routes.handleMethodNotAllowed);

  // GET, POST, PUT and DELETE to a specific URL are handled.
  app.get("*", getResourceAndId, validateResource, routes.handleGetResource);
  app.post("*", getResourceAndId, validateResource, routes.handlePost);
  app.put("*", getResourceAndId, validateResource, routes.handlePut);
  app.delete("*", getResourceAndId, validateResource, routes.handleDelete);

  // All other methods to a specific URL are not allowed.
  app.all("*", routes.handleMethodNotAllowed);

  // Error middleware.
  app.use(errorHandler);

  return app;
}

module.exports = {
  create: (config) => createServer(config),
};
