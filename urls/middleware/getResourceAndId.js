const { parseUrl } = require("../urlParser");

function getResourceAndId(req, res, next) {
  let urlInfo;
  try {
    urlInfo = parseUrl(req.url);
  } catch (error) {
    next(error);
  }

  req.maklik = { ...req.maklik, ...urlInfo };

  console.log(req.maklik);

  next();
}

module.exports = { getResourceAndId };
