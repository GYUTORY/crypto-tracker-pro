import { 
  Dashboard, 
  CreateDashboardDto, 
  UpdateDashboardDto, 
  DashboardResponseDto,
  AddToWatchlistDto,
  WatchlistItem 
} from '@/domain/entities/dashboard';

/**
 * 대시보드 리포지토리 인터페이스
 * 
 * 대시보드 데이터 접근을 위한 추상화된 인터페이스입니다.
 */
export interface DashboardRepository {
  /**
   * 대시보드 생성
   * @param createDashboardDto - 대시보드 생성 데이터
   * @returns 생성된 대시보드 정보
   */
  create(createDashboardDto: CreateDashboardDto): Promise<DashboardResponseDto>;

  /**
   * 사용자별 대시보드 조회
   * @param userId - 사용자 ID
   * @returns 대시보드 정보
   */
  findByUserId(userId: string): Promise<DashboardResponseDto | null>;

  /**
   * 대시보드 업데이트
   * @param userId - 사용자 ID
   * @param updateDashboardDto - 업데이트할 데이터
   * @returns 업데이트된 대시보드 정보
   */
  update(userId: string, updateDashboardDto: UpdateDashboardDto): Promise<DashboardResponseDto>;

  /**
   * 대시보드 삭제
   * @param userId - 사용자 ID
   * @returns 삭제 성공 여부
   */
  delete(userId: string): Promise<boolean>;

  /**
   * 관심목록에 항목 추가
   * @param userId - 사용자 ID
   * @param addToWatchlistDto - 추가할 항목 정보
   * @returns 업데이트된 대시보드 정보
   */
  addToWatchlist(userId: string, addToWatchlistDto: AddToWatchlistDto): Promise<DashboardResponseDto>;

  /**
   * 관심목록에서 항목 제거
   * @param userId - 사용자 ID
   * @param symbol - 제거할 심볼
   * @returns 업데이트된 대시보드 정보
   */
  removeFromWatchlist(userId: string, symbol: string): Promise<DashboardResponseDto>;

  /**
   * 관심목록 조회
   * @param userId - 사용자 ID
   * @returns 관심목록 항목들
   */
  getWatchlist(userId: string): Promise<WatchlistItem[]>;

  /**
   * 관심목록에 심볼 존재 여부 확인
   * @param userId - 사용자 ID
   * @param symbol - 확인할 심볼
   * @returns 존재 여부
   */
  isInWatchlist(userId: string, symbol: string): Promise<boolean>;

  /**
   * 관심목록 가격 정보 업데이트
   * @param userId - 사용자 ID
   * @param symbol - 심볼
   * @param price - 현재 가격
   * @param change24h - 24시간 변동률
   * @returns 업데이트 성공 여부
   */
  updateWatchlistPrice(
    userId: string, 
    symbol: string, 
    price: number, 
    change24h: number
  ): Promise<boolean>;

  /**
   * 사용자 설정 조회
   * @param userId - 사용자 ID
   * @returns 사용자 설정 정보
   */
  getUserSettings(userId: string): Promise<{
    preferredTimeframe: string;
    theme: string;
    notificationSettings: {
      priceAlerts: boolean;
      newsUpdates: boolean;
      recommendations: boolean;
    };
    layoutSettings: {
      showPriceChart: boolean;
      showTechnicalIndicators: boolean;
      showNews: boolean;
      showRecommendations: boolean;
    };
  } | null>;

  /**
   * 사용자 설정 업데이트
   * @param userId - 사용자 ID
   * @param settings - 업데이트할 설정
   * @returns 업데이트 성공 여부
   */
  updateUserSettings(userId: string, settings: {
    preferredTimeframe?: string;
    theme?: string;
    notificationSettings?: {
      priceAlerts?: boolean;
      newsUpdates?: boolean;
      recommendations?: boolean;
    };
    layoutSettings?: {
      showPriceChart?: boolean;
      showTechnicalIndicators?: boolean;
      showNews?: boolean;
      showRecommendations?: boolean;
    };
  }): Promise<boolean>;
}



