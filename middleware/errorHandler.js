function errorHandler(err, req, res, next) {
  console.log("hello from errorHandler");
  console.log(err.message);

  if (err.status) {
    return res.status(err.status).json({ message: err.message });
  }

  next();
}

module.exports = { errorHandler };
