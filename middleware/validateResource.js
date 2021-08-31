const resources = ["songs"];

function validateResource(req, res, next) {
  const { resource } = req.maklik;

  if (!resources.includes(resource.toLowerCase())) {
    const error = new Error(`'${resource}' is an unknown resource`);
    error.status = 404;
    console.log(error.message);
    next(error);
  }

  next();
}

module.exports = { validateResource };
