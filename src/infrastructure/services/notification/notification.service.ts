import { Injectable, Inject } from '@nestjs/common';
import { NotificationRepository } from '@/domain/repositories/notification/notification-repository.interface';
import { 
  CreateNotificationDto, 
  NotificationResponseDto, 
  NotificationType,
  PushSubscriptionDto 
} from '@/domain/entities/notification';

/**
 * 알림 서비스
 * 
 * 알림 생성, 조회, 푸시 알림 관리를 담당합니다.
 */
@Injectable()
export class NotificationService {
  constructor(
    @Inject('NotificationRepository') private readonly notificationRepository: NotificationRepository,
  ) {}

  /**
   * 알림 생성
   * @param createNotificationDto - 알림 생성 데이터
   * @returns 생성된 알림 정보
   */
  async createNotification(createNotificationDto: CreateNotificationDto): Promise<NotificationResponseDto> {
    return this.notificationRepository.create(createNotificationDto);
  }

  /**
   * 사용자별 알림 조회
   * @param userId - 사용자 ID
   * @param page - 페이지 번호
   * @param limit - 페이지당 항목 수
   * @param isRead - 읽음 상태 필터
   * @returns 알림 목록
   */
  async getUserNotifications(
    userId: string, 
    page: number = 1, 
    limit: number = 20, 
    isRead?: boolean
  ) {
    return this.notificationRepository.findByUserId(userId, page, limit, isRead);
  }

  /**
   * 알림 읽음 처리
   * @param notificationId - 알림 ID
   * @returns 업데이트 성공 여부
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    return this.notificationRepository.markAsRead(notificationId);
  }

  /**
   * 사용자 모든 알림 읽음 처리
   * @param userId - 사용자 ID
   * @returns 업데이트 성공 여부
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    return this.notificationRepository.markAllAsRead(userId);
  }

  /**
   * 읽지 않은 알림 개수 조회
   * @param userId - 사용자 ID
   * @returns 읽지 않은 알림 개수
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.getUnreadCount(userId);
  }

  /**
   * 푸시 알림 구독 추가
   * @param userId - 사용자 ID
   * @param subscription - 푸시 구독 정보
   * @returns 구독 성공 여부
   */
  async addPushSubscription(userId: string, subscription: PushSubscriptionDto): Promise<boolean> {
    return this.notificationRepository.addPushSubscription(userId, subscription);
  }

  /**
   * 푸시 알림 구독 제거
   * @param userId - 사용자 ID
   * @param endpoint - 구독 엔드포인트
   * @returns 제거 성공 여부
   */
  async removePushSubscription(userId: string, endpoint: string): Promise<boolean> {
    return this.notificationRepository.removePushSubscription(userId, endpoint);
  }

  /**
   * 사용자 푸시 구독 목록 조회
   * @param userId - 사용자 ID
   * @returns 푸시 구독 목록
   */
  async getPushSubscriptions(userId: string): Promise<PushSubscriptionDto[]> {
    return this.notificationRepository.getPushSubscriptions(userId);
  }

  /**
   * 특정 타입의 알림 조회
   * @param userId - 사용자 ID
   * @param type - 알림 타입
   * @param page - 페이지 번호
   * @param limit - 페이지당 항목 수
   * @returns 알림 목록
   */
  async getNotificationsByType(
    userId: string, 
    type: NotificationType, 
    page: number = 1, 
    limit: number = 20
  ) {
    return this.notificationRepository.findByType(userId, type, page, limit);
  }

  /**
   * 알림 삭제
   * @param id - 알림 ID
   * @returns 삭제 성공 여부
   */
  async delete(id: string): Promise<boolean> {
    return this.notificationRepository.delete(id);
  }

