import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../user/user.entity';

/**
 * 관심목록 항목
 */
export class WatchlistItem {
  @ApiProperty({
    description: '암호화폐 심볼',
    example: 'BTCUSDT'
  })
  symbol: string;

  @ApiProperty({
    description: '추가 시간',
    example: '2024-01-15T10:30:00Z'
  })
  addedAt: Date;

  @ApiProperty({
    description: '현재 가격',
    example: 50000.00
  })
  currentPrice?: number;

  @ApiProperty({
    description: '24시간 변동률',
    example: 2.5
  })
  change24h?: number;

  constructor(partial: Partial<WatchlistItem>) {
    Object.assign(this, partial);
  }
}

/**
 * 사용자 대시보드 엔티티
 */
@Entity('dashboards')
export class Dashboard {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: '대시보드 고유 ID',
    example: 'd_1234567890'
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

  @Column('jsonb', { default: [] })
  @ApiProperty({
    description: '관심목록',
    type: [WatchlistItem]
  })
  watchlist: WatchlistItem[];

  @Column({ default: '1h' })
  @ApiProperty({
    description: '선호하는 차트 타임프레임',
    example: '1h',
    enum: ['1m', '5m', '15m', '1h', '4h', '1d', '1w']
  })
  preferredTimeframe: string;

  @Column({ default: 'dark' })
  @ApiProperty({
    description: '선호하는 테마',
    example: 'dark',
    enum: ['light', 'dark', 'auto']
  })
  theme: 'light' | 'dark' | 'auto';

  @Column('jsonb', {
    default: {
      priceAlerts: true,
      newsUpdates: true,
      recommendations: true
    }
  })
  @ApiProperty({
    description: '알림 설정',
    example: {
      priceAlerts: true,
      newsUpdates: true,
      recommendations: true
    }
  })
  notificationSettings: {
    priceAlerts: boolean;
    newsUpdates: boolean;
    recommendations: boolean;
  };

  @Column('jsonb', {
    default: {
      showPriceChart: true,
      showTechnicalIndicators: true,
      showNews: true,
      showRecommendations: true
    }
  })
  @ApiProperty({
    description: '대시보드 레이아웃 설정',
    example: {
      showPriceChart: true,
      showTechnicalIndicators: true,
      showNews: true,
      showRecommendations: true
    }
  })
  layoutSettings: {
    showPriceChart: boolean;
    showTechnicalIndicators: boolean;
    showNews: boolean;
    showRecommendations: boolean;
  };

  @UpdateDateColumn()
  @ApiProperty({
    description: '마지막 업데이트 시간',
    example: '2024-01-15T10:30:00Z'
  })
  updatedAt: Date;

  constructor(partial: Partial<Dashboard>) {
    Object.assign(this, partial);
  }
}

/**
 * 대시보드 생성 DTO
 */
export class CreateDashboardDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 'u_1234567890'
  })
  userId: string;

  @ApiProperty({
    description: '선호하는 차트 타임프레임',
    example: '1h',
    enum: ['1m', '5m', '15m', '1h', '4h', '1d', '1w'],
    default: '1h'
  })
  preferredTimeframe?: string;

  @ApiProperty({
    description: '선호하는 테마',
    example: 'dark',
    enum: ['light', 'dark', 'auto'],
    default: 'dark'
  })
  theme?: 'light' | 'dark' | 'auto';
}

/**
 * 대시보드 업데이트 DTO
 */
export class UpdateDashboardDto {
  @ApiProperty({
    description: '선호하는 차트 타임프레임',
    example: '1h',
    enum: ['1m', '5m', '15m', '1h', '4h', '1d', '1w'],
    required: false
  })
  preferredTimeframe?: string;

  @ApiProperty({
    description: '선호하는 테마',
    example: 'dark',
    enum: ['light', 'dark', 'auto'],
    required: false
  })
  theme?: 'light' | 'dark' | 'auto';

  @ApiProperty({
    description: '알림 설정',
    required: false
  })
  notificationSettings?: {
    priceAlerts?: boolean;
    newsUpdates?: boolean;
    recommendations?: boolean;
  };

  @ApiProperty({
    description: '대시보드 레이아웃 설정',
    required: false
  })
  layoutSettings?: {
    showPriceChart?: boolean;
    showTechnicalIndicators?: boolean;
    showNews?: boolean;
    showRecommendations?: boolean;
  };
}

/**
 * 관심목록 추가 DTO
 */
export class AddToWatchlistDto {
  @ApiProperty({
    description: '암호화폐 심볼',
    example: 'BTCUSDT'
  })
  symbol: string;
}

/**
 * 대시보드 응답 DTO
 */
export class DashboardResponseDto {
  @ApiProperty({
    description: '대시보드 고유 ID',
    example: 'd_1234567890'
  })
  id: string;

  @ApiProperty({
    description: '사용자 ID',
    example: 'u_1234567890'
  })
  userId: string;

  @ApiProperty({
    description: '관심목록',
    type: [WatchlistItem]
  })
  watchlist: WatchlistItem[];

  @ApiProperty({
    description: '선호하는 차트 타임프레임',
    example: '1h'
  })
  preferredTimeframe: string;

  @ApiProperty({
    description: '선호하는 테마',
    example: 'dark'
  })
  theme: string;

  @ApiProperty({
    description: '알림 설정'
  })
  notificationSettings: {
    priceAlerts: boolean;
    newsUpdates: boolean;
    recommendations: boolean;
  };

  @ApiProperty({
    description: '대시보드 레이아웃 설정'
  })
  layoutSettings: {
    showPriceChart: boolean;
    showTechnicalIndicators: boolean;
    showNews: boolean;
    showRecommendations: boolean;
  };

  @ApiProperty({
    description: '마지막 업데이트 시간',
    example: '2024-01-15T10:30:00Z'
  })
  updatedAt: Date;
}


