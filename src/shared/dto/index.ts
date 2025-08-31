/**
 * Shared DTOs - 전체 DTO 모음
 * 
 * 공통으로 사용되는 DTO들을 기능별로 분류하여 제공합니다.
 * 
 * 기능별 분류:
 * - Price: 가격 관련 DTO
 * - Prediction: 예측 관련 DTO
 * - Recommendation: 추천 관련 DTO
 * - Chart: 차트 관련 DTO
 * - Market: 시장 관련 DTO
 * - News: 뉴스 관련 DTO
 */

// 기본 응답 DTO
export { BaseResponseDto } from './base-response.dto';

// 가격 관련 DTO
export * from './price';

// 예측 관련 DTO
export * from './prediction';

// 추천 관련 DTO
export * from './recommendation';

// 차트 관련 DTO
export * from './chart';

// 시장 관련 DTO
export * from './market';

// 뉴스 관련 DTO
export * from './news';

