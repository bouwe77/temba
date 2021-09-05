const { resourceNames } = require("../../temba-config");

function validateResource(req, _, next) {
  const { resourceName } = req.requestInfo;

  if (!resourceName) return next();

  if (!resourceNames.includes(resourceName.toLowerCase())) {
    const error = new Error(`'${resourceName}' is an unknown resource`);
    error.status = 404;
    console.log(error.message);
    return next(error);
  }

  return next();
}

module.exports = { validateResource };
