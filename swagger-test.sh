#!/bin/bash

# Swagger API 테스트 스크립트

BASE_URL="http://localhost:3000"
SWAGGER_URL="$BASE_URL/api-docs"

echo "Swagger API 테스트 시작"
echo "======================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 테스트 함수
test_swagger_endpoint() {
    local endpoint=$1
    local description=$2
    
    echo -e "\n${BLUE}테스트: $description${NC}"
    echo "엔드포인트: $endpoint"
    echo "----------------------------------------"
    
    response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$endpoint")
    
    # HTTP 상태 코드 추출
    http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
    response_body=$(echo "$response" | sed '/HTTP_STATUS:/d')
    
    if [ "$http_status" = "200" ]; then
        echo -e "${GREEN}✅ 성공 (HTTP $http_status)${NC}"
        
        # Swagger UI인지 확인
        if echo "$response_body" | grep -q "swagger-ui"; then
            echo -e "${GREEN}Swagger UI가 정상적으로 로드됨${NC}"
        else
            echo -e "${YELLOW}Swagger UI가 아닌 응답${NC}"
        fi
    else
        echo -e "${RED}❌ 실패 (HTTP $http_status)${NC}"
    fi
    
    echo ""
}

# 1. Swagger UI 접근 테스트
test_swagger_endpoint "$SWAGGER_URL" "Swagger UI 접근"

# 2. OpenAPI JSON 스키마 테스트
test_swagger_endpoint "$BASE_URL/api-docs-json" "OpenAPI JSON 스키마"

# 3. 기본 API 엔드포인트 테스트
echo -e "${YELLOW}기본 API 엔드포인트 테스트${NC}"
echo "=================================="

# 헬스체크
health_response=$(curl -s "$BASE_URL/health")
if command -v jq &> /dev/null; then
    health_result=$(echo "$health_response" | jq -r '.result // "unknown"')
    if [ "$health_result" = "true" ]; then
        echo -e "${GREEN}헬스체크 성공${NC}"
    else
        echo -e "${RED}헬스체크 실패${NC}"
    fi
else
    echo "헬스체크 응답: $health_response"
fi

# TCP 상태
tcp_response=$(curl -s "$BASE_URL/tcp/status")
if command -v jq &> /dev/null; then
    tcp_result=$(echo "$tcp_response" | jq -r '.result // "unknown"')
    if [ "$tcp_result" = "true" ]; then
        echo -e "${GREEN}TCP 상태 조회 성공${NC}"
    else
        echo -e "${RED}TCP 상태 조회 실패${NC}"
    fi
else
    echo "TCP 상태 응답: $tcp_response"
fi

# 바이낸스 가격 조회
binance_response=$(curl -s "$BASE_URL/binance/price/BTCUSDT")
if command -v jq &> /dev/null; then
    binance_result=$(echo "$binance_response" | jq -r '.result // "unknown"')
    if [ "$binance_result" = "true" ]; then
        echo -e "${GREEN}바이낸스 가격 조회 성공${NC}"
    else
        echo -e "${RED}바이낸스 가격 조회 실패${NC}"
    fi
else
    echo "바이낸스 가격 응답: $binance_response"
fi

# 4. Swagger 문서 접근 방법 안내
echo -e "\n${YELLOW}Swagger 문서 접근 방법${NC}"
echo "=================================="
echo -e "${BLUE}1. 브라우저에서 다음 URL 접속:${NC}"
echo "   $SWAGGER_URL"
echo ""
echo -e "${BLUE}2. API 테스트 방법:${NC}"
echo "   - 원하는 API 엔드포인트 클릭"
echo "   - 'Try it out' 버튼 클릭"
echo "   - 필요한 파라미터 입력"
echo "   - 'Execute' 버튼 클릭"
echo "   - 실시간 응답 확인"
echo ""
echo -e "${BLUE}3. API 태그별 분류:${NC}"
echo "   - health: 헬스체크 및 기본 정보"
echo "   - binance: 바이낸스 가격 데이터 API"
echo "   - tcp: WebSocket 연결 상태 및 메모리 데이터"
echo ""

# 5. 응답 형식 검증
echo -e "${YELLOW}응답 형식 검증${NC}"
echo "=================================="

if command -v jq &> /dev/null; then
    echo "BaseResponse 구조 검증:"
    
    # 필수 필드 확인
    has_result=$(echo "$health_response" | jq -r 'has("result")')
    has_msg=$(echo "$health_response" | jq -r 'has("msg")')
    has_result_data=$(echo "$health_response" | jq -r 'has("result_data")')
    has_code=$(echo "$health_response" | jq -r 'has("code")')
    
    echo "필수 필드 확인:"
    echo "  - result: $has_result"
    echo "  - msg: $has_msg"
    echo "  - result_data: $has_result_data"
    echo "  - code: $has_code"
    
    if [ "$has_result" = "true" ] && [ "$has_msg" = "true" ] && [ "$has_result_data" = "true" ] && [ "$has_code" = "true" ]; then
        echo -e "${GREEN}BaseResponse 구조가 올바릅니다!${NC}"
    else
        echo -e "${RED}BaseResponse 구조에 문제가 있습니다.${NC}"
    fi
else
    echo "jq가 설치되어 있지 않아 구조 검증을 건너뜁니다."
fi

echo -e "\n${GREEN}Swagger API 테스트 완료!${NC}"
echo "=============================================="
echo -e "${BLUE}Swagger 문서: $SWAGGER_URL${NC}"
echo -e "${BLUE}API 엔드포인트: $BASE_URL${NC}" 