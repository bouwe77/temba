const { parseUrl } = require("../urlParser");

function getResourceAndId(req, res, next) {
  let urlInfo = parseUrl(req.url);

  req.maklik = { ...req.maklik, ...urlInfo };

  console.log(req.maklik);

  return next();
}

module.exports = { getResourceAndId };
