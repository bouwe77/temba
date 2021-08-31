function getResourceAndId(req, res, next) {
  const segments = req.url.split("/");

  const resource = segments.length > 1 ? segments[1] : "";
  const id = segments.length > 2 ? segments[2] : null;

  req.maklik = { ...req.maklik, resource, id };

  console.log(req.maklik);

  next();
}

module.exports = { getResourceAndId };
