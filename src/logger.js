const os = require('os');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, errors, json } = format;

const service = process.env.SERVICE_NAME || 'n1-devsecops';
const env = process.env.DD_ENV || process.env.NODE_ENV || 'dev';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service, env, hostname: os.hostname() },
  format: combine(errors({ stack: true }), timestamp(), json()),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/app.log', maxsize: 5_000_000, maxFiles: 3 })
  ],
  exceptionHandlers: [ new transports.File({ filename: 'logs/exceptions.log' }) ],
  rejectionHandlers: [ new transports.File({ filename: 'logs/rejections.log' }) ],
});
console.log(
  '[logtail] enabled =',
  !!process.env.LOGTAIL_SOURCE_TOKEN,
  'token suffix =',
  (process.env.LOGTAIL_SOURCE_TOKEN || '').slice(-6)
);


// Datadog HTTP//
if (process.env.DATADOG_API_KEY) {
  const DatadogWinston = require('datadog-winston');
  logger.add(new DatadogWinston({
    apiKey: process.env.DATADOG_API_KEY,
    hostname: process.env.DD_HOSTNAME || os.hostname(),
    service,
    ddsource: 'nodejs',
    ddtags: `env:${env},service:${service}`
  }));
}

// —— Better Stack (Logtail) ——
try {
  if (process.env.LOGTAIL_SOURCE_TOKEN) {
    const { Logtail } = require("@logtail/node");
    const { LogtailTransport } = require("@logtail/winston");
    const os = require("os");

const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN, {
  endpoint: process.env.LOGTAIL_ENDPOINT || "https://in.eu.logtail.com",
});
    // Enriquecimento automático
    logtail.use(async (log) => ({
      ...log,
      service: process.env.SERVICE_NAME || "n1-devsecops",
      env: process.env.NODE_ENV || "dev",
      hostname: os.hostname(),
    }));

    logger.add(new LogtailTransport(logtail));
  }
} catch (e) {
  console.warn("Logtail disabled:", e.message);
}


module.exports = logger;
