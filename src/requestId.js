const { v4: uuid } = require('uuid');
module.exports = function requestId(req, res, next) {
  const id = req.headers['x-request-id'] || uuid();
  req.id = id;
  res.setHeader('x-request-id', id);
  next();
};
