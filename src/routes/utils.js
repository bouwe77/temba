function handleMethodNotAllowed(_, res) {
  res.status(405).json({ message: 'Method Not Allowed' })
}

export { handleMethodNotAllowed }
