function new404NotFoundError(message = "Not Found") {
  const error = new Error(message);
  error.status = 404;
  return error;
}

export default {
  new404NotFoundError,
};
