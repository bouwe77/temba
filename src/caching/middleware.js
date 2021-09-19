function addCacheHeaders(req, res, next) {
  if (req.method == 'GET') {
    res.set('Cache-control', `public, max-age=300`)
  } else {
    res.set('Cache-control', `no-store`)
  }

  return next()
}

export { addCacheHeaders }
