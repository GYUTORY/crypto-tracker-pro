import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../user/user.entity';

/**
 * 알림 타입
 */
export enum NotificationType {
  PRICE_ALERT = 'PRICE_ALERT',
  NEWS_UPDATE = 'NEWS_UPDATE',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  RECOMMENDATION = 'RECOMMENDATION',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET'
}

/**
 * 알림 우선순위
 */
export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

/**
 * 알림 엔티티
 */
@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: '알림 고유 ID',
    example: 'n_1234567890'
  })
  id: string;

  @Column()
  @Index()
  @ApiProperty({
    description: '사용자 ID',
    example: 'u_1234567890'
  })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  @ApiProperty({
    description: '알림 제목',
    example: '비트코인 가격 알림'
  })
  title: string;

  @Column('text')
  @ApiProperty({
    description: '알림 내용',
    example: 'BTCUSDT가 $50,000에 도달했습니다!'
  })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType
  })
  @ApiProperty({
    description: '알림 타입',
    example: 'PRICE_ALERT',
    enum: NotificationType
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM
  })
  @ApiProperty({
    description: '알림 우선순위',
    example: 'MEDIUM',
    enum: NotificationPriority
  })
  priority: NotificationPriority;

  @Column({ default: false })
  @ApiProperty({
    description: '읽음 상태',
    example: false
  })
  isRead: boolean;

  @Column('jsonb', { nullable: true })
  @ApiProperty({
    description: '알림 데이터 (JSON)',
    example: { symbol: 'BTCUSDT', price: 50000 },
    required: false
  })
  data?: Record<string, any>;

  @CreateDateColumn()
  @ApiProperty({
    description: '알림 생성 시간',
    example: '2024-01-15T10:30:00Z'
  })
  createdAt: Date;

  @Column({ nullable: true })
  @ApiProperty({
    description: '알림 읽음 시간',
    example: '2024-01-15T10:35:00Z',
    required: false
  })
  readAt?: Date;

  constructor(partial: Partial<Notification>) {
    Object.assign(this, partial);
  }
}

/**
 * 알림 생성 DTO
 */
export class CreateNotificationDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 'u_1234567890'
  })
  userId: string;

  @ApiProperty({
    description: '알림 제목',
    example: '비트코인 가격 알림'
  })
  title: string;

  @ApiProperty({
    description: '알림 내용',
    example: 'BTCUSDT가 $50,000에 도달했습니다!'
  })
  message: string;

  @ApiProperty({
    description: '알림 타입',
    example: 'PRICE_ALERT',
    enum: NotificationType
  })
  type: NotificationType;

  @ApiProperty({
    description: '알림 우선순위',
    example: 'MEDIUM',
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM
  })
  priority?: NotificationPriority;

  @ApiProperty({
    description: '알림 데이터 (JSON)',
    example: { symbol: 'BTCUSDT', price: 50000 },
    required: false
  })
  data?: Record<string, any>;
}

/**
 * 알림 응답 DTO
 */
export class NotificationResponseDto {
  @ApiProperty({
    description: '알림 고유 ID',
    example: 'n_1234567890'
  })
  id: string;

  @ApiProperty({
    description: '알림 제목',
    example: '비트코인 가격 알림'
  })
  title: string;

  @ApiProperty({
    description: '알림 내용',
    example: 'BTCUSDT가 $50,000에 도달했습니다!'
  })
  message: string;

  @ApiProperty({
    description: '알림 타입',
    example: 'PRICE_ALERT'
  })
  type: string;

  @ApiProperty({
    description: '알림 우선순위',
    example: 'MEDIUM'
  })
  priority: string;

  @ApiProperty({
    description: '읽음 상태',
    example: false
  })
  isRead: boolean;

  @ApiProperty({
    description: '알림 데이터 (JSON)',
    example: { symbol: 'BTCUSDT', price: 50000 },
    required: false
  })
  data?: Record<string, any>;

  @ApiProperty({
    description: '알림 생성 시간',
    example: '2024-01-15T10:30:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: '알림 읽음 시간',
    example: '2024-01-15T10:35:00Z',
    required: false
  })
  readAt?: Date;
}

/**
 * 푸시 알림 구독 DTO
 */
export class PushSubscriptionDto {
  @ApiProperty({
    description: '푸시 알림 엔드포인트',
    example: 'https://fcm.googleapis.com/fcm/send/...'
  })
  endpoint: string;

  @ApiProperty({
    description: '푸시 알림 키',
    example: 'BEl62iUYgUivxIkv69yViEuiBIa1...'
  })
  keys: {
    p256dh: string;
    auth: string;
  };
}


