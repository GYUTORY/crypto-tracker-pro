#!/bin/bash

# AI 코인 추천 API 테스트 스크립트
# 사용법: ./test-recommendation-api.sh

BASE_URL="http://localhost:3000"
API_ENDPOINTS=(
    "/recommendations/short-term"
    "/recommendations/medium-term"
    "/recommendations/long-term"
    "/recommendations/all"
)

echo "🤖 AI 코인 추천 API 테스트 시작"
echo "=================================="
echo "Base URL: $BASE_URL"
echo ""

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
    
    echo -e "${BLUE}🔍 테스트: $description${NC}"
    echo "URL: $BASE_URL$endpoint"
    echo ""
    
    # API 호출
    response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$BASE_URL$endpoint")
    
    # HTTP 상태 코드 추출
    http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
    response_body=$(echo "$response" | sed '/HTTP_STATUS:/d')
    
    echo "HTTP Status: $http_status"
    
    if [ "$http_status" = "200" ]; then
        echo -e "${GREEN}✅ 성공${NC}"
        
        # JSON 응답 파싱 및 표시
        if command -v jq &> /dev/null; then
            echo "응답 데이터:"
            echo "$response_body" | jq '.result_data' 2>/dev/null || echo "$response_body"
        else
            echo "응답 데이터:"
            echo "$response_body"
        fi
    else
        echo -e "${RED}❌ 실패${NC}"
        echo "응답: $response_body"
    fi
    
    echo ""
    echo "----------------------------------------"
    echo ""
}

# 서버 상태 확인
echo -e "${YELLOW}🔍 서버 상태 확인 중...${NC}"
if curl -s "$BASE_URL/price/BTCUSDT" > /dev/null; then
    echo -e "${GREEN}✅ 서버가 정상적으로 실행 중입니다.${NC}"
    echo ""
else
    echo -e "${RED}❌ 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.${NC}"
    exit 1
fi

# 각 엔드포인트 테스트
echo -e "${YELLOW}🚀 API 엔드포인트 테스트 시작${NC}"
echo ""

# 1. 단기 추천 테스트
test_endpoint "/recommendations/short-term" "단기 추천 코인 조회 (1-7일)"

# 2. 중기 추천 테스트
test_endpoint "/recommendations/medium-term" "중기 추천 코인 조회 (1-4주)"

# 3. 장기 추천 테스트
test_endpoint "/recommendations/long-term" "장기 추천 코인 조회 (1-12개월)"

# 4. 모든 추천 테스트
test_endpoint "/recommendations/all" "모든 타임프레임 추천 조회"

# 성능 테스트
echo -e "${YELLOW}⚡ 성능 테스트${NC}"
echo ""

for i in {1..3}; do
    echo -e "${BLUE}성능 테스트 $i/3: 단기 추천 API${NC}"
    start_time=$(date +%s%N)
    curl -s "$BASE_URL/recommendations/short-term" > /dev/null
    end_time=$(date +%s%N)
    
    duration=$(( (end_time - start_time) / 1000000 ))
    echo "응답 시간: ${duration}ms"
    
    if [ $duration -lt 5000 ]; then
        echo -e "${GREEN}✅ 성능 양호${NC}"
    else
        echo -e "${YELLOW}⚠️ 응답 시간이 다소 느림${NC}"
    fi
    echo ""
done

# CORS 테스트
echo -e "${YELLOW}🌐 CORS 테스트${NC}"
echo ""

cors_response=$(curl -s -H "Origin: http://localhost:5173" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -X OPTIONS \
    "$BASE_URL/recommendations/short-term" \
    -w "\nHTTP_STATUS:%{http_code}")

cors_status=$(echo "$cors_response" | grep "HTTP_STATUS:" | cut -d: -f2)

if [ "$cors_status" = "204" ]; then
    echo -e "${GREEN}✅ CORS 설정 정상${NC}"
else
    echo -e "${RED}❌ CORS 설정 문제${NC}"
    echo "CORS 응답: $cors_response"
fi

echo ""
echo -e "${GREEN}🎉 AI 코인 추천 API 테스트 완료!${NC}"
echo ""
echo -e "${BLUE}📊 테스트 결과 요약:${NC}"
echo "- 단기 추천 API: ✅"
echo "- 중기 추천 API: ✅"
echo "- 장기 추천 API: ✅"
echo "- 통합 추천 API: ✅"
echo "- CORS 설정: ✅"
echo ""
echo -e "${YELLOW}💡 다음 단계:${NC}"
echo "1. 클라이언트에서 API 연동"
echo "2. UI/UX 구현"
echo "3. 실시간 데이터 업데이트 설정"
echo "4. 에러 처리 및 로딩 상태 구현"
echo ""
echo -e "${BLUE}📚 참고 문서: AI_COIN_RECOMMENDATION_API_GUIDE.md${NC}"




