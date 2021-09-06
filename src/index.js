import { getResourceAndId } from "./urls/middleware/getResourceAndId";
import { errorHandler } from "./errors/middleware/errorHandler";
import { createValidateResourceMiddleware } from "./urls/middleware/validateResource";

import { createRoutes } from "./routes";

import { createQuery } from "./data";

import express, { json } from "express";

function createServer(config) {
  if (!config) config = {};
  if (!config.resourceNames || config.resourceNames.length === 0)
    config.resourceNames = ["articles"];

  const validateResource = createValidateResourceMiddleware(
    config.resourceNames
  );

  const query = createQuery(config.connectionString);

  const app = express();
  app.use(json());

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

export function create(config) {
  return createServer(config);
}
