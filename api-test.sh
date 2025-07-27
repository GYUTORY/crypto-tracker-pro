#!/bin/bash

# API 테스트 스크립트

BASE_URL="http://localhost:3000"
echo "API 테스트 시작"
echo "==============="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 테스트 함수
test_endpoint() {
    local endpoint=$1
    local description=$2
    local method=${3:-GET}
    
    echo -e "\n${BLUE}📡 테스트: $description${NC}"
    echo "엔드포인트: $method $BASE_URL$endpoint"
    echo "----------------------------------------"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -X "$method" -w "\nHTTP_STATUS:%{http_code}" "$BASE_URL$endpoint")
    fi
    
    # HTTP 상태 코드 추출
    http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
    response_body=$(echo "$response" | sed '/HTTP_STATUS:/d')
    
    # 응답 파싱 및 검증
    if command -v jq &> /dev/null; then
        result=$(echo "$response_body" | jq -r '.result // "unknown"')
        msg=$(echo "$response_body" | jq -r '.msg // "No message"')
        has_data=$(echo "$response_body" | jq -r 'has("result_data") // false')
        
        echo "응답 구조:"
        echo "  - result: $result"
        echo "  - msg: $msg"
        echo "  - has result_data: $has_data"
        echo "  - HTTP Status: $http_status"
        
        if [ "$result" = "true" ]; then
            echo -e "${GREEN}✅ 성공${NC}"
        elif [ "$result" = "false" ]; then
            echo -e "${RED}❌ 실패: $msg${NC}"
        else
            echo -e "${YELLOW}⚠️  알 수 없는 응답 형식${NC}"
        fi
        
        # 데이터가 있는 경우 일부 출력
        if [ "$has_data" = "true" ]; then
            echo "데이터 미리보기:"
            echo "$response_body" | jq '.result_data' | head -10
        fi
    else
        echo "응답 (jq 없음):"
        echo "$response_body"
        echo "HTTP Status: $http_status"
    fi
    
    echo ""
}

# 1. 기본 환영 메시지 테스트
test_endpoint "/" "기본 환영 메시지"

# 2. 헬스 체크 테스트
test_endpoint "/health" "헬스 체크"

# 3. 바이낸스 연결 상태 테스트
test_endpoint "/tcp/status" "바이낸스 WebSocket 연결 상태"

# 4. 메모리 가격 데이터 테스트
test_endpoint "/tcp/prices" "메모리 저장된 모든 가격 데이터"

# 5. 특정 암호화폐 가격 조회 테스트
echo -e "\n${YELLOW}🔍 특정 암호화폐 가격 조회 테스트${NC}"
echo "=================================="

# BTC 가격 조회
test_endpoint "/binance/price/BTCUSDT" "비트코인 가격 조회"

# ETH 가격 조회
test_endpoint "/binance/price/ETHUSDT" "이더리움 가격 조회"

# 잘못된 심볼 테스트
test_endpoint "/binance/price/INVALID" "잘못된 심볼 테스트"

# 6. 응답 구조 검증 테스트
echo -e "\n${YELLOW}🔍 응답 구조 검증 테스트${NC}"
echo "=================================="

if command -v jq &> /dev/null; then
    echo "BaseResponse 구조 검증:"
    
    # 헬스 체크 응답 구조 검증
    health_response=$(curl -s "$BASE_URL/health")
    
    echo "헬스 체크 응답 구조:"
    echo "$health_response" | jq '.'
    
    # 필수 필드 확인
    has_result=$(echo "$health_response" | jq -r 'has("result")')
    has_msg=$(echo "$health_response" | jq -r 'has("msg")')
    has_result_data=$(echo "$health_response" | jq -r 'has("result_data")')
    has_http_status=$(echo "$health_response" | jq -r 'has("httpStatus")')
    
    echo ""
    echo "필수 필드 확인:"
    echo "  - result: $has_result"
    echo "  - msg: $has_msg"
    echo "  - result_data: $has_result_data"
    echo "  - httpStatus: $has_http_status"
    
    if [ "$has_result" = "true" ] && [ "$has_msg" = "true" ] && [ "$has_result_data" = "true" ] && [ "$has_http_status" = "true" ]; then
        echo -e "${GREEN}✅ BaseResponse 구조가 올바릅니다!${NC}"
    else
        echo -e "${RED}❌ BaseResponse 구조에 문제가 있습니다.${NC}"
    fi
else
    echo "jq가 설치되어 있지 않아 구조 검증을 건너뜁니다."
fi

echo -e "\n${GREEN}🎉 API 테스트 완료!${NC}"
echo "==================================" 