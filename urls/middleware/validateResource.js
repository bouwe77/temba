const resources = ["songs"];

function validateResource(req, _, next) {
  const { resource } = req.requestInfo;

  if (!resource) return next();

  if (!resources.includes(resource.toLowerCase())) {
    const error = new Error(`'${resource}' is an unknown resource`);
    error.status = 404;
    console.log(error.message);
    return next(error);
  }

  return next();
}

module.exports = { validateResource };
