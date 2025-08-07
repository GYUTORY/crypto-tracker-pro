/**
 * 가격 예측 정보를 담는 도메인 엔티티
 * 
 * 암호화폐의 미래 가격 예측, 지지/저항선, 신뢰도 등의 정보를 담고 있습니다.
 * 도메인 로직(비즈니스 규칙)을 포함하여 예측 데이터의 유효성을 검증하고,
 * 예측의 신뢰도나 위험도를 평가할 수 있습니다.
 */
export class PricePrediction {
  // private readonly로 선언하여 생성 후 값 변경을 방지 (불변성 보장)
  constructor(
    private readonly _symbol: string,                    // 암호화폐 심볼 (예: BTCUSDT)
    private readonly _currentPrice: string,              // 현재 가격
    private readonly _predictions: TimeframePrediction[], // 시간대별 예측
    private readonly _supportLevels: string[],           // 지지선들
    private readonly _resistanceLevels: string[],        // 저항선들
    private readonly _confidence: number,                // 전체 예측 신뢰도 (0-100)
    private readonly _timestamp: number,                 // 예측 생성 시간
    private readonly _analysis: PredictionAnalysis       // AI 분석 결과
  ) {
    this.validate();
  }

  /**
   * 데이터 유효성 검증
   * 생성자에서 호출되어 잘못된 데이터가 객체에 저장되는 것을 방지합니다.
   */
  private validate(): void {
    // 심볼이 비어있거나 공백만 있는 경우
    if (!this._symbol?.trim()) {
      throw new Error('심볼은 필수입니다');
    }
    
    // 현재 가격이 0 이하인 경우
    if (!this._currentPrice || parseFloat(this._currentPrice) <= 0) {
      throw new Error('현재 가격은 0보다 커야 합니다');
    }
    
    // 신뢰도가 0-100 범위를 벗어나는 경우
    if (this._confidence < 0 || this._confidence > 100) {
      throw new Error('신뢰도는 0-100 사이여야 합니다');
    }
    
    // 타임스탬프가 유효하지 않은 경우
    if (this._timestamp <= 0) {
      throw new Error('타임스탬프는 유효해야 합니다');
    }
    
    // 예측 데이터가 비어있는 경우
    if (!this._predictions || this._predictions.length === 0) {
      throw new Error('예측 데이터는 필수입니다');
    }
  }

  /**
   * 예측이 만료되었는지 확인
   * @param validityDuration 유효 기간 (밀리초)
   * @returns 만료 여부
   */
  isExpired(validityDuration: number): boolean {
    return Date.now() - this._timestamp > validityDuration;
  }

  /**
   * 예측이 곧 만료될 예정인지 확인
   * 백그라운드 갱신을 위한 경고 임계값으로 사용됩니다.
   * @param warningThreshold 경고 임계값 (밀리초)
   * @returns 곧 만료될 예정인지 여부
   */
  isGettingOld(warningThreshold: number): boolean {
    return Date.now() - this._timestamp > warningThreshold;
  }

  /**
   * 높은 신뢰도인지 확인
   * @returns 높은 신뢰도 여부 (70% 이상)
   */
  isHighConfidence(): boolean {
    return this._confidence >= 70;
  }

  /**
   * 중간 신뢰도인지 확인
   * @returns 중간 신뢰도 여부 (40-69%)
   */
  isMediumConfidence(): boolean {
    return this._confidence >= 40 && this._confidence < 70;
  }

  /**
   * 낮은 신뢰도인지 확인
   * @returns 낮은 신뢰도 여부 (40% 미만)
   */
  isLowConfidence(): boolean {
    return this._confidence < 40;
  }

  /**
   * 특정 시간대의 예측을 가져오기
   * @param timeframe 시간대
   * @returns 해당 시간대의 예측 또는 null
   */
  getPredictionByTimeframe(timeframe: Timeframe): TimeframePrediction | null {
    return this._predictions.find(p => p.timeframe === timeframe) || null;
  }

  /**
   * 가장 높은 신뢰도의 예측을 가져오기
   * @returns 가장 높은 신뢰도의 예측
   */
  getHighestConfidencePrediction(): TimeframePrediction | null {
    if (this._predictions.length === 0) return null;
    
    return this._predictions.reduce((highest, current) => 
      current.confidence > highest.confidence ? current : highest
    );
  }

  /**
   * 가장 가까운 시간대의 예측을 가져오기
   * @returns 가장 가까운 시간대의 예측
   */
  getNearestTimeframePrediction(): TimeframePrediction | null {
    const timeframes = ['1h', '4h', '24h', '1w', '1m', '3m'];
    const currentIndex = timeframes.findIndex(tf => 
      this._predictions.some(p => p.timeframe === tf)
    );
    
    if (currentIndex === -1) return null;
    
    return this._predictions.find(p => p.timeframe === timeframes[currentIndex]) || null;
  }

  /**
   * 예측 데이터의 나이를 반환 (현재 시간 - 생성 시간)
   * @returns 예측 데이터 나이 (밀리초)
   */
  getAge(): number {
    return Date.now() - this._timestamp;
  }

  /**
   * 심볼 비교 (대소문자 무시)
   * @param symbol 비교할 심볼
   * @returns 동일한 심볼인지 여부
   */
  isSameSymbol(symbol: string): boolean {
    return this._symbol.toUpperCase() === symbol.toUpperCase();
  }

  // Getter 메서드들 - private 필드에 대한 안전한 접근 제공
  get symbol(): string {
    return this._symbol;
  }

  get currentPrice(): string {
    return this._currentPrice;
  }

  get predictions(): TimeframePrediction[] {
    return [...this._predictions]; // 배열 복사본 반환 (불변성 보장)
  }

  get supportLevels(): string[] {
    return [...this._supportLevels]; // 배열 복사본 반환
  }

  get resistanceLevels(): string[] {
    return [...this._resistanceLevels]; // 배열 복사본 반환
  }

  get confidence(): number {
    return this._confidence;
  }

  get timestamp(): number {
    return this._timestamp;
  }

  get analysis(): PredictionAnalysis {
    return { ...this._analysis }; // 객체 복사본 반환
  }

  /**
   * 새로운 예측 객체를 생성하는 팩토리 메서드
   * 현재 시간을 자동으로 설정하여 편의성을 제공합니다.
   */
  static create(
    symbol: string,
    currentPrice: string,
    predictions: TimeframePrediction[],
    supportLevels: string[],
    resistanceLevels: string[],
    confidence: number,
    analysis: PredictionAnalysis
  ): PricePrediction {
    return new PricePrediction(
      symbol,
      currentPrice,
      predictions,
      supportLevels,
      resistanceLevels,
      confidence,
      Date.now(),
      analysis
    );
  }

  /**
   * 기존 데이터로부터 예측 객체를 생성하는 팩토리 메서드
   * API 응답이나 데이터베이스에서 가져온 데이터를 변환할 때 사용합니다.
   */
  static fromData(data: {
    symbol: string;
    currentPrice: string;
    predictions: TimeframePrediction[];
    supportLevels: string[];
    resistanceLevels: string[];
    confidence: number;
    timestamp: number;
    analysis: PredictionAnalysis;
  }): PricePrediction {
    return new PricePrediction(
      data.symbol,
      data.currentPrice,
      data.predictions,
      data.supportLevels,
      data.resistanceLevels,
      data.confidence,
      data.timestamp,
      data.analysis
    );
  }

  /**
   * 객체를 평면 데이터로 변환
   * API 응답이나 데이터베이스 저장을 위해 사용됩니다.
   */
  toData() {
    return {
      symbol: this._symbol,
      currentPrice: this._currentPrice,
      predictions: this._predictions,
      supportLevels: this._supportLevels,
      resistanceLevels: this._resistanceLevels,
      confidence: this._confidence,
      timestamp: this._timestamp,
      analysis: this._analysis,
    };
  }
}

/**
 * 시간대별 예측 정보
 */
export interface TimeframePrediction {
  timeframe: Timeframe;           // 시간대 (1h, 4h, 24h, 1w, 1m, 3m)
  predictedPrice: string;         // 예측 가격
  confidence: number;             // 해당 시간대 예측 신뢰도 (0-100)
  changePercent: number;          // 현재 대비 변화율 (%)
  trend: 'bullish' | 'bearish' | 'neutral'; // 추세
  explanation: string;            // 예측 근거 설명
}

/**
 * 예측 시간대 타입
 */
export type Timeframe = '1h' | '4h' | '24h' | '1w' | '1m' | '3m';

/**
 * AI 분석 결과
 */
export interface PredictionAnalysis {
  marketSentiment: 'bullish' | 'bearish' | 'neutral';  // 시장 심리
  keyFactors: string[];                                 // 주요 영향 요인들
  riskFactors: string[];                                // 위험 요인들
  recommendation: string;                               // 투자 추천
  disclaimer: string;                                   // 면책 조항
} 