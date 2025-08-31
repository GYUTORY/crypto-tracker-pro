import { Injectable, Inject } from '@nestjs/common';
import { BinanceRepository } from '@/domain/repositories/market';

/**
 * 거래 가능한 코인 목록 조회 요청
 */
export interface GetTradingSymbolsRequest {
  filter?: string; // 필터링할 키워드 (예: 'BTC', 'USDT')
  limit?: number;  // 반환할 최대 개수
}

/**
 * 거래 가능한 코인 목록 조회 응답
 */
export interface GetTradingSymbolsResponse {
  symbols: string[];
  totalCount: number;
  filteredCount: number;
  categories: {
    usdt: string[];
    btc: string[];
    eth: string[];
    krw: string[];
    others: string[];
  };
  popularSymbols: string[];
  symbolNames: { [symbol: string]: string }; // 심볼별 한국어 이름
  symbolPrices: { [symbol: string]: { price: string; timestamp: number } }; // 심볼별 현재 가격
}

/**
 * 거래 가능한 코인 목록 조회 유스케이스
 * 
 * 바이낸스에서 거래 가능한 모든 심볼을 조회하고,
 * 카테고리별로 분류하여 제공합니다.
 */
@Injectable()
export class GetTradingSymbolsUseCase {
  // 인기 심볼 목록 (거래량 기준)
  private readonly POPULAR_SYMBOLS = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT',
    'DOTUSDT', 'DOGEUSDT', 'AVAXUSDT', 'MATICUSDT', 'LINKUSDT',
    'UNIUSDT', 'LTCUSDT', 'BCHUSDT', 'XLMUSDT', 'VETUSDT',
    'SHIBUSDT', 'ETCUSDT' // 시바이누, 이더리움 클래식 추가
  ];

  constructor(
    @Inject('BinanceRepository')
    private readonly binanceRepository: BinanceRepository
  ) {}

  /**
   * 거래 가능한 코인 목록 조회 실행
   */
  async execute(request: GetTradingSymbolsRequest = {}): Promise<GetTradingSymbolsResponse> {
    try {
      const { filter = '', limit } = request;

      // 바이낸스에서 모든 거래 가능한 심볼 조회
      const allSymbols = await this.binanceRepository.getTradingSymbols();
      
      // 필터 적용
      let filteredSymbols = allSymbols;
      if (filter) {
        filteredSymbols = allSymbols.filter(symbol => 
          symbol.toLowerCase().includes(filter.toLowerCase())
        );
      }

      // 개수 제한 적용
      if (limit && limit > 0) {
        filteredSymbols = filteredSymbols.slice(0, limit);
      }

      // 카테고리별 분류
      const categories = this.categorizeSymbols(filteredSymbols);

      // 인기 심볼 필터링 (실제 존재하는 심볼만)
      const popularSymbols = this.POPULAR_SYMBOLS.filter(symbol => 
        filteredSymbols.includes(symbol)
      );

      // 심볼별 한국어 이름 매핑
      const symbolNames = this.getSymbolNames(filteredSymbols);

      // 심볼별 현재 가격 조회 (최대 20개까지만 조회하여 성능 최적화)
      const symbolPrices = await this.getSymbolPrices(filteredSymbols.slice(0, 20));

      return {
        symbols: filteredSymbols,
        totalCount: allSymbols.length,
        filteredCount: filteredSymbols.length,
        categories,
        popularSymbols,
        symbolNames,
        symbolPrices
      };
    } catch (error) {
      throw new Error(`거래 가능한 코인 목록 조회 실패: ${error.message}`);
    }
  }

  /**
   * 심볼을 카테고리별로 분류
   */
  private categorizeSymbols(symbols: string[]): GetTradingSymbolsResponse['categories'] {
    const categories = {
      usdt: [] as string[],
      btc: [] as string[],
      eth: [] as string[],
      krw: [] as string[],
      others: [] as string[]
    };

    symbols.forEach(symbol => {
      if (symbol.endsWith('USDT')) {
        categories.usdt.push(symbol);
      } else if (symbol.endsWith('BTC')) {
        categories.btc.push(symbol);
      } else if (symbol.endsWith('ETH')) {
        categories.eth.push(symbol);
      } else if (symbol.endsWith('KRW')) {
        categories.krw.push(symbol);
      } else {
        categories.others.push(symbol);
      }
    });

    return categories;
  }

  /**
   * 심볼별 한국어 이름 매핑
   */
  private getSymbolNames(symbols: string[]): { [symbol: string]: string } {
    const symbolNames: { [symbol: string]: string } = {};
    
    symbols.forEach(symbol => {
      symbolNames[symbol] = this.getKoreanName(symbol);
    });
    
    return symbolNames;
  }

  /**
   * 심볼별 현재 가격 조회
   */
  private async getSymbolPrices(symbols: string[]): Promise<{ [symbol: string]: { price: string; timestamp: number } }> {
    const prices: { [symbol: string]: { price: string; timestamp: number } } = {};
    
    for (const symbol of symbols) {
      try {
        const price = await this.binanceRepository.getSymbolPrice(symbol);
        // 가격 포맷팅: 매우 작은 값도 제대로 표시
        const formattedPrice = this.formatPrice(price);
        prices[symbol] = { price: formattedPrice, timestamp: Date.now() };
      } catch (error) {
        console.error(`Failed to get price for ${symbol}:`, error.message);
        // 에러 타입에 따라 다른 메시지 표시
        let errorMessage = '가격 조회 실패';
        if (error.message.includes('symbol') || error.message.includes('잘못된 심볼')) {
          errorMessage = '거래되지 않는 심볼';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'API 제한 초과';
        } else if (error.message.includes('network')) {
          errorMessage = '네트워크 오류';
        } else if (error.message.includes('가져올 수 없습니다')) {
          errorMessage = '일시적 오류';
        }
        prices[symbol] = { price: errorMessage, timestamp: Date.now() };
      }
    }
    return prices;
  }

  /**
   * 가격 포맷팅: 매우 작은 값도 제대로 표시
   */
  private formatPrice(price: string): string {
    const numPrice = parseFloat(price);
    
    // 0.0001 미만인 경우 과학적 표기법 사용
    if (numPrice < 0.0001 && numPrice > 0) {
      return numPrice.toExponential(4);
    }
    
    // 0.0001 이상 1 미만인 경우 소수점 6자리까지
    if (numPrice < 1 && numPrice >= 0.0001) {
      return numPrice.toFixed(6);
    }
    
    // 1 이상 1000 미만인 경우 소수점 4자리까지
    if (numPrice < 1000 && numPrice >= 1) {
      return numPrice.toFixed(4);
    }
    
    // 1000 이상인 경우 소수점 2자리까지
    if (numPrice >= 1000) {
      return numPrice.toFixed(2);
    }
    
    // 기본값
    return price;
  }

  /**
   * 심볼에 따른 한국어 이름 반환
   */
  private getKoreanName(symbol: string): string {
    const nameMap: { [key: string]: string } = {
      // 주요 코인들
      'BTCUSDT': '비트코인',
      'ETHUSDT': '이더리움',
      'BNBUSDT': '바이낸스 코인',
      'ADAUSDT': '에이다',
      'SOLUSDT': '솔라나',
      'DOTUSDT': '폴카닷',
      'DOGEUSDT': '도지코인',
      'SHIBUSDT': '시바이누',
      'AVAXUSDT': '아발란체',
      'MATICUSDT': '폴리곤',
      'LINKUSDT': '체인링크',
      'UNIUSDT': '유니스왑',
      'LTCUSDT': '라이트코인',
      'BCHUSDT': '비트코인 캐시',
      'XLMUSDT': '스텔라 루멘',
      'VETUSDT': '비체인',
      'TRXUSDT': '트론',
      'FILUSDT': '파일코인',
      'ATOMUSDT': '코스모스',
      'NEARUSDT': '니어 프로토콜',
      'ALGOUSDT': '알고랜드',
      'ICPUSDT': '인터넷 컴퓨터',
      'FTMUSDT': '팬텀',
      'SANDUSDT': '샌드박스',
      'MANAUSDT': '디센트럴랜드',
      'AXSUSDT': '엑시 인피니티',
      'GALAUSDT': '갈라',
      'CHZUSDT': '칠리즈',
      'HOTUSDT': '홀로체인',
      'ENJUSDT': '엔진 코인',
      'BATUSDT': '브레이브 토큰',
      'ZILUSDT': '질리카',
      'IOTAUSDT': '아이오타',
      'NEOUSDT': '네오',
      'QTUMUSDT': '퀀텀',
      'ONTUSDT': '온톨로지',
      'ZECUSDT': '지캐시',
      'DASHUSDT': '대시',
      'XMRUSDT': '모네로',
      'ETCUSDT': '이더리움 클래식',
      'WAVESUSDT': '웨이브',
      'OMGUSDT': '오미세고',
      'ZRXUSDT': '0x',
      'KNCUSDT': '카이버 네트워크',
      'COMPUSDT': '컴파운드',
      'AAVEUSDT': '에이브',
      'SNXUSDT': '신세틱스',
      'CRVUSDT': '커브',
      'YFIUSDT': '연파이낸스',
      'SUSHIUSDT': '스시스왑',
      '1INCHUSDT': '1인치',
      'RENUSDT': '렌',
      'RSRUSDT': '리저브라이트',
      'STORJUSDT': '스토리지',
      'ANKRUSDT': '앵커',
      'COTIUSDT': '코티',
      'OCEANUSDT': '오션 프로토콜',
      'BANDUSDT': '밴드 프로토콜',
      'NMRUSDT': '뉴메레어',
      'ALPHAUSDT': '알파 파이낸스',
      'AUDIOUSDT': '오디우스',
      'RLCUSDT': '아이젝',
      'IOTXUSDT': '아이오텍스',
      'CTXCUSDT': '코르텍스',
      'ARPAUSDT': '아르파',
      'CTSIUSDT': '카르테시',
      'HBARUSDT': '헤데라',
      'STPTUSDT': '스탠다드 토큰화 프로토콜',
      'STRAXUSDT': '스트라티스',
      'UNFIUSDT': '언피니티',
      'ROSEUSDT': '올레이',
      'AVAUSDT': '트라발라',
      'XEMUSDT': '넴',
      'SKLUSDT': '스케일',
      'SYSUSDT': '시스코인',
      'TFUELUSDT': '세타 퓨엘',
      'TRBUSDT': '텔로스',
      'TUSDUSDT': '트루USD',
      'BUSDUSDT': '바이낸스 USD',
      'USDCUSDT': 'USD 코인',
      'DAIUSDT': '다이',
      'FRAXUSDT': '프락스',
      'PAXUSDT': '팍스',
      'USDPUSDT': '팍스달러',
      
      // BTC 페어
      'ETHBTC': '이더리움',
      'LTCBTC': '라이트코인',
      'BNBBTC': '바이낸스 코인',
      'NEOBTC': '네오',
      'QTUMETH': '퀀텀',
      'GASBTC': '가스',
      'BNBETH': '바이낸스 코인',
      'LRCBTC': '루프링',
      'LRCETH': '루프링',
      
      // KRW 페어
      'BTCKRW': '비트코인',
      'ETHKRW': '이더리움',
      'BNBKRW': '바이낸스 코인',
      'ADAKRW': '에이다',
      'SOLKRW': '솔라나',
      'DOTKRW': '폴카닷',
      'DOGEKRW': '도지코인',
      'SHIBKRW': '시바이누',
      'AVAXKRW': '아발란체',
      'MATICKRW': '폴리곤',
      'LINKKRW': '체인링크',
      'UNIKRW': '유니스왑',
      'LTCKRW': '라이트코인',
      'BCHKRW': '비트코인 캐시',
      'XLMKRW': '스텔라 루멘',
      'VETKRW': '비체인',
      'TRXKRW': '트론',
      'FILKRW': '파일코인',
      'ATOMKRW': '코스모스',
      'NEARKRW': '니어 프로토콜',
      'ALGOKRW': '알고랜드',
      'ICPKRW': '인터넷 컴퓨터',
      'FTMKRW': '팬텀',
      'SANDKRW': '샌드박스',
      'MANAKRW': '디센트럴랜드',
      'AXSKRW': '엑시 인피니티',
      'GALAKRW': '갈라',
      'CHZKRW': '칠리즈',
      'HOTKRW': '홀로체인',
      'ENJKRW': '엔진 코인',
      'BATKRW': '브레이브 토큰',
      'ZILKRW': '질리카',
      'IOTAKRW': '아이오타',
      'NEOKRW': '네오',
      'QTUMKRW': '퀀텀',
      'ONTKRW': '온톨로지',
      'ZECKRW': '지캐시',
      'DASHKRW': '대시',
      'XMRKRW': '모네로',
      'ETCKRW': '이더리움 클래식',
      'WAVESKRW': '웨이브',
      'OMGKRW': '오미세고',
      'ZRXKRW': '0x',
      'KNCKRW': '카이버 네트워크',
      'COMPKRW': '컴파운드',
      'AAVEKRW': '에이브',
      'SNXKRW': '신세틱스',
      'CRVKRW': '커브',
      'YFIKRW': '연파이낸스',
      'SUSHIKRW': '스시스왑',
      '1INCHKRW': '1인치',
      'RENKRW': '렌',
      'RSRKRW': '리저브라이트',
      'STORJKRW': '스토리지',
      'ANKRKRW': '앵커',
      'COTIKRW': '코티',
      'OCEANKRW': '오션 프로토콜',
      'BANDKRW': '밴드 프로토콜',
      'NMRKRW': '뉴메레어',
      'ALPHAKRW': '알파 파이낸스',
      'AUDIOKRW': '오디우스',
      'RLCKRW': '아이젝',
      'IOTXKRW': '아이오텍스',
      'CTXCKRW': '코르텍스',
      'ARPAKRW': '아르파',
      'CTSIKRW': '카르테시',
      'HBARKRW': '헤데라',
      'STPTKRW': '스탠다드 토큰화 프로토콜',
      'STRAXKRW': '스트라티스',
      'UNFIKRW': '언피니티',
      'ROSEKRW': '올레이',
      'AVAKRW': '트라발라',
      'XEMKRW': '넴',
      'SKLKRW': '스케일',
      'SYSKRW': '시스코인',
      'TFUELKRW': '세타 퓨엘',
      'TRBKRW': '텔로스',
      'TUSDKRW': '트루USD',
      'BUSDKRW': '바이낸스 USD',
      'USDCKRW': 'USD 코인',
      'DAIKRW': '다이',
      'FRAXKRW': '프락스',
      'PAXKRW': '팍스',
      'USDPKRW': '팍스달러',
    };
    
    return nameMap[symbol] || symbol; // 매핑된 이름이 없으면 심볼 그대로 반환
  }
}
