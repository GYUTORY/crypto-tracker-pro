import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Dashboard } from '../../../domain/entities/dashboard/dashboard.entity';
import { DashboardRepository } from '../../../domain/repositories/dashboard/dashboard-repository.interface';
import { 
  CreateDashboardDto, 
  UpdateDashboardDto, 
  DashboardResponseDto,
  AddToWatchlistDto,
  WatchlistItem
} from '../../../domain/entities/dashboard';

@Injectable()
export class PostgresDashboardRepository implements DashboardRepository {
  private readonly dashboardRepository: Repository<Dashboard>;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    this.dashboardRepository = this.dataSource.getRepository(Dashboard);
  }

  async create(createDashboardDto: CreateDashboardDto): Promise<DashboardResponseDto> {
    const dashboard = this.dashboardRepository.create(createDashboardDto);
    const savedDashboard = await this.dashboardRepository.save(dashboard);
    return this.toDashboardResponseDto(savedDashboard);
  }

  async findByUserId(userId: string): Promise<DashboardResponseDto | null> {
    const dashboard = await this.dashboardRepository.findOne({ 
      where: { userId },
      relations: ['user']
    });
    return dashboard ? this.toDashboardResponseDto(dashboard) : null;
  }

  async update(userId: string, updateDashboardDto: UpdateDashboardDto): Promise<DashboardResponseDto> {
    await this.dashboardRepository.update({ userId }, updateDashboardDto);
    const updatedDashboard = await this.dashboardRepository.findOne({ 
      where: { userId },
      relations: ['user']
    });
    if (!updatedDashboard) {
      throw new Error('Dashboard not found');
    }
    return this.toDashboardResponseDto(updatedDashboard);
  }

  async delete(userId: string): Promise<boolean> {
    const result = await this.dashboardRepository.delete({ userId });
    return result.affected > 0;
  }

  async addToWatchlist(userId: string, addToWatchlistDto: AddToWatchlistDto): Promise<DashboardResponseDto> {
    const dashboard = await this.dashboardRepository.findOne({ where: { userId } });
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    const watchlist = dashboard.watchlist || [];
    const newItem: WatchlistItem = {
      symbol: addToWatchlistDto.symbol,
      addedAt: new Date()
    };

    watchlist.push(newItem);
    dashboard.watchlist = watchlist;

    const savedDashboard = await this.dashboardRepository.save(dashboard);
    return this.toDashboardResponseDto(savedDashboard);
  }

  async removeFromWatchlist(userId: string, symbol: string): Promise<DashboardResponseDto> {
    const dashboard = await this.dashboardRepository.findOne({ where: { userId } });
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    const watchlist = dashboard.watchlist || [];
    const filteredWatchlist = watchlist.filter(item => item.symbol !== symbol);
    
    dashboard.watchlist = filteredWatchlist;

    const savedDashboard = await this.dashboardRepository.save(dashboard);
    return this.toDashboardResponseDto(savedDashboard);
  }

  async getWatchlist(userId: string): Promise<WatchlistItem[]> {
    const dashboard = await this.dashboardRepository.findOne({ where: { userId } });
    return dashboard?.watchlist || [];
  }

  async isInWatchlist(userId: string, symbol: string): Promise<boolean> {
    const dashboard = await this.dashboardRepository.findOne({ where: { userId } });
    if (!dashboard || !dashboard.watchlist) {
      return false;
    }
    return dashboard.watchlist.some(item => item.symbol === symbol);
  }

  async updateWatchlistPrice(userId: string, symbol: string, price: number, change24h: number): Promise<boolean> {
    const dashboard = await this.dashboardRepository.findOne({ where: { userId } });
    if (!dashboard || !dashboard.watchlist) {
      return false;
    }

    const watchlist = dashboard.watchlist.map(item => {
      if (item.symbol === symbol) {
        return { ...item, currentPrice: price, change24h };
      }
      return item;
    });

    dashboard.watchlist = watchlist;

    const result = await this.dashboardRepository.save(dashboard);
    return !!result;
  }

  async getUserSettings(userId: string): Promise<{
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
  }> {
    const dashboard = await this.dashboardRepository.findOne({ where: { userId } });
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    return {
      preferredTimeframe: dashboard.preferredTimeframe,
      theme: dashboard.theme,
      notificationSettings: dashboard.notificationSettings,
      layoutSettings: dashboard.layoutSettings,
    };
  }

  async updateUserSettings(userId: string, settings: {
    preferredTimeframe?: string;
    theme?: 'light' | 'dark' | 'auto';
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
    const dashboard = await this.dashboardRepository.findOne({ where: { userId } });
    if (!dashboard) {
      return false;
    }

    if (settings.preferredTimeframe) {
      dashboard.preferredTimeframe = settings.preferredTimeframe;
    }
    if (settings.theme) {
      dashboard.theme = settings.theme;
    }
    if (settings.notificationSettings) {
      dashboard.notificationSettings = {
        ...dashboard.notificationSettings,
        ...settings.notificationSettings
      };
    }
    if (settings.layoutSettings) {
      dashboard.layoutSettings = {
        ...dashboard.layoutSettings,
        ...settings.layoutSettings
      };
    }

    const result = await this.dashboardRepository.save(dashboard);
    return !!result;
  }

  private toDashboardResponseDto(dashboard: Dashboard): DashboardResponseDto {
    return {
      id: dashboard.id,
      userId: dashboard.userId,
      preferredTimeframe: dashboard.preferredTimeframe,
      theme: dashboard.theme,
      watchlist: dashboard.watchlist || [],
      notificationSettings: dashboard.notificationSettings,
      layoutSettings: dashboard.layoutSettings,
      updatedAt: dashboard.updatedAt,
    };
  }
}
