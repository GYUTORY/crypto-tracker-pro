import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { DashboardRepository } from '@/domain/repositories/dashboard/dashboard-repository.interface';
import { 
  CreateDashboardDto, 
  UpdateDashboardDto, 
  DashboardResponseDto,
  AddToWatchlistDto,
  WatchlistItem 
} from '@/domain/entities/dashboard';

@Injectable()
export class DashboardService {
  constructor(
    @Inject('DashboardRepository') private readonly dashboardRepository: DashboardRepository,
  ) {}

  async createDashboard(createDashboardDto: CreateDashboardDto): Promise<DashboardResponseDto> {
    return this.dashboardRepository.create(createDashboardDto);
  }

  async getUserDashboard(userId: string): Promise<DashboardResponseDto> {
    const dashboard = await this.dashboardRepository.findByUserId(userId);
    if (!dashboard) {
      throw new NotFoundException('대시보드를 찾을 수 없습니다.');
    }
    return dashboard;
  }

  async updateDashboard(
    userId: string, 
    updateDashboardDto: UpdateDashboardDto
  ): Promise<DashboardResponseDto> {
    return this.dashboardRepository.update(userId, updateDashboardDto);
  }

  async deleteDashboard(userId: string): Promise<boolean> {
    return this.dashboardRepository.delete(userId);
  }

  async addToWatchlist(
    userId: string, 
    addToWatchlistDto: AddToWatchlistDto
  ): Promise<DashboardResponseDto> {
    // 이미 관심목록에 있는지 확인
    const isInWatchlist = await this.dashboardRepository.isInWatchlist(
      userId, 
      addToWatchlistDto.symbol
    );
    
    if (isInWatchlist) {
      throw new Error('이미 관심목록에 추가된 심볼입니다.');
    }

    return this.dashboardRepository.addToWatchlist(userId, addToWatchlistDto);
  }

  async removeFromWatchlist(userId: string, symbol: string): Promise<DashboardResponseDto> {
    return this.dashboardRepository.removeFromWatchlist(userId, symbol);
  }

  async getWatchlist(userId: string): Promise<WatchlistItem[]> {
    return this.dashboardRepository.getWatchlist(userId);
  }

  async isInWatchlist(userId: string, symbol: string): Promise<boolean> {
    return this.dashboardRepository.isInWatchlist(userId, symbol);
  }

  async updateWatchlistPrice(
    userId: string, 
    symbol: string, 
    price: number, 
    change24h: number
  ): Promise<boolean> {
    return this.dashboardRepository.updateWatchlistPrice(userId, symbol, price, change24h);
  }

  async getUserSettings(userId: string) {
    return this.dashboardRepository.getUserSettings(userId);
  }

  async updateUserSettings(userId: string, settings: {
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
  }): Promise<boolean> {
    return this.dashboardRepository.updateUserSettings(userId, settings);
  }

  async updatePreferredTimeframe(userId: string, timeframe: string): Promise<boolean> {
    return this.updateUserSettings(userId, { preferredTimeframe: timeframe });
  }

  async updateTheme(userId: string, theme: 'light' | 'dark' | 'auto'): Promise<boolean> {
    return this.updateUserSettings(userId, { theme });
  }

  async updateNotificationSettings(
    userId: string, 
    notificationSettings: {
      priceAlerts?: boolean;
      newsUpdates?: boolean;
      recommendations?: boolean;
    }
  ): Promise<boolean> {
    return this.updateUserSettings(userId, { notificationSettings });
  }

  async updateLayoutSettings(
    userId: string, 
    layoutSettings: {
      showPriceChart?: boolean;
      showTechnicalIndicators?: boolean;
      showNews?: boolean;
      showRecommendations?: boolean;
    }
  ): Promise<boolean> {
    return this.updateUserSettings(userId, { layoutSettings });
  }

  async initializeDashboard(userId: string): Promise<DashboardResponseDto> {
    const defaultDashboard: CreateDashboardDto = {
      userId,
      preferredTimeframe: '1h',
      theme: 'dark',
    };

    return this.createDashboard(defaultDashboard);
  }

  async batchUpdateWatchlistPrices(
    userId: string, 
    priceData: Array<{ symbol: string; price: number; change24h: number }>
  ): Promise<boolean> {
    try {
      for (const data of priceData) {
        await this.updateWatchlistPrice(userId, data.symbol, data.price, data.change24h);
      }
      return true;
    } catch (error) {
      console.error('관심목록 가격 일괄 업데이트 실패:', error);
      return false;
    }
  }

  async getDashboardStats(userId: string) {
    const dashboard = await this.getUserDashboard(userId);
    const watchlist = await this.getWatchlist(userId);

    return {
      totalWatchlistItems: watchlist.length,
      theme: dashboard.theme,
      preferredTimeframe: dashboard.preferredTimeframe,
      notificationSettings: dashboard.notificationSettings,
      layoutSettings: dashboard.layoutSettings,
      lastUpdated: dashboard.updatedAt
    };
  }
}