  /**
   * 가격 알림 생성
   * @param userId - 사용자 ID
   * @param symbol - 암호화폐 심볼
   * @param targetPrice - 목표 가격
   * @param currentPrice - 현재 가격
   * @returns 생성된 알림 정보
   */
  async createPriceAlert(
    userId: string, 
    symbol: string, 
    targetPrice: number, 
    currentPrice: number
  ): Promise<NotificationResponseDto> {
    const isAbove = currentPrice >= targetPrice;
    const title = `${symbol} 가격 알림`;
    const message = `${symbol}가 ${targetPrice.toLocaleString()}에 ${isAbove ? '도달' : '하락'}했습니다! (현재: ${currentPrice.toLocaleString()})`;

    return this.createNotification({
      userId,
      title,
      message,
      type: NotificationType.PRICE_ALERT,
      data: {
        symbol,
        targetPrice,
        currentPrice,
        isAbove
      }
    });
  }

  /**
   * 뉴스 업데이트 알림 생성
   * @param userId - 사용자 ID
   * @param title - 뉴스 제목
   * @param source - 뉴스 출처
   * @returns 생성된 알림 정보
   */
  async createNewsUpdate(
    userId: string, 
    title: string, 
    source: string
  ): Promise<NotificationResponseDto> {
    return this.createNotification({
      userId,
      title: '새로운 암호화폐 뉴스',
      message: `${title} (출처: ${source})`,
      type: NotificationType.NEWS_UPDATE,
      data: {
        title,
        source
      }
    });
  }

  /**
   * AI 추천 알림 생성
   * @param userId - 사용자 ID
   * @param symbol - 암호화폐 심볼
   * @param recommendation - 추천 내용
   * @param timeframe - 추천 기간
   * @returns 생성된 알림 정보
   */
  async createRecommendationAlert(
    userId: string, 
    symbol: string, 
    recommendation: string, 
    timeframe: string
  ): Promise<NotificationResponseDto> {
    return this.createNotification({
      userId,
      title: 'AI 추천 알림',
      message: `${symbol} ${timeframe} 추천: ${recommendation}`,
      type: NotificationType.RECOMMENDATION,
      data: {
        symbol,
        recommendation,
        timeframe
      }
    });
  }

  /**
   * 시스템 알림 생성
   * @param userId - 사용자 ID
   * @param title - 알림 제목
   * @param message - 알림 내용
   * @returns 생성된 알림 정보
   */
  async createSystemAlert(
    userId: string, 
    title: string, 
    message: string
  ): Promise<NotificationResponseDto> {
    return this.createNotification({
      userId,
      title,
      message,
      type: NotificationType.SYSTEM_ALERT
    });
  }

  /**
   * 이메일 인증 알림 생성
   * @param userId - 사용자 ID
   * @returns 생성된 알림 정보
   */
  async createEmailVerificationAlert(userId: string): Promise<NotificationResponseDto> {
    return this.createNotification({
      userId,
      title: '이메일 인증 필요',
      message: '계정 보안을 위해 이메일 인증을 완료해주세요.',
      type: NotificationType.EMAIL_VERIFICATION
    });
  }

  /**
   * 비밀번호 재설정 알림 생성
   * @param userId - 사용자 ID
   * @returns 생성된 알림 정보
   */
  async createPasswordResetAlert(userId: string): Promise<NotificationResponseDto> {
    return this.createNotification({
      userId,
      title: '비밀번호 재설정',
      message: '비밀번호 재설정 요청이 접수되었습니다. 이메일을 확인해주세요.',
      type: NotificationType.PASSWORD_RESET
    });
  }

  /**
   * 푸시 알림 전송 (실제 구현에서는 FCM 등 사용)
   * @param userId - 사용자 ID
   * @param title - 알림 제목
   * @param message - 알림 내용
   * @param data - 추가 데이터
   * @returns 전송 성공 여부
   */
  async sendPushNotification(
    userId: string, 
    title: string, 
    message: string, 
    data?: Record<string, any>
  ): Promise<boolean> {
    try {
      // 실제 구현에서는 Firebase Cloud Messaging (FCM) 사용
      const subscriptions = await this.getPushSubscriptions(userId);
      
      for (const subscription of subscriptions) {
        // FCM을 통한 푸시 알림 전송 로직
        console.log(`푸시 알림 전송: ${subscription.endpoint}`, { title, message, data });
      }
      
      return true;
    } catch (error) {
      console.error('푸시 알림 전송 실패:', error);
      return false;
    }
  }
}
