import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Notification } from '../../../domain/entities/notification/notification.entity';
import { NotificationRepository } from '../../../domain/repositories/notification/notification-repository.interface';
import { 
  CreateNotificationDto, 
  NotificationResponseDto,
  NotificationType,
  PushSubscriptionDto
} from '../../../domain/entities/notification';

@Injectable()
export class PostgresNotificationRepository implements NotificationRepository {
  private readonly notificationRepository: Repository<Notification>;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    this.notificationRepository = this.dataSource.getRepository(Notification);
  }

  async create(createNotificationDto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const notification = this.notificationRepository.create(createNotificationDto);
    const savedNotification = await this.notificationRepository.save(notification);
    return this.toNotificationResponseDto(savedNotification);
  }

  async findById(id: string): Promise<NotificationResponseDto | null> {
    const notification = await this.notificationRepository.findOne({ 
      where: { id },
      relations: ['user']
    });
    return notification ? this.toNotificationResponseDto(notification) : null;
  }

  async findByUserId(
    userId: string, 
    page: number = 1, 
    limit: number = 20, 
    isRead?: boolean
  ): Promise<{
    notifications: NotificationResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user')
      .where('notification.userId = :userId', { userId });

    if (isRead !== undefined) {
      queryBuilder.andWhere('notification.isRead = :isRead', { isRead });
    }

    const [notifications, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('notification.createdAt', 'DESC')
      .getManyAndCount();

    return {
      notifications: notifications.map(notification => this.toNotificationResponseDto(notification)),
      total,
      page,
      limit,
    };
  }

  async findByType(
    userId: string, 
    type: NotificationType, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{
    notifications: NotificationResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { userId, type },
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      notifications: notifications.map(notification => this.toNotificationResponseDto(notification)),
      total,
      page,
      limit,
    };
  }

  async markAsRead(id: string): Promise<boolean> {
    const result = await this.notificationRepository.update(id, { 
      isRead: true,
      readAt: new Date()
    });
    return result.affected > 0;
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    const result = await this.notificationRepository.update(
      { userId, isRead: false },
      { 
        isRead: true,
        readAt: new Date()
      }
    );
    return result.affected > 0;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false }
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.notificationRepository.delete(id);
    return result.affected > 0;
  }

  async deleteAllByUserId(userId: string): Promise<boolean> {
    const result = await this.notificationRepository.delete({ userId });
    return result.affected > 0;
  }

  async addPushSubscription(userId: string, subscription: PushSubscriptionDto): Promise<boolean> {
    // 실제 구현에서는 별도 테이블이나 JSON 컬럼에 저장
    // 여기서는 간단히 true 반환
    return true;
  }

  async removePushSubscription(userId: string, endpoint: string): Promise<boolean> {
    // 실제 구현에서는 별도 테이블에서 삭제
    // 여기서는 간단히 true 반환
    return true;
  }

  async getPushSubscriptions(userId: string): Promise<PushSubscriptionDto[]> {
    // 실제 구현에서는 별도 테이블에서 조회
    // 여기서는 빈 배열 반환
    return [];
  }

  private toNotificationResponseDto(notification: Notification): NotificationResponseDto {
    return {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      isRead: notification.isRead,
      readAt: notification.readAt,
      data: notification.data,
      createdAt: notification.createdAt,
    };
  }
}
