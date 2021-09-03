require("dotenv").config();

const { getResourceAndId } = require("./urls/middleware/getResourceAndId");
const { errorHandler } = require("./errors/middleware/errorHandler");
const { validateResource } = require("./urls/middleware/validateResource");

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

//TODO Dit kan weg toch, want anders werken alle routes niet goed samen?
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
app.get("*", getResourceAndId, validateResource, handleGetResource);
app.post("*", getResourceAndId, validateResource, handlePost);
app.put("*", getResourceAndId, validateResource, handlePut);
app.delete("*", getResourceAndId, validateResource, handleDelete);

// All other methods to a specific URL are not allowed.
app.all("*", handleMethodNotAllowed);

// Error middleware.
app.use(errorHandler);

// Start the HTTP server.
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`🚀 http://localhost:${port}`);
});
