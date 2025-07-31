/**
 * 로깅 유틸리티
 */
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

class Logger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'crypto-tracker-pro' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        new DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d'
        })
      ]
    });
  }

  info(message: string, context?: string, meta?: any): void {
    this.logger.info(message, { context, ...meta });
  }

  error(message: string, context?: string, meta?: any): void {
    this.logger.error(message, { context, ...meta });
  }

  warn(message: string, context?: string, meta?: any): void {
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: any): void {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, meta?: any): void {
    this.logger.verbose(message, { context, ...meta });
  }
}

export default new Logger(); 