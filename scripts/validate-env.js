#!/usr/bin/env node

/**
 * 환경 변수 검증 스크립트
 * 
 * 애플리케이션 시작 전에 필수 환경 변수들이 올바르게 설정되었는지 검증합니다.
 * 
 * 검증 항목:
 * 1. .env 파일 존재 여부
 * 2. 필수 환경 변수 존재 여부
 * 3. 환경 변수 값 유효성 검사
 * 4. 선택적 환경 변수 확인
 */

const fs = require('fs');
const path = require('path');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// 로그 함수들
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// .env 파일 확인
function checkEnvFile() {
  logInfo('환경 변수 파일 확인 중...');
  
  const possiblePaths = [
    path.join(process.cwd(), 'config', '.env'),
    path.join(process.cwd(), '.env')
  ];
  
  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      logSuccess(`환경 변수 파일 발견: ${envPath}`);
      return envPath;
    }
  }
  
  logError('환경 변수 파일을 찾을 수 없습니다.');
  logInfo('다음 위치에서 .env 파일을 확인해주세요:');
  logInfo('  - config/.env (권장)');
  logInfo('  - .env (루트 디렉토리)');
  return null;
}

// .env 파일 로드
function loadEnvFile(envPath) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        envVars[key.trim()] = value;
      }
    });
    
    logSuccess(`환경 변수 ${Object.keys(envVars).length}개 로드 완료`);
    return envVars;
  } catch (error) {
    logError(`환경 변수 파일 로드 실패: ${error.message}`);
    return null;
  }
}

// 필수 환경 변수 검증
function validateRequiredVars(envVars) {
  logInfo('필수 환경 변수 검증 중...');
  
  const requiredVars = [
    'NODE_ENV',
    'PORT',
    'BINANCE_API_KEY',
    'BINANCE_SECRET_KEY',
    'GOOGLE_AI_API_KEY',
    'JWT_SECRET'
  ];
  
  const missingVars = [];
  
  for (const varName of requiredVars) {
    if (!envVars[varName] || envVars[varName].trim() === '') {
      missingVars.push(varName);
    } else {
      logSuccess(`${varName}: 설정됨`);
    }
  }
  
  if (missingVars.length > 0) {
    logError(`필수 환경 변수가 누락되었습니다: ${missingVars.join(', ')}`);
    return false;
  }
  
  logSuccess('모든 필수 환경 변수가 설정되었습니다.');
  return true;
}

// 환경 변수 값 검증
function validateVarValues(envVars) {
  logInfo('환경 변수 값 검증 중...');
  
  const validations = [
    {
      name: 'NODE_ENV',
      validator: (value) => ['development', 'production', 'test'].includes(value),
      message: 'NODE_ENV는 development, production, test 중 하나여야 합니다.'
    },
    {
      name: 'PORT',
      validator: (value) => {
        const port = parseInt(value);
        return !isNaN(port) && port > 0 && port <= 65535;
      },
      message: 'PORT는 1-65535 사이의 유효한 숫자여야 합니다.'
    },
    {
      name: 'BINANCE_API_KEY',
      validator: (value) => value.length >= 10,
      message: 'BINANCE_API_KEY는 최소 10자 이상이어야 합니다.'
    },
    {
      name: 'BINANCE_SECRET_KEY',
      validator: (value) => value.length >= 10,
      message: 'BINANCE_SECRET_KEY는 최소 10자 이상이어야 합니다.'
    },
    {
      name: 'GOOGLE_AI_API_KEY',
      validator: (value) => value.length >= 10,
      message: 'GOOGLE_AI_API_KEY는 최소 10자 이상이어야 합니다.'
    },
    {
      name: 'JWT_SECRET',
      validator: (value) => value.length >= 32,
      message: 'JWT_SECRET는 최소 32자 이상이어야 합니다.'
    }
  ];
  
  let allValid = true;
  
  for (const validation of validations) {
    const value = envVars[validation.name];
    if (value && !validation.validator(value)) {
      logError(`${validation.name}: ${validation.message}`);
      allValid = false;
    } else if (value) {
      logSuccess(`${validation.name}: 유효한 값`);
    }
  }
  
  return allValid;
}

// 선택적 환경 변수 확인
function checkOptionalVars(envVars) {
  logInfo('선택적 환경 변수 확인 중...');
  
  const optionalVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_DATABASE',
    'REDIS_HOST',
    'REDIS_PORT',
    'REDIS_PASSWORD',
    'CORS_ORIGIN',
    'RATE_LIMIT_TTL',
    'RATE_LIMIT_LIMIT',
    'LOG_LEVEL'
  ];
  
  const setVars = [];
  const unsetVars = [];
  
  for (const varName of optionalVars) {
    if (envVars[varName] && envVars[varName].trim() !== '') {
      setVars.push(varName);
    } else {
      unsetVars.push(varName);
    }
  }
  
  if (setVars.length > 0) {
    logSuccess(`설정된 선택적 변수: ${setVars.join(', ')}`);
  }
  
  if (unsetVars.length > 0) {
    logWarning(`설정되지 않은 선택적 변수: ${unsetVars.join(', ')}`);
  }
  
  return true;
}

// 메인 검증 함수
function main() {
  log(colors.bright + colors.cyan + '🔍 환경 변수 검증 시작' + colors.reset);
  log('');
  
  // 1. .env 파일 확인
  const envPath = checkEnvFile();
  if (!envPath) {
    process.exit(1);
  }
  
  // 2. .env 파일 로드
  const envVars = loadEnvFile(envPath);
  if (!envVars) {
    process.exit(1);
  }
  
  log('');
  
  // 3. 필수 환경 변수 검증
  if (!validateRequiredVars(envVars)) {
    log('');
    logError('필수 환경 변수 검증 실패');
    process.exit(1);
  }
  
  log('');
  
  // 4. 환경 변수 값 검증
  if (!validateVarValues(envVars)) {
    log('');
    logError('환경 변수 값 검증 실패');
    process.exit(1);
  }
  
  log('');
  
  // 5. 선택적 환경 변수 확인
  checkOptionalVars(envVars);
  
  log('');
  log(colors.bright + colors.green + '🎉 환경 변수 검증 완료! 애플리케이션을 시작할 수 있습니다.' + colors.reset);
  log('');
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = {
  checkEnvFile,
  loadEnvFile,
  validateRequiredVars,
  validateVarValues,
  checkOptionalVars
};
