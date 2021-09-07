import { parseUrl } from '../urlParser'

function getResourceAndId(req, _, next) {
  let urlInfo = parseUrl(req.url)

  req.requestInfo = { ...req.requestInfo, ...urlInfo }

  return next()
}

export { getResourceAndId }
