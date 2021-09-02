function validateId(req, res, next) {
  const { id } = req.requestInfo;

  //TODO Do we need ID validation???

  // if (!id) {
  //   const error = new Error(`ID '${id}' not found`);
  //   error.status = 404;
  //   console.log(error.message);
  //   return next(error);
  // }

  return next();
}

module.exports = { validateId };
