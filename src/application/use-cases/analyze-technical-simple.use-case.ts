/**
 * 간단한 기술적 분석 유스케이스
 * 
 * 이 클래스는 Clean Architecture의 Use Case 패턴을 구현하여
 * 암호화폐 기술적 분석 비즈니스 로직을 캡슐화합니다.
 * 
 * 주요 기능:
 * - 바이낸스 API에서 실시간 가격 데이터 조회
 * - 기술적 지표 계산 (간단한 버전)
 * - AI 분석 수행
 * - 결과 반환
 * 
 * Clean Architecture에서의 역할:
 * - Application Layer에 위치
 * - 비즈니스 로직 캡슐화
 * - Domain Layer의 Repository 인터페이스 사용
 * - Infrastructure Layer와 분리
 * 
 * 사용 예시:
 * ```typescript
 * const useCase = new AnalyzeTechnicalSimpleUseCase(
 *   binanceRepository, 
 *   aiRepository
 * );
 * const result = await useCase.execute({ symbol: 'BTCUSDT' });
 * ```
 */
import { Injectable, Inject } from '@nestjs/common';
import { BaseResponse, BaseService } from '../../shared/base-response';
import { BinanceRepository } from '../../domain/repositories/binance-repository.interface';
import { AiRepository } from '../../domain/repositories/ai-repository.interface';
import Logger from '../../shared/logger';

/**
 * 기술적 분석 요청 데이터 인터페이스
 * 
 * @property symbol - 분석할 암호화폐 심볼 (예: 'BTCUSDT', 'ETHUSDT')
 * 
 * 사용 예시:
 * ```typescript
 * const request: AnalyzeTechnicalSimpleRequest = {
 *   symbol: 'BTCUSDT'
 * };
 * ```
 */
export interface AnalyzeTechnicalSimpleRequest {
  symbol: string;
}

/**
 * 기술적 분석 응답 데이터 인터페이스
 * 
 * @property symbol - 분석된 암호화폐 심볼
 * @property price - 현재 가격
 * @property analysis - AI 분석 결과 (각 지표별 분석 포함)
 * 
 * 분석 결과 구조:
 * - rsi: RSI 지표 분석 (과매수/과매도 판단)
 * - macd: MACD 지표 분석 (매수/매도 신호)
 * - bollinger: 볼린저 밴드 분석 (가격 위치 및 신호)
 * - movingAverages: 이동평균 분석 (단기/장기 평균 비교)
 * - overallSignal: 종합 매매 신호
 * - confidence: 분석 신뢰도 (0-100)
 * - simpleAdvice: 초보자를 위한 조언
 * - riskLevel: 위험도 (low/medium/high)
 * - riskExplanation: 위험도 설명
 */
export interface AnalyzeTechnicalSimpleResponse {
  symbol: string;
  price: string;
  analysis: {
    rsi: {
      value: number;
      signal: 'buy' | 'sell' | 'neutral';
      explanation: string;
    };
    macd: {
      value: number;
      signal: 'buy' | 'sell' | 'neutral';
      explanation: string;
    };
    bollinger: {
      position: 'upper' | 'middle' | 'lower';
      signal: 'buy' | 'sell' | 'neutral';
      explanation: string;
    };
    movingAverages: {
      signal: 'buy' | 'sell' | 'neutral';
      explanation: string;
    };
    overallSignal: 'buy' | 'sell' | 'neutral';
    confidence: number;
    simpleAdvice: string;
    riskLevel: 'low' | 'medium' | 'high';
    riskExplanation: string;
  };
}

/**
 * 간단한 기술적 분석 유스케이스 클래스
 * 
 * 이 클래스는 Clean Architecture의 Use Case 패턴을 구현합니다.
 * 
 * 주요 특징:
 * - 단일 책임 원칙: 기술적 분석만 담당
 * - 의존성 주입: Repository 인터페이스를 통한 외부 시스템과 분리
 * - 비즈니스 로직 캡슐화: 복잡한 분석 과정을 단순한 execute 메서드로 제공
 * 
 * 동작 과정:
 * 1. 바이낸스 API에서 실시간 가격 데이터 조회
 * 2. 기술적 지표 계산 (현재는 간단한 임시 값 사용)
 * 3. AI 분석 수행
 * 4. 결과 반환
 */
