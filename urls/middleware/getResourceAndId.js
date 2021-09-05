const { parseUrl } = require("../urlParser");

function getResourceAndId(req, _, next) {
  let urlInfo = parseUrl(req.url);

  req.requestInfo = { ...req.requestInfo, ...urlInfo };

  console.log(req.requestInfo);

  return next();
}

module.exports = { getResourceAndId };
