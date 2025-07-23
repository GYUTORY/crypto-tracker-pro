#!/bin/bash

# Crypto Tracker Pro 테스트 실행 스크립트
# 다양한 테스트 옵션을 제공합니다.

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 테스트 타입
UNIT_TESTS="unit"
E2E_TESTS="e2e"
ALL_TESTS="all"
COVERAGE="coverage"
WATCH="watch"

# 기본값
TEST_TYPE=$UNIT_TESTS
VERBOSE=false

# 도움말 함수
show_help() {
    echo -e "${BLUE}Crypto Tracker Pro 테스트 실행기${NC}"
    echo "=================================="
    echo ""
    echo "사용법: $0 [옵션]"
    echo ""
    echo "옵션:"
    echo "  -t, --type TYPE     테스트 타입 선택 (unit|e2e|all|coverage|watch)"
    echo "  -v, --verbose       상세한 출력"
    echo "  -h, --help          이 도움말 표시"
    echo ""
    echo "테스트 타입:"
    echo "  unit       단위 테스트만 실행 (기본값)"
    echo "  e2e        E2E 테스트만 실행"
    echo "  all        모든 테스트 실행"
    echo "  coverage   커버리지와 함께 테스트 실행"
    echo "  watch      파일 변경 감지 모드로 테스트 실행"
    echo ""
    echo "예시:"
    echo "  $0                    # 단위 테스트 실행"
    echo "  $0 -t e2e            # E2E 테스트 실행"
    echo "  $0 -t coverage -v    # 커버리지 테스트 상세 출력"
    echo "  $0 -t watch          # 감시 모드로 테스트 실행"
}

# 인수 파싱
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--type)
            TEST_TYPE="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}알 수 없는 옵션: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# 테스트 타입 검증
case $TEST_TYPE in
    unit|e2e|all|coverage|watch)
        ;;
    *)
        echo -e "${RED}잘못된 테스트 타입: $TEST_TYPE${NC}"
        echo "사용 가능한 타입: unit, e2e, all, coverage, watch"
        exit 1
        ;;
esac

# 테스트 실행 함수
run_unit_tests() {
    echo -e "${BLUE}🔬 단위 테스트 실행 중...${NC}"
    echo "=================================="
    
    if [ "$VERBOSE" = true ]; then
        npm run test -- --verbose
    else
        npm run test
    fi
}

run_e2e_tests() {
    echo -e "${BLUE}🌐 E2E 테스트 실행 중...${NC}"
    echo "=================================="
    
    if [ "$VERBOSE" = true ]; then
        npm run test:e2e -- --verbose
    else
        npm run test:e2e
    fi
}

run_all_tests() {
    echo -e "${BLUE}🚀 모든 테스트 실행 중...${NC}"
    echo "=================================="
    
    echo -e "${YELLOW}1. 단위 테스트 실행${NC}"
    run_unit_tests
    
    echo ""
    echo -e "${YELLOW}2. E2E 테스트 실행${NC}"
    run_e2e_tests
}

run_coverage_tests() {
    echo -e "${BLUE}📊 커버리지 테스트 실행 중...${NC}"
    echo "=================================="
    
    if [ "$VERBOSE" = true ]; then
        npm run test:cov -- --verbose
    else
        npm run test:cov
    fi
}

run_watch_tests() {
    echo -e "${BLUE}👀 감시 모드로 테스트 실행 중...${NC}"
    echo "=================================="
    echo "파일 변경을 감지하여 자동으로 테스트를 재실행합니다."
    echo "종료하려면 Ctrl+C를 누르세요."
    echo ""
    
    npm run test:watch
}

# 메인 실행 로직
echo -e "${GREEN}🎯 Crypto Tracker Pro 테스트 시작${NC}"
echo "=================================="
echo "테스트 타입: $TEST_TYPE"
echo "상세 출력: $VERBOSE"
echo ""

# 의존성 확인
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm이 설치되어 있지 않습니다.${NC}"
    exit 1
fi

# node_modules 확인
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules가 없습니다. 의존성을 설치합니다...${NC}"
    npm install
fi

# 테스트 실행
case $TEST_TYPE in
    unit)
        run_unit_tests
        ;;
    e2e)
        run_e2e_tests
        ;;
    all)
        run_all_tests
        ;;
    coverage)
        run_coverage_tests
        ;;
    watch)
        run_watch_tests
        ;;
esac

# 결과 출력
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ 테스트가 성공적으로 완료되었습니다!${NC}"
else
    echo ""
    echo -e "${RED}❌ 테스트 실행 중 오류가 발생했습니다.${NC}"
    exit 1
fi 