import {format, transports, createLogger} from 'winston';
import DatadogWinston from 'datadog-winston';

const IS_DEV = process.env.NODE_ENV === 'development';
const DATADOG_API_KEY = process.env.DATADOG_API_KEY;
if (typeof DATADOG_API_KEY !== 'string') {
  throw new Error('DATADOG_API_KEY is not defined');
}

const logger = createLogger({
  level: 'info',
  defaultMeta: {},
  format: format.json(),
  transports: [
    new DatadogWinston({
      apiKey: DATADOG_API_KEY,
      hostname: IS_DEV ? 'localhost' : 'app.trackerjam.com',
      ddsource: 'next.js',
      ddtags: 'env:process.env.NODE_ENV',
    }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.splat(),
        format.printf((info) => {
          // Stringify any additional properties that are not part of the standard log message
          const extraInfo = Object.assign({}, info);

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          delete extraInfo.level;
          delete extraInfo.message;
          delete extraInfo.timestamp;

          return `${info.timestamp} ${info.level}: ${info.message} ${JSON.stringify(extraInfo)}`;
        })
      ),
    }),
  ],
});

export {logger};
