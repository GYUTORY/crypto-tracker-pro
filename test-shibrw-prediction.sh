#!/bin/bash

# SHIBKRW AI 예측 기능 테스트 스크립트
echo "=== SHIBKRW AI 예측 기능 테스트 ==="

# 서버 상태 확인
echo "1. 서버 상태 확인"
curl -s http://localhost:3000/health || echo "서버가 실행되지 않았습니다. npm run start:dev로 서버를 먼저 실행해주세요."

echo -e "\n2. SHIBKRW 기본 예측 테스트 (GET)"
curl -X GET "http://localhost:3000/prediction/SHIBKRW" | jq '.'

echo -e "\n3. SHIBKRW POST 방식 예측 테스트"
curl -X POST http://localhost:3000/prediction/SHIBKRW \
  -H "Content-Type: application/json" \
  -d '{}' \
  | jq '.'

echo -e "\n4. SHIBKRW 강제 새로고침 예측 테스트 (GET)"
curl -X GET "http://localhost:3000/prediction/SHIBKRW?forceRefresh=true" | jq '.'

echo -e "\n5. SHIBKRW 특정 시간대 예측 테스트 (GET)"
curl -X GET "http://localhost:3000/prediction/SHIBKRW?timeframes=1h,24h,1w" | jq '.'

echo -e "\n6. SHIBKRW POST 방식 특정 시간대 예측 테스트"
curl -X POST http://localhost:3000/prediction/SHIBKRW \
  -H "Content-Type: application/json" \
  -d '{"timeframes": ["1h", "24h", "1w"], "forceRefresh": true}' \
  | jq '.'

echo -e "\n7. 다른 KRW 페어 테스트 (BTCKRW)"
curl -X GET "http://localhost:3000/prediction/BTCKRW" | jq '.'

echo -e "\n8. USDT 페어 테스트 (SHIBUSDT)"
curl -X GET "http://localhost:3000/prediction/SHIBUSDT" | jq '.'

echo -e "\n9. 잘못된 심볼 테스트 (에러 처리 확인)"
curl -X GET "http://localhost:3000/prediction/INVALID" | jq '.'

echo -e "\n=== 테스트 완료 ===" 