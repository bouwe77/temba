function createCachingMiddleware(cacheControl) {
  return function addCacheHeaders(req, res, next) {
    if (req.method == 'GET') {
      res.set('Cache-control', cacheControl)
    } else {
      res.set('Cache-control', `no-store`)
    }

    return next()
  }
}

export { createCachingMiddleware }
