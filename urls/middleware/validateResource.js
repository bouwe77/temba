const resources = ["songs"];

function validateResource(req, _, next) {
  const { resource } = req.maklik;

  if (!resource || !resources.includes(resource.toLowerCase())) {
    const error = new Error(`'${resource}' is an unknown resource`);
    error.status = 404;
    console.log(error.message);
    next(error);
  }

  next();
}

module.exports = { validateResource };
