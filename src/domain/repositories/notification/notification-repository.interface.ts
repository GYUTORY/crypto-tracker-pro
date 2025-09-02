import { 
  Notification, 
  CreateNotificationDto, 
  NotificationResponseDto,
  NotificationType,
  PushSubscriptionDto 
} from '@/domain/entities/notification';

/**
 * 알림 리포지토리 인터페이스
 * 
 * 알림 데이터 접근을 위한 추상화된 인터페이스입니다.
 */
export interface NotificationRepository {
  /**
   * 알림 생성
   * @param createNotificationDto - 알림 생성 데이터
   * @returns 생성된 알림 정보
   */
  create(createNotificationDto: CreateNotificationDto): Promise<NotificationResponseDto>;

  /**
   * 사용자별 알림 조회
   * @param userId - 사용자 ID
   * @param page - 페이지 번호
   * @param limit - 페이지당 항목 수
   * @param isRead - 읽음 상태 필터
   * @returns 알림 목록
   */
  findByUserId(
    userId: string, 
    page?: number, 
    limit?: number, 
    isRead?: boolean
  ): Promise<{
    notifications: NotificationResponseDto[];
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * 알림 ID로 조회
   * @param id - 알림 ID
   * @returns 알림 정보
   */
  findById(id: string): Promise<NotificationResponseDto | null>;

  /**
   * 알림 읽음 처리
   * @param id - 알림 ID
   * @returns 업데이트 성공 여부
   */
  markAsRead(id: string): Promise<boolean>;

  /**
   * 사용자 모든 알림 읽음 처리
   * @param userId - 사용자 ID
   * @returns 업데이트 성공 여부
   */
  markAllAsRead(userId: string): Promise<boolean>;

  /**
   * 알림 삭제
   * @param id - 알림 ID
   * @returns 삭제 성공 여부
   */
  delete(id: string): Promise<boolean>;

  /**
   * 사용자 모든 알림 삭제
   * @param userId - 사용자 ID
   * @returns 삭제 성공 여부
   */
  deleteAllByUserId(userId: string): Promise<boolean>;

  /**
   * 읽지 않은 알림 개수 조회
   * @param userId - 사용자 ID
   * @returns 읽지 않은 알림 개수
   */
  getUnreadCount(userId: string): Promise<number>;

  /**
   * 푸시 알림 구독 추가
   * @param userId - 사용자 ID
   * @param subscription - 푸시 구독 정보
   * @returns 구독 성공 여부
   */
  addPushSubscription(userId: string, subscription: PushSubscriptionDto): Promise<boolean>;

  /**
   * 푸시 알림 구독 제거
   * @param userId - 사용자 ID
   * @param endpoint - 구독 엔드포인트
   * @returns 제거 성공 여부
   */
  removePushSubscription(userId: string, endpoint: string): Promise<boolean>;

  /**
   * 사용자 푸시 구독 목록 조회
   * @param userId - 사용자 ID
   * @returns 푸시 구독 목록
   */
  getPushSubscriptions(userId: string): Promise<PushSubscriptionDto[]>;

  /**
   * 특정 타입의 알림 조회
   * @param userId - 사용자 ID
   * @param type - 알림 타입
   * @param page - 페이지 번호
   * @param limit - 페이지당 항목 수
   * @returns 알림 목록
   */
  findByType(
    userId: string, 
    type: NotificationType, 
    page?: number, 
    limit?: number
  ): Promise<{
    notifications: NotificationResponseDto[];
    total: number;
    page: number;
    limit: number;
  }>;
}



