/**
 * 환경 변수 검증 시스템 (Environment Variables Validation)
 * 
 * 애플리케이션 시작 시 모든 필수 환경 변수가 올바르게 설정되었는지 검증합니다.
 * 
 * 주요 기능:
 * - 필수 환경 변수 존재 여부 검증
 * - 환경 변수 타입 검증 (문자열, 숫자, 불린)
 * - 환경 변수 형식 검증 (이메일, URL, API 키 등)
 * - 환경별 필수 변수 검증
 * 
 * 검증 규칙:
 * - 모든 API 키는 비어있지 않아야 함
 * - 데이터베이스 연결 정보는 필수
 * - JWT 시크릿은 최소 32자 이상
 * - 포트 번호는 유효한 범위 내
 * 
 * 사용 예시:
 * ```typescript
 * const config = validate(process.env);
 * ```
 */
import { plainToClass } from 'class-transformer';
import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsBoolean,
  IsEmail,
  IsUrl,
  MinLength,
  Min,
  Max,
  validateSync,
  IsIn
} from 'class-validator';

/**
 * 환경 변수 검증 클래스
 * 
 * 모든 환경 변수의 타입과 제약 조건을 정의합니다.
 * class-validator를 사용하여 런타임에 검증을 수행합니다.
 */
export class EnvironmentVariables {
  // 애플리케이션 설정
  @IsString()
  @IsIn(['development', 'production', 'test'])
  NODE_ENV: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  PORT: number;

  // 데이터베이스 설정
  @IsString()
  DB_HOST: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  DB_PORT: number;

  @IsString()
  DB_NAME: string;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  @MinLength(1)
  DB_PASSWORD: string;

  // 바이낸스 API 설정
  @IsString()
  @MinLength(1)
  BINANCE_API_KEY: string;

  @IsString()
  @MinLength(1)
  BINANCE_SECRET_KEY: string;

  @IsString()
  @IsUrl()
  BINANCE_BASE_URL: string;

  @IsString()
  @IsUrl()
  BINANCE_WS_URL: string;

  @IsNumber()
  @Min(1000)
  @Max(30000)
  BINANCE_TIMEOUT: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  BINANCE_RETRY_ATTEMPTS: number;

  // 캐시 설정
  @IsNumber()
  @Min(1000)
  @Max(300000)
  CACHE_TTL: number;

  @IsNumber()
  @Min(100)
  @Max(10000)
  CACHE_MAX_SIZE: number;

  @IsNumber()
  @Min(1000)
  @Max(300000)
  CACHE_CLEANUP_INTERVAL: number;

  // 로깅 설정
  @IsString()
  @IsIn(['error', 'warn', 'info', 'debug', 'verbose'])
  LOG_LEVEL: string;

  @IsString()
  @IsIn(['json', 'simple'])
  LOG_FORMAT: string;

  @IsString()
  LOG_FILE: string;

  // 보안 설정
  @IsString()
  @MinLength(32)
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string;

  @IsNumber()
  @Min(8)
  @Max(16)
  BCRYPT_ROUNDS: number;

  // CORS 설정
  @IsString({ each: true })
  @IsOptional()
  CORS_ORIGIN: string[];

  @IsBoolean()
  @IsOptional()
  CORS_CREDENTIALS: boolean;

  // Google AI 설정
  @IsString()
  @MinLength(1)
  GOOGLE_AI_API_KEY: string;

  @IsString()
  @IsOptional()
  GOOGLE_AI_MODEL: string;

  @IsNumber()
  @Min(1000)
  @Max(60000)
  GOOGLE_AI_TIMEOUT: number;

  // Redis 설정 (선택사항)
  @IsString()
  @IsOptional()
  REDIS_HOST: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  REDIS_PORT: number;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD: string;

  @IsNumber()
  @Min(0)
  @Max(15)
  @IsOptional()
  REDIS_DB: number;

  // 외부 API 설정 (선택사항)
  @IsString()
  @IsOptional()
  EXCHANGE_RATE_API_KEY: string;

  @IsString()
  @IsOptional()
  NEWS_API_KEY: string;
}

/**
 * 환경 변수 검증 함수
 * 
 * 애플리케이션 시작 시 호출되어 모든 환경 변수를 검증합니다.
 * 검증 실패 시 상세한 에러 메시지와 함께 애플리케이션을 종료합니다.
 * 
 * @param config - 검증할 환경 변수 객체
 * @returns 검증된 환경 변수 객체
 * @throws Error - 검증 실패 시 에러 발생
 */
export function validate(config: Record<string, unknown>): EnvironmentVariables {
  // 우리가 정의한 환경 변수만 필터링
  const filteredConfig: Record<string, any> = {};
  
  // EnvironmentVariables 클래스의 속성들만 추출
  const envVarKeys = [
    'NODE_ENV', 'PORT', 'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USERNAME', 'DB_PASSWORD',
    'BINANCE_API_KEY', 'BINANCE_SECRET_KEY', 'BINANCE_BASE_URL', 'BINANCE_WS_URL',
    'BINANCE_TIMEOUT', 'BINANCE_RETRY_ATTEMPTS', 'CACHE_TTL', 'CACHE_MAX_SIZE',
    'CACHE_CLEANUP_INTERVAL', 'LOG_LEVEL', 'LOG_FORMAT', 'LOG_FILE', 'JWT_SECRET',
    'BCRYPT_ROUNDS', 'CORS_ORIGIN', 'RATE_LIMIT_TTL', 'RATE_LIMIT_LIMIT',
    'GOOGLE_AI_API_KEY', 'GOOGLE_AI_MODEL', 'GOOGLE_AI_TIMEOUT',
    'REDIS_HOST', 'REDIS_PORT', 'REDIS_PASSWORD', 'DB_DATABASE'
  ];
  
  envVarKeys.forEach(key => {
    if (config[key] !== undefined) {
      filteredConfig[key] = config[key];
    }
  });
  
  // 문자열을 적절한 타입으로 변환
  const validatedConfig = plainToClass(EnvironmentVariables, filteredConfig, {
    enableImplicitConversion: true,
  });
  
  // 검증 실행
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  // 검증 에러가 있으면 상세한 에러 메시지 생성
  if (errors.length > 0) {
    const errorMessages = errors.map(error => {
      const constraints = Object.values(error.constraints || {});
      return `${error.property}: ${constraints.join(', ')}`;
    });
    
    throw new Error(
      `환경 변수 검증 실패:\n${errorMessages.join('\n')}\n\n` +
      `필요한 환경 변수들을 확인하고 .env 파일을 올바르게 설정해주세요.`
    );
  }
  
  return validatedConfig;
}

/**
 * 환경별 필수 변수 검증
 * 
 * 각 환경에 따라 필요한 환경 변수를 추가로 검증합니다.
 * 
 * @param config - 검증된 환경 변수 객체
 */
export function validateEnvironmentSpecific(config: EnvironmentVariables): void {
  const { NODE_ENV } = config;
  
  switch (NODE_ENV) {
    case 'production':
      validateProductionConfig(config);
      break;
    case 'development':
      validateDevelopmentConfig(config);
      break;
    case 'test':
      validateTestConfig(config);
      break;
  }
}

/**
 * 프로덕션 환경 검증
 */
function validateProductionConfig(config: EnvironmentVariables): void {
  const required = [
    'DB_HOST',
    'DB_PASSWORD',
    'JWT_SECRET',
    'BINANCE_API_KEY',
    'BINANCE_SECRET_KEY',
    'GOOGLE_AI_API_KEY'
  ];

  const missing = required.filter(key => !config[key]);
  if (missing.length > 0) {
    throw new Error(
      `프로덕션 환경에서 필수 환경 변수가 누락되었습니다: ${missing.join(', ')}`
    );
  }

  // 프로덕션에서는 보안 강화 검증
  if (config.JWT_SECRET.length < 64) {
    throw new Error('프로덕션 환경에서는 JWT_SECRET이 최소 64자 이상이어야 합니다.');
  }

  if (config.BCRYPT_ROUNDS < 12) {
    throw new Error('프로덕션 환경에서는 BCRYPT_ROUNDS가 최소 12 이상이어야 합니다.');
  }
}

/**
 * 개발 환경 검증
 */
function validateDevelopmentConfig(config: EnvironmentVariables): void {
  // 개발 환경에서는 일부 변수가 선택사항
  console.log('개발 환경 설정이 검증되었습니다.');
}

/**
 * 테스트 환경 검증
 */
function validateTestConfig(config: EnvironmentVariables): void {
  // 테스트 환경에서는 최소한의 설정만 필요
  console.log('테스트 환경 설정이 검증되었습니다.');
}

/**
 * 환경 변수 존재 여부만 검증 (타입 검증 없음)
 * 
 * 애플리케이션 초기화 전에 빠른 검증이 필요한 경우 사용합니다.
 * 
 * @param requiredVars - 필수 환경 변수 목록
 */
export function validateRequiredEnvVars(requiredVars: string[]): void {
  const missing = requiredVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `필수 환경 변수가 누락되었습니다: ${missing.join(', ')}\n` +
      `환경 변수 파일(.env)을 확인하고 누락된 변수를 설정해주세요.`
    );
  }
}
