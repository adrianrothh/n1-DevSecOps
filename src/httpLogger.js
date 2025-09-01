const morgan = require('morgan');
const logger = require('./logger');

morgan.token('id', (req) => req.id || '-');
morgan.token('body', (req) => {
  const clone = { ...(req.body || {}) };
  if (clone.password) clone.password = '***';
  if (clone.senha) clone.senha = '***';
  return JSON.stringify(clone);
});
morgan.token('query', (req) => JSON.stringify(req.query || {}));

const stream = {
  write: (message) => {
    try {
      const data = JSON.parse(message);
      logger.info('http_request', data);
    } catch {
      logger.info(message.trim());
    }
  }
};

const formatJson = (tokens, req, res) => JSON.stringify({
  request_id: tokens.id(req, res),
  method: tokens.method(req, res),
  url: tokens.url(req, res),
  status: res.statusCode, 
  response_time_ms: Number(tokens['response-time'](req, res)),
  content_length: tokens.res(req, res, 'content-length'),
  http_version: tokens['http-version'](req, res),
  user_agent: tokens['user-agent'](req, res),
  remote_addr: tokens['remote-addr'](req, res),
  query: tokens.query(req, res),
  body: tokens.body(req, res)
});

module.exports = morgan(formatJson, { stream });
