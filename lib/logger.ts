import {format, transports, createLogger} from 'winston';
import DatadogWinston from 'datadog-winston';

const DATADOG_API_KEY = process.env.DATADOG_API_KEY;
if (typeof DATADOG_API_KEY !== 'string') {
  throw new Error('DATADOG_API_KEY is not defined');
}

const hostname = process.env?.NEXTAUTH_URL?.replace(/https?:\/\//, '') || 'unknown';

const logger = createLogger({
  level: 'debug',
  defaultMeta: {},
  format: format.json(),
  transports: [
    new DatadogWinston({
      apiKey: DATADOG_API_KEY,
      hostname,
      ddsource: 'next.js',
      ddtags: `env:${process.env.NODE_ENV}`,
    }),
    new transports.Console({
      stderrLevels: ['error'],
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
