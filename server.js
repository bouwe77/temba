const { getResourceAndId } = require("./urls/middleware/getResourceAndId");
const { errorHandler } = require("./errors/middleware/errorHandler");
const { validateResource } = require("./urls/middleware/validateResource");
const { validateId } = require("./urls/middleware/validateId");

const { handleGet, handlePost, handlePut, handleDelete } = require("./routes");

const express = require("express");
const app = express();
app.use(express.json());

// Middleware
app.use(getResourceAndId);
app.use(validateResource);
app.use(validateId);

// Routes
app.get("*", handleGet);
app.post("*", handlePost);
app.put("*", handlePut);
app.delete("*", handleDelete);

// Error middleware.
app.use(errorHandler);

// Start the HTTP server.
const port = 4467;
app.listen(port, () => {
  console.log(`🚀 http://localhost:${port}`);
});
