/**
 * 가격 정보 도메인 엔티티 (Price Domain Entity)
 * 
 * 암호화폐의 현재 가격, 거래량, 변동률 등의 정보를 담는 핵심 비즈니스 객체입니다.
 * 
 * 주요 특징:
 * - 불변성 (Immutability): 생성 후 값 변경 불가
 * - 자체 검증 (Self-Validation): 생성자에서 데이터 유효성 검증
 * - 비즈니스 로직 포함: 만료 여부, 나이 계산 등
 * - 도메인 규칙 적용: 가격은 양수여야 함, 심볼은 필수 등
 * 
 * Clean Architecture 원칙:
 * - 외부 시스템에 전혀 의존하지 않는 순수한 도메인 객체
 * - 비즈니스 규칙을 캡슐화하여 데이터 무결성 보장
 * - Repository 인터페이스를 통해서만 데이터 접근
 * 
 * 사용 예시:
 * ```typescript
 * const price = Price.create('BTCUSDT', '45000.50');
 * console.log(price.isExpired(30000)); // 30초 만료 여부 확인
 * console.log(price.getAge()); // 데이터 나이 확인
 * ```
 */
export class Price {
  /**
   * Price 엔티티 생성자 (Price Entity Constructor)
   * 
   * 암호화폐 가격 정보를 담는 엔티티를 생성합니다.
   * 
   * @param _symbol - 암호화폐 심볼 (예: BTCUSDT, ETHUSDT)
   * @param _price - 현재 가격 (문자열로 받아 정밀도 보장)
   * @param _timestamp - 생성 시간 (밀리초 단위, Unix timestamp)
   * @param _volume - 24시간 거래량 (선택적, 포맷된 문자열)
   * @param _changePercent24h - 24시간 변동률 (선택적, 문자열)
   * 
   * 특징:
   * - private readonly로 선언하여 생성 후 값 변경을 방지 (불변성 보장)
   * - 생성자에서 즉시 유효성 검증 수행
   * - 문자열로 가격을 받아 부동소수점 정밀도 문제 방지
   */
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
   * 데이터 유효성 검증 (Data Validation)
   * 
   * 생성자에서 호출되어 잘못된 데이터가 객체에 저장되는 것을 방지합니다.
   * 도메인 규칙을 적용하여 데이터 무결성을 보장합니다.
   * 
   * 검증 규칙:
   * 1. 심볼은 비어있거나 공백만 있으면 안 됨
   * 2. 가격은 0보다 커야 함 (음수 가격은 존재할 수 없음)
   * 3. 타임스탬프는 유효해야 함 (0보다 커야 함)
   * 
   * @throws Error - 유효성 검증 실패 시 에러 발생
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