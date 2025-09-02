import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Request,
  UseGuards 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiBearerAuth,
  ApiParam 
} from '@nestjs/swagger';
import { DashboardService } from '@/infrastructure/services/dashboard/dashboard.service';
import { BaseService } from '@/shared/base-response';
import { 
  CreateDashboardDto, 
  UpdateDashboardDto, 
  DashboardResponseDto,
  AddToWatchlistDto,
  WatchlistItem 
} from '@/domain/entities/dashboard';

/**
 * 대시보드 컨트롤러
 * 
 * 사용자 대시보드 관리, 관심목록 관리, 사용자 설정 관리 API를 제공합니다.
 */
@ApiTags('Dashboard')
@Controller('dashboard')
@ApiBearerAuth()
export class DashboardController extends BaseService {
  constructor(private readonly dashboardService: DashboardService) {
    super();
  }

  @Get()
  @ApiOperation({
    summary: '사용자 대시보드 조회',
    description: '현재 로그인한 사용자의 대시보드 정보를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '대시보드 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/DashboardResponseDto' },
        message: { type: 'string', example: '대시보드 조회가 완료되었습니다.' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: '대시보드를 찾을 수 없음'
  })
  async getUserDashboard(@Request() req) {
    try {
      const userId = req.user.id;
      const dashboard = await this.dashboardService.getUserDashboard(userId);
      return this.success(dashboard, '대시보드 조회가 완료되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Post()
  @ApiOperation({
    summary: '대시보드 생성',
    description: '새로운 대시보드를 생성합니다.'
  })
  @ApiBody({ type: CreateDashboardDto })
  @ApiResponse({
    status: 201,
    description: '대시보드 생성 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/DashboardResponseDto' },
        message: { type: 'string', example: '대시보드가 생성되었습니다.' }
      }
    }
  })
  async createDashboard(@Request() req, @Body() createDashboardDto: CreateDashboardDto) {
    try {
      const result = await this.dashboardService.createDashboard(createDashboardDto);
      return this.success(result, '대시보드가 생성되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Put()
  @ApiOperation({
    summary: '대시보드 업데이트',
    description: '현재 로그인한 사용자의 대시보드를 업데이트합니다.'
  })
  @ApiBody({ type: UpdateDashboardDto })
  @ApiResponse({
    status: 200,
    description: '대시보드 업데이트 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/DashboardResponseDto' },
        message: { type: 'string', example: '대시보드가 업데이트되었습니다.' }
      }
    }
  })
  async updateDashboard(@Request() req, @Body() updateDashboardDto: UpdateDashboardDto) {
    try {
      const userId = req.user.id;
      const result = await this.dashboardService.updateDashboard(userId, updateDashboardDto);
      return this.success(result, '대시보드가 업데이트되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Get('watchlist')
  @ApiOperation({
    summary: '관심목록 조회',
    description: '현재 로그인한 사용자의 관심목록을 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '관심목록 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/WatchlistItem' }
        },
        message: { type: 'string', example: '관심목록 조회가 완료되었습니다.' }
      }
    }
  })
  async getWatchlist(@Request() req) {
    try {
      const userId = req.user.id;
      const watchlist = await this.dashboardService.getWatchlist(userId);
      return this.success(watchlist, '관심목록 조회가 완료되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Post('watchlist')
  @ApiOperation({
    summary: '관심목록에 항목 추가',
    description: '관심목록에 새로운 암호화폐 심볼을 추가합니다.'
  })
  @ApiBody({ type: AddToWatchlistDto })
  @ApiResponse({
    status: 201,
    description: '관심목록 추가 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/DashboardResponseDto' },
        message: { type: 'string', example: '관심목록에 추가되었습니다.' }
      }
    }
  })
  async addToWatchlist(@Request() req, @Body() addToWatchlistDto: AddToWatchlistDto) {
    try {
      const userId = req.user.id;
      const result = await this.dashboardService.addToWatchlist(userId, addToWatchlistDto);
      return this.success(result, '관심목록에 추가되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Delete('watchlist/:symbol')
  @ApiOperation({
    summary: '관심목록에서 항목 제거',
    description: '관심목록에서 특정 암호화폐 심볼을 제거합니다.'
  })
  @ApiParam({
    name: 'symbol',
    description: '제거할 암호화폐 심볼',
    example: 'BTCUSDT'
  })
  @ApiResponse({
    status: 200,
    description: '관심목록 제거 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/DashboardResponseDto' },
        message: { type: 'string', example: '관심목록에서 제거되었습니다.' }
      }
    }
  })
  async removeFromWatchlist(@Request() req, @Param('symbol') symbol: string) {
    try {
      const userId = req.user.id;
      const result = await this.dashboardService.removeFromWatchlist(userId, symbol);
      return this.success(result, '관심목록에서 제거되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Get('watchlist/:symbol/check')
  @ApiOperation({
    summary: '관심목록 존재 여부 확인',
    description: '특정 심볼이 관심목록에 있는지 확인합니다.'
  })
  @ApiParam({
    name: 'symbol',
    description: '확인할 암호화폐 심볼',
    example: 'BTCUSDT'
  })
  @ApiResponse({
    status: 200,
    description: '존재 여부 확인 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'boolean', example: true },
        message: { type: 'string', example: '존재 여부 확인이 완료되었습니다.' }
      }
    }
  })
  async checkWatchlistItem(@Request() req, @Param('symbol') symbol: string) {
    try {
      const userId = req.user.id;
      const exists = await this.dashboardService.isInWatchlist(userId, symbol);
      return this.success(exists, '존재 여부 확인이 완료되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Get('settings')
  @ApiOperation({
    summary: '사용자 설정 조회',
    description: '현재 로그인한 사용자의 대시보드 설정을 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '사용자 설정 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            preferredTimeframe: { type: 'string', example: '1h' },
            theme: { type: 'string', example: 'dark' },
            notificationSettings: {
              type: 'object',
              properties: {
                priceAlerts: { type: 'boolean', example: true },
                newsUpdates: { type: 'boolean', example: true },
                recommendations: { type: 'boolean', example: true }
              }
            },
            layoutSettings: {
              type: 'object',
              properties: {
                showPriceChart: { type: 'boolean', example: true },
                showTechnicalIndicators: { type: 'boolean', example: true },
                showNews: { type: 'boolean', example: true },
                showRecommendations: { type: 'boolean', example: true }
              }
            }
          }
        },
        message: { type: 'string', example: '사용자 설정 조회가 완료되었습니다.' }
      }
    }
  })
  async getUserSettings(@Request() req) {
    try {
      const userId = req.user.id;
      const settings = await this.dashboardService.getUserSettings(userId);
      return this.success(settings, '사용자 설정 조회가 완료되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Put('settings/timeframe')
  @ApiOperation({
    summary: '선호하는 차트 타임프레임 업데이트',
    description: '사용자가 선호하는 차트 타임프레임을 업데이트합니다.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        timeframe: { 
          type: 'string', 
          example: '1h',
          enum: ['1m', '5m', '15m', '1h', '4h', '1d', '1w']
        }
      },
      required: ['timeframe']
    }
  })
  @ApiResponse({
    status: 200,
    description: '타임프레임 업데이트 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '타임프레임이 업데이트되었습니다.' }
      }
    }
  })
  async updatePreferredTimeframe(@Request() req, @Body() body: { timeframe: string }) {
    try {
      const userId = req.user.id;
      const result = await this.dashboardService.updatePreferredTimeframe(userId, body.timeframe);
      return this.success(result, '타임프레임이 업데이트되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Put('settings/theme')
  @ApiOperation({
    summary: '테마 업데이트',
    description: '사용자가 선호하는 테마를 업데이트합니다.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        theme: { 
          type: 'string', 
          example: 'dark',
          enum: ['light', 'dark', 'auto']
        }
      },
      required: ['theme']
    }
  })
  @ApiResponse({
    status: 200,
    description: '테마 업데이트 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '테마가 업데이트되었습니다.' }
      }
    }
  })
  async updateTheme(@Request() req, @Body() body: { theme: 'light' | 'dark' | 'auto' }) {
    try {
      const userId = req.user.id;
      const result = await this.dashboardService.updateTheme(userId, body.theme);
      return this.success(result, '테마가 업데이트되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Put('settings/notifications')
  @ApiOperation({
    summary: '알림 설정 업데이트',
    description: '사용자의 알림 설정을 업데이트합니다.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        notificationSettings: {
          type: 'object',
          properties: {
            priceAlerts: { type: 'boolean', example: true },
            newsUpdates: { type: 'boolean', example: true },
            recommendations: { type: 'boolean', example: true }
          }
        }
      },
      required: ['notificationSettings']
    }
  })
  @ApiResponse({
    status: 200,
    description: '알림 설정 업데이트 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '알림 설정이 업데이트되었습니다.' }
      }
    }
  })
  async updateNotificationSettings(
    @Request() req, 
    @Body() body: { 
      notificationSettings: {
        priceAlerts?: boolean;
        newsUpdates?: boolean;
        recommendations?: boolean;
      }
    }
  ) {
    try {
      const userId = req.user.id;
      const result = await this.dashboardService.updateNotificationSettings(
        userId, 
        body.notificationSettings
      );
      return this.success(result, '알림 설정이 업데이트되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Put('settings/layout')
  @ApiOperation({
    summary: '레이아웃 설정 업데이트',
    description: '사용자의 대시보드 레이아웃 설정을 업데이트합니다.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        layoutSettings: {
          type: 'object',
          properties: {
            showPriceChart: { type: 'boolean', example: true },
            showTechnicalIndicators: { type: 'boolean', example: true },
            showNews: { type: 'boolean', example: true },
            showRecommendations: { type: 'boolean', example: true }
          }
        }
      },
      required: ['layoutSettings']
    }
  })
  @ApiResponse({
    status: 200,
    description: '레이아웃 설정 업데이트 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '레이아웃 설정이 업데이트되었습니다.' }
      }
    }
  })
  async updateLayoutSettings(
    @Request() req, 
    @Body() body: { 
      layoutSettings: {
        showPriceChart?: boolean;
        showTechnicalIndicators?: boolean;
        showNews?: boolean;
        showRecommendations?: boolean;
      }
    }
  ) {
    try {
      const userId = req.user.id;
      const result = await this.dashboardService.updateLayoutSettings(
        userId, 
        body.layoutSettings
      );
      return this.success(result, '레이아웃 설정이 업데이트되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Get('stats')
  @ApiOperation({
    summary: '대시보드 통계 조회',
    description: '현재 로그인한 사용자의 대시보드 통계 정보를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '대시보드 통계 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            totalWatchlistItems: { type: 'number', example: 5 },
            theme: { type: 'string', example: 'dark' },
            preferredTimeframe: { type: 'string', example: '1h' },
            notificationSettings: {
              type: 'object',
              properties: {
                priceAlerts: { type: 'boolean', example: true },
                newsUpdates: { type: 'boolean', example: true },
                recommendations: { type: 'boolean', example: true }
              }
            },
            layoutSettings: {
              type: 'object',
              properties: {
                showPriceChart: { type: 'boolean', example: true },
                showTechnicalIndicators: { type: 'boolean', example: true },
                showNews: { type: 'boolean', example: true },
                showRecommendations: { type: 'boolean', example: true }
              }
            },
            lastUpdated: { type: 'string', example: '2024-01-15T10:30:00Z' }
          }
        },
        message: { type: 'string', example: '대시보드 통계 조회가 완료되었습니다.' }
      }
    }
  })
  async getDashboardStats(@Request() req) {
    try {
      const userId = req.user.id;
      const stats = await this.dashboardService.getDashboardStats(userId);
      return this.success(stats, '대시보드 통계 조회가 완료되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }
}



