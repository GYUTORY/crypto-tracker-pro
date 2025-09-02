import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  Request,
  UseGuards 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiBearerAuth,
  ApiParam,
  ApiQuery 
} from '@nestjs/swagger';
import { NotificationService } from '@/infrastructure/services/notification/notification.service';
import { BaseService } from '@/shared/base-response';
import { 
  CreateNotificationDto, 
  NotificationResponseDto, 
  NotificationType,
  PushSubscriptionDto 
} from '@/domain/entities/notification';

/**
 * 알림 컨트롤러
 * 
 * 사용자 알림 관리, 푸시 알림 구독 관리 API를 제공합니다.
 */
@ApiTags('Notification')
@Controller('notification')
@ApiBearerAuth()
export class NotificationController extends BaseService {
  constructor(private readonly notificationService: NotificationService) {
    super();
  }

  @Get()
  @ApiOperation({
    summary: '사용자 알림 목록 조회',
    description: '현재 로그인한 사용자의 알림 목록을 조회합니다.'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '페이지 번호 (기본값: 1)'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '페이지당 항목 수 (기본값: 20)'
  })
  @ApiQuery({
    name: 'isRead',
    required: false,
    type: Boolean,
    description: '읽음 상태 필터'
  })
  @ApiResponse({
    status: 200,
    description: '알림 목록 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            notifications: {
              type: 'array',
              items: { $ref: '#/components/schemas/NotificationResponseDto' }
            },
            total: { type: 'number', example: 50 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 }
          }
        },
        message: { type: 'string', example: '알림 목록 조회가 완료되었습니다.' }
      }
    }
  })
  async getUserNotifications(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('isRead') isRead?: boolean
  ) {
    try {
      const userId = req.user.id;
      const result = await this.notificationService.getUserNotifications(
        userId, 
        page, 
        limit, 
        isRead
      );
      return this.success(result, '알림 목록 조회가 완료되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Get('unread-count')
  @ApiOperation({
    summary: '읽지 않은 알림 개수 조회',
    description: '현재 로그인한 사용자의 읽지 않은 알림 개수를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '읽지 않은 알림 개수 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'number', example: 5 },
        message: { type: 'string', example: '읽지 않은 알림 개수 조회가 완료되었습니다.' }
      }
    }
  })
  async getUnreadCount(@Request() req) {
    try {
      const userId = req.user.id;
      const count = await this.notificationService.getUnreadCount(userId);
      return this.success(count, '읽지 않은 알림 개수 조회가 완료되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Put(':id/read')
  @ApiOperation({
    summary: '알림 읽음 처리',
    description: '특정 알림을 읽음 상태로 변경합니다.'
  })
  @ApiParam({
    name: 'id',
    description: '알림 ID',
    example: 'n_1234567890'
  })
  @ApiResponse({
    status: 200,
    description: '알림 읽음 처리 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '알림이 읽음 처리되었습니다.' }
      }
    }
  })
  async markAsRead(@Param('id') id: string) {
    try {
      const result = await this.notificationService.markAsRead(id);
      return this.success(result, '알림이 읽음 처리되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Put('read-all')
  @ApiOperation({
    summary: '모든 알림 읽음 처리',
    description: '현재 로그인한 사용자의 모든 알림을 읽음 상태로 변경합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '모든 알림 읽음 처리 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '모든 알림이 읽음 처리되었습니다.' }
      }
    }
  })
  async markAllAsRead(@Request() req) {
    try {
      const userId = req.user.id;
      const result = await this.notificationService.markAllAsRead(userId);
      return this.success(result, '모든 알림이 읽음 처리되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: '알림 삭제',
    description: '특정 알림을 삭제합니다.'
  })
  @ApiParam({
    name: 'id',
    description: '알림 ID',
    example: 'n_1234567890'
  })
  @ApiResponse({
    status: 200,
    description: '알림 삭제 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '알림이 삭제되었습니다.' }
      }
    }
  })
  async deleteNotification(@Param('id') id: string) {
    try {
      const result = await this.notificationService.delete(id);
      return this.success(result, '알림이 삭제되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Get('type/:type')
  @ApiOperation({
    summary: '타입별 알림 조회',
    description: '특정 타입의 알림 목록을 조회합니다.'
  })
  @ApiParam({
    name: 'type',
    description: '알림 타입',
    enum: NotificationType,
    example: 'PRICE_ALERT'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '페이지 번호 (기본값: 1)'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '페이지당 항목 수 (기본값: 20)'
  })
  @ApiResponse({
    status: 200,
    description: '타입별 알림 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            notifications: {
              type: 'array',
              items: { $ref: '#/components/schemas/NotificationResponseDto' }
            },
            total: { type: 'number', example: 10 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 }
          }
        },
        message: { type: 'string', example: '타입별 알림 조회가 완료되었습니다.' }
      }
    }
  })
  async getNotificationsByType(
    @Request() req,
    @Param('type') type: NotificationType,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    try {
      const userId = req.user.id;
      const result = await this.notificationService.getNotificationsByType(
        userId, 
        type, 
        page, 
        limit
      );
      return this.success(result, '타입별 알림 조회가 완료되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Post('push/subscribe')
  @ApiOperation({
    summary: '푸시 알림 구독',
    description: '푸시 알림 구독을 추가합니다.'
  })
  @ApiBody({ type: PushSubscriptionDto })
  @ApiResponse({
    status: 201,
    description: '푸시 알림 구독 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '푸시 알림 구독이 완료되었습니다.' }
      }
    }
  })
  async addPushSubscription(
    @Request() req,
    @Body() subscription: PushSubscriptionDto
  ) {
    try {
      const userId = req.user.id;
      const result = await this.notificationService.addPushSubscription(userId, subscription);
      return this.success(result, '푸시 알림 구독이 완료되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Delete('push/unsubscribe')
  @ApiOperation({
    summary: '푸시 알림 구독 해제',
    description: '푸시 알림 구독을 해제합니다.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        endpoint: { type: 'string', example: 'https://fcm.googleapis.com/fcm/send/...' }
      },
      required: ['endpoint']
    }
  })
  @ApiResponse({
    status: 200,
    description: '푸시 알림 구독 해제 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '푸시 알림 구독이 해제되었습니다.' }
      }
    }
  })
  async removePushSubscription(
    @Request() req,
    @Body() body: { endpoint: string }
  ) {
    try {
      const userId = req.user.id;
      const result = await this.notificationService.removePushSubscription(userId, body.endpoint);
      return this.success(result, '푸시 알림 구독이 해제되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Get('push/subscriptions')
  @ApiOperation({
    summary: '푸시 알림 구독 목록 조회',
    description: '현재 로그인한 사용자의 푸시 알림 구독 목록을 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '푸시 알림 구독 목록 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/PushSubscriptionDto' }
        },
        message: { type: 'string', example: '푸시 알림 구독 목록 조회가 완료되었습니다.' }
      }
    }
  })
  async getPushSubscriptions(@Request() req) {
    try {
      const userId = req.user.id;
      const subscriptions = await this.notificationService.getPushSubscriptions(userId);
      return this.success(subscriptions, '푸시 알림 구독 목록 조회가 완료되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }
}

