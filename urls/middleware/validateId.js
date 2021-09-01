function validateId(req, res, next) {
  const { id } = req.maklik;

  if (id && id.length !== 36) {
    const error = new Error(`ID '${id}' not found`);
    error.status = 404;
    console.log(error.message);
    return next(error);
  }

  return next();
}

module.exports = { validateId };
