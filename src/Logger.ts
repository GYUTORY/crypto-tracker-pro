/**
 * Logger - Winston 기반 싱글톤 로깅 클래스
 * 
 * 이 클래스는 Winston을 사용하여 config 기반 로깅을 제공합니다.
 * 싱글톤 패턴으로 구현되어 어디서든 Logger.info() 형태로 사용할 수 있습니다.
 * 
 * 사용법:
 * import Logger from './Logger';
 * Logger.info('메시지', '컨텍스트');
 * Logger.error('에러 메시지', '컨텍스트');
 * 
 * 주요 기능:
 * - Config 기반 로깅 레벨 관리
 * - 콘솔 및 파일 로깅
 * - 로그 로테이션
 * - JSON 및 텍스트 포맷 지원
 * - 타임스탬프 및 컬러 지원
 */
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';
import * as config from 'config';

class LoggerClass {
  private logger: winston.Logger;
  private initialized = false;

  constructor() {
    this.initializeLogger();
  }

  /**
   * Winston 로거를 초기화합니다.
   */
  private initializeLogger(): void {
    if (this.initialized) return;

    try {
      const loggingConfig = config.get('logging');
      
      // 로그 레벨 설정
      const level = loggingConfig.level || 'info';
      
      // 포맷터 설정
      const formats = this.createFormats(loggingConfig);
      
      // 트랜스포트 설정
      const transports = this.createTransports(loggingConfig);
      
      // 로거 생성
      this.logger = winston.createLogger({
        level,
        format: formats.combined,
        transports,
        exitOnError: false,
      });

      this.initialized = true;
    } catch (error) {
      // config 로딩 실패 시 기본 설정으로 초기화
      // console.warn을 사용하여 Logger 초기화 전에 로그 출력
      console.warn('Failed to load logging config, using default settings:', error.message);
      this.initializeDefaultLogger();
    }
  }

  /**
   * 기본 로거를 초기화합니다.
   */
  private initializeDefaultLogger(): void {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
          let log = `${timestamp} [${level.toUpperCase()}]`;
          if (context) {
            log += ` [${context}]`;
          }
          log += `: ${message}`;
          
          if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
          }
          
          return log;
        })
      ),
      transports: [
        new winston.transports.Console()
      ],
      exitOnError: false,
    });

    this.initialized = true;
  }

  /**
   * 로그 포맷을 생성합니다.
   */
  private createFormats(config: any): any {
    const formats = [];
    
    // 타임스탬프 포맷
    if (config.timestamp !== false) {
      formats.push(winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }));
    }
    
    // JSON 포맷 또는 텍스트 포맷
    if (config.format === 'json') {
      formats.push(winston.format.json());
    } else {
      formats.push(winston.format.combine(
        winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
          let log = `${timestamp} [${level.toUpperCase()}]`;
          if (context) {
            log += ` [${context}]`;
          }
          log += `: ${message}`;
          
          if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
          }
          
          return log;
        })
      ));
    }
    
    // 컬러 포맷 (콘솔용)
    if (config.colorize !== false) {
      formats.push(winston.format.colorize());
    }
    
    return {
      combined: winston.format.combine(...formats),
      console: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
          let log = `${timestamp} [${level.toUpperCase()}]`;
          if (context) {
            log += ` [${context}]`;
          }
          log += `: ${message}`;
          
          if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
          }
          
          return log;
        })
      )
    };
  }

  /**
   * 로그 트랜스포트를 생성합니다.
   */
  private createTransports(config: any): winston.transport[] {
    const transports: winston.transport[] = [];
    
    // 콘솔 트랜스포트
    if (config.console !== false) {
      transports.push(new winston.transports.Console({
        format: this.createFormats(config).console
      }));
    }
    
    // 파일 트랜스포트
    if (config.file !== false && config.file) {
      try {
        const logDir = path.dirname(config.file);
        const logFile = path.basename(config.file, path.extname(config.file));
        
        // 로그 로테이션 설정
        const rotateTransport = new DailyRotateFile({
          filename: path.join(logDir, `${logFile}-%DATE%.log`),
          datePattern: 'YYYY-MM-DD',
          maxSize: config.maxSize || '20m',
          maxFiles: config.maxFiles || '14d',
          format: this.createFormats(config).combined,
          zippedArchive: true,
        });
        
        transports.push(rotateTransport);
      } catch (error) {
        // console.warn을 사용하여 Logger 초기화 전에 로그 출력
        console.warn('Failed to create file transport:', error.message);
      }
    }
    
    return transports;
  }

  /**
   * 에러 로깅
   */
  error(message: string, context?: string, meta?: any): void {
    this.logger.error(message, { context, ...meta });
  }

  /**
   * 경고 로깅
   */
  warn(message: string, context?: string, meta?: any): void {
    this.logger.warn(message, { context, ...meta });
  }

  /**
   * 정보 로깅
   */
  info(message: string, context?: string, meta?: any): void {
    this.logger.info(message, { context, ...meta });
  }

  /**
   * 디버그 로깅
   */
  debug(message: string, context?: string, meta?: any): void {
    this.logger.debug(message, { context, ...meta });
  }

  /**
   * 상세 로깅
   */
  verbose(message: string, context?: string, meta?: any): void {
    this.logger.verbose(message, { context, ...meta });
  }

  /**
   * 성능 측정 로깅
   */
  logPerformance(operation: string, startTime: number, context?: string): void {
    const duration = Date.now() - startTime;
    this.debug(`${operation} completed in ${duration}ms`, context);
  }

  /**
   * API 요청 로깅
   */
  logApiRequest(method: string, url: string, duration: number, statusCode: number, context?: string): void {
    const level = statusCode >= 400 ? 'warn' : 'info';
    const message = `${method} ${url} - ${statusCode} (${duration}ms)`;
    
    if (level === 'warn') {
      this.warn(message, context);
    } else {
      this.info(message, context);
    }
  }

  /**
   * 외부 API 호출 로깅
   */
  logExternalApi(service: string, endpoint: string, duration: number, success: boolean, context?: string): void {
    const status = success ? 'SUCCESS' : 'FAILED';
    const message = `${service} API ${endpoint} - ${status} (${duration}ms)`;
    
    if (success) {
      this.info(message, context);
    } else {
      this.warn(message, context);
    }
  }

  /**
   * 데이터베이스 쿼리 로깅
   */
  logDatabaseQuery(query: string, duration: number, context?: string): void {
    this.debug(`DB Query (${duration}ms): ${query}`, context);
  }

  /**
   * 로거 인스턴스를 반환합니다.
   */
  getLogger(): winston.Logger {
    return this.logger;
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const Logger = new LoggerClass();
export default Logger; 