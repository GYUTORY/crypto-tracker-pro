/**
 * 기술적 분석 결과를 담는 엔티티
 */
export class TechnicalAnalysis {
  constructor(
    private readonly _symbol: string,
    private readonly _price: string,
    private readonly _rsi: number,
    private readonly _macd: number,
    private readonly _macdSignal: number,
    private readonly _bollingerUpper: string,
    private readonly _bollingerLower: string,
    private readonly _ma20: string,
    private readonly _ma50: string,
    private readonly _volume: string,
    private readonly _volumeChange: string,
    private readonly _analysis: AnalysisResult
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this._symbol?.trim()) {
      throw new Error('심볼은 필수입니다');
    }
    if (this._rsi < 0 || this._rsi > 100) {
      throw new Error('RSI는 0-100 사이여야 합니다');
    }
    if (this._analysis.confidence < 0 || this._analysis.confidence > 100) {
      throw new Error('신뢰도는 0-100 사이여야 합니다');
    }
  }

  // 높은 신뢰도인지 확인
  isHighConfidence(): boolean {
    return this._analysis.confidence >= 70;
  }

  // 낮은 위험도인지 확인
  isLowRisk(): boolean {
    return this._analysis.riskLevel === 'low';
  }

  // 강한 신호인지 확인
  hasStrongSignal(): boolean {
    return this._analysis.overallSignal !== 'neutral';
  }

  // 위험 점수 반환
  getRiskScore(): number {
    const riskMap = { low: 1, medium: 2, high: 3 };
    return riskMap[this._analysis.riskLevel] || 2;
  }

  // Getters
  get symbol(): string {
    return this._symbol;
  }

  get price(): string {
    return this._price;
  }

  get rsi(): number {
    return this._rsi;
  }

  get macd(): number {
    return this._macd;
  }

  get macdSignal(): number {
    return this._macdSignal;
  }

  get bollingerUpper(): string {
    return this._bollingerUpper;
  }

  get bollingerLower(): string {
    return this._bollingerLower;
  }

  get ma20(): string {
    return this._ma20;
  }

  get ma50(): string {
    return this._ma50;
  }

  get volume(): string {
    return this._volume;
  }

  get volumeChange(): string {
    return this._volumeChange;
  }

  get analysis(): AnalysisResult {
    return this._analysis;
  }

  // 팩토리 메서드
  static create(
    symbol: string,
    price: string,
    technicalData: TechnicalData,
    analysis: AnalysisResult
  ): TechnicalAnalysis {
    return new TechnicalAnalysis(
      symbol,
      price,
      technicalData.rsi,
      technicalData.macd,
      technicalData.macdSignal,
      technicalData.bollingerUpper,
      technicalData.bollingerLower,
      technicalData.ma20,
      technicalData.ma50,
      technicalData.volume,
      technicalData.volumeChange,
      analysis
    );
  }
}

export interface TechnicalData {
  rsi: number;
  macd: number;
  macdSignal: number;
  bollingerUpper: string;
  bollingerLower: string;
  ma20: string;
  ma50: string;
  volume: string;
  volumeChange: string;
}

export interface AnalysisResult {
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
} 