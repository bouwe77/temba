function errorHandler(err, _, res) {
  console.log('errorHandler: ' + err.message)

  if (!err.status) err.status = 500

  return res.status(err.status).json({ message: err.message })
}

export { errorHandler }
