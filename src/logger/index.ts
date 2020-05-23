import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.timestamp(),
    winston.format.printf(
      (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
    )
  ),
});

if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'error.log',
      level: 'error',
    })
  );
  logger.add(
    new winston.transports.File({
      filename: 'combined.log',
      level: 'info',
    })
  );
} else {
  logger.level = 'debug';
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logger.format),
    })
  );
}

export default logger;
