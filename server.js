const { getResourceAndId } = require("./urls/middleware/getResourceAndId");
const { errorHandler } = require("./errors/middleware/errorHandler");
const { validateResource } = require("./urls/middleware/validateResource");
const { validateId } = require("./urls/middleware/validateId");

const {
  handleGetResource,
  handleGetDefaultPage,
  handlePost,
  handlePut,
  handleDelete,
  handleMethodNotAllowed,
} = require("./routes");

const express = require("express");
const app = express();
app.use(express.json());

// Middleware
// app.use(getResourceAndId);
// app.use(validateResource);
// app.use(validateId);

// Routes

// A GET to the root URL shows a default message.
app.get("/", handleGetDefaultPage);

// All other requests to the root URL are not allowed.
app.all("/", handleMethodNotAllowed);

// GET, POST, PUT and DELETE to a specific URL are handled.
app.get("*", getResourceAndId, validateResource, validateId, handleGetResource);
app.post("*", getResourceAndId, validateResource, validateId, handlePost);
app.put("*", getResourceAndId, validateResource, validateId, handlePut);
app.delete("*", getResourceAndId, validateResource, validateId, handleDelete);

// All other methods to a specific URL are not allowed.
app.all("*", handleMethodNotAllowed);

// Error middleware.
app.use(errorHandler);

// Start the HTTP server.
const port = 4467;
app.listen(port, () => {
  console.log(`🚀 http://localhost:${port}`);
});
