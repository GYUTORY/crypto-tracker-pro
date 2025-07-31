/**
 * 가격 정보를 담는 도메인 엔티티
 * 
 * 암호화폐의 현재 가격, 거래량, 변동률 등의 정보를 담고 있습니다.
 * 도메인 로직(비즈니스 규칙)을 포함하여 데이터의 유효성을 검증하고,
 * 가격 데이터의 만료 여부나 나이 등을 계산할 수 있습니다.
 */
export class Price {
  // private readonly로 선언하여 생성 후 값 변경을 방지 (불변성 보장)
  constructor(
    private readonly _symbol: string,        // 암호화폐 심볼 (예: BTCUSDT)
    private readonly _price: string,         // 현재 가격 (문자열로 받아 정밀도 보장)
    private readonly _timestamp: number,     // 생성 시간 (밀리초 단위)
    private readonly _volume?: string,       // 24시간 거래량 (선택적)
    private readonly _changePercent24h?: string // 24시간 변동률 (선택적)
  ) {
    this.validate(); // 생성자에서 즉시 유효성 검증
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
    
    // 가격이 0 이하인 경우 (음수 가격은 존재할 수 없음)
    if (!this._price || parseFloat(this._price) <= 0) {
      throw new Error('가격은 0보다 커야 합니다');
    }
    
    // 타임스탬프가 유효하지 않은 경우
    if (this._timestamp <= 0) {
      throw new Error('타임스탬프는 유효해야 합니다');
    }
  }

  /**
   * 데이터가 만료되었는지 확인
   * @param validityDuration 유효 기간 (밀리초)
   * @returns 만료 여부
   */
  isExpired(validityDuration: number): boolean {
    return Date.now() - this._timestamp > validityDuration;
  }

  /**
   * 데이터가 곧 만료될 예정인지 확인
   * 백그라운드 갱신을 위한 경고 임계값으로 사용됩니다.
   * @param warningThreshold 경고 임계값 (밀리초)
   * @returns 곧 만료될 예정인지 여부
   */
  isGettingOld(warningThreshold: number): boolean {
    return Date.now() - this._timestamp > warningThreshold;
  }

  /**
   * 데이터의 나이를 반환 (현재 시간 - 생성 시간)
   * @returns 데이터 나이 (밀리초)
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
  // readonly로 선언되어 외부에서 값 변경 불가
  get symbol(): string {
    return this._symbol;
  }

  get price(): string {
    return this._price;
  }

  get timestamp(): number {
    return this._timestamp;
  }

  get volume(): string | undefined {
    return this._volume;
  }

  get changePercent24h(): string | undefined {
    return this._changePercent24h;
  }

  /**
   * 새로운 가격 객체를 생성하는 팩토리 메서드
   * 현재 시간을 자동으로 설정하여 편의성을 제공합니다.
   */
  static create(
    symbol: string,
    price: string,
    volume?: string,
    changePercent24h?: string
  ): Price {
    return new Price(symbol, price, Date.now(), volume, changePercent24h);
  }

  /**
   * 기존 데이터로부터 가격 객체를 생성하는 팩토리 메서드
   * API 응답이나 데이터베이스에서 가져온 데이터를 변환할 때 사용합니다.
   */
  static fromData(data: {
    symbol: string;
    price: string;
    timestamp: number;
    volume?: string;
    changePercent24h?: string;
  }): Price {
    return new Price(
      data.symbol,
      data.price,
      data.timestamp,
      data.volume,
      data.changePercent24h
    );
  }

  /**
   * 객체를 평면 데이터로 변환
   * API 응답이나 데이터베이스 저장을 위해 사용됩니다.
   */
  toData() {
    return {
      symbol: this._symbol,
      price: this._price,
      timestamp: this._timestamp,
      volume: this._volume,
      changePercent24h: this._changePercent24h,
    };
  }
} 