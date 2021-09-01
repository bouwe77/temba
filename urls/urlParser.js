const { new404NotFoundError } = require("../errors");

function parseUrl(url) {
  if (!url || (url && !url.trim())) return { resource: null, id: null };

  segments = url.split("/").filter((i) => i);

  const resource = segments.length > 0 ? segments[0] : null;
  const id = segments.length > 1 ? segments[1] : null;

  return { resource, id };
}

module.exports = { parseUrl };