@Injectable()
export class AnalyzeTechnicalSimpleUseCase extends BaseService {
  /**
   * 생성자 - 의존성 주입
   * 
   * @param binanceRepository - 바이낸스 API 접근을 위한 Repository
   * @param aiRepository - AI 분석을 위한 Repository
   * 
   * @Inject 데코레이터 설명:
   * - '@Inject('BinanceRepository')': 문자열 토큰을 사용한 의존성 주입
   * - 이는 NestJS의 Provider 시스템에서 해당 토큰으로 등록된 서비스를 주입받음
   * - Clean Architecture에서 외부 시스템과의 결합도를 낮추는 방법
   */
  constructor(
    @Inject('BinanceRepository')
    private readonly binanceRepository: BinanceRepository,
    @Inject('AiRepository')
    private readonly aiRepository: AiRepository
  ) {
    // 부모 클래스(BaseService) 생성자 호출
    super();
  }

  /**
   * 기술적 분석 실행 메서드
   * 
   * @param request - 분석 요청 데이터
   * @returns BaseResponse<AnalyzeTechnicalSimpleResponse> - 분석 결과
   * 
   * 동작 과정:
   * 1. 입력 데이터 검증 및 전처리
   * 2. 바이낸스 API에서 가격 데이터 조회
   * 3. 기술적 지표 계산 (현재는 임시 값)
   * 4. AI 분석 수행
   * 5. 결과 반환
   * 
   * 에러 처리:
   * - 각 단계별로 try-catch로 감싸서 적절한 에러 메시지 반환
   * - BaseService의 success/fail 메서드 사용
   */
  async execute(request: AnalyzeTechnicalSimpleRequest): Promise<BaseResponse<AnalyzeTechnicalSimpleResponse>> {
    try {
      // 1. 입력 데이터 추출 및 전처리
      const { symbol } = request;
      
      // 심볼을 대문자로 변환 (바이낸스 API 요구사항)
      const upperSymbol = symbol.toUpperCase();

      // 2. 바이낸스 API에서 실시간 가격 데이터 조회
      // Repository 인터페이스를 통해 외부 시스템과 분리
      const priceData = await this.binanceRepository.getCurrentPrice(upperSymbol);
      
      // 3. 기술적 지표 계산 (간단한 버전)
      // 현재는 임시 값들을 사용 (실제로는 복잡한 계산 로직이 들어갈 수 있음)
      const technicalData = {
        rsi: 50, // 임시 값 (실제로는 과거 데이터로 계산)
        macd: 0, // 임시 값
        macdSignal: 0, // 임시 값
        // 볼린저 밴드: 현재 가격 기준으로 ±2% 범위 설정
        bollingerUpper: (parseFloat(priceData.price) * 1.02).toString(),
        bollingerLower: (parseFloat(priceData.price) * 0.98).toString(),
        // 이동평균: 현재는 현재 가격과 동일하게 설정
        ma20: priceData.price,
        ma50: priceData.price,
        volume: '1000000', // 임시 거래량
        volumeChange: '0' // 임시 거래량 변화율
      };

      // 4. AI 분석 수행
      // Repository 인터페이스를 통해 AI 서비스 호출
      const analysis = await this.aiRepository.analyzeTechnicalIndicators(
        upperSymbol,
        priceData.price,
        technicalData
      );

      // 5. 성공 결과 반환
      // BaseService의 success 메서드 사용
      return this.success({
        symbol: upperSymbol,
        price: priceData.price,
        analysis: analysis.analysis // AI 분석 결과
      }, `${upperSymbol} 기술적 분석 완료`);

    } catch (error) {
      // 에러 발생 시 로그 및 실패 결과 반환
      Logger.error(`기술적 분석 중 오류: ${error.message}`);
      return this.fail(`${request.symbol} 기술적 분석 실패`);
    }
  }
} 