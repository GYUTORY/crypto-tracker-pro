/**
 * 스트리밍 컨트롤러
 * 
 * WebSocket 연결 상태 관리 및 동적 심볼 구독/해제 API를 제공합니다.
 */
import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { StreamingRepository } from '@/infrastructure/streaming/streaming.repository';
import { SubscribeRequestDto, UnsubscribeRequestDto, StreamStatusResponseDto } from '@/shared/dto/price';
import { BaseService } from '@/shared/base-response';

@ApiTags('streaming')
@Controller('stream')
export class StreamController extends BaseService {
  constructor(
    @Inject('StreamingRepository')
    private readonly streamingRepository: StreamingRepository
  ) {
    super();
  }

  @Get('status')
  @ApiOperation({
    summary: 'WebSocket 연결 상태 조회',
    description: '바이낸스 WebSocket 연결 상태를 확인합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '연결 상태 조회 성공',
    schema: {
      type: 'object',
      properties: {
        result: { type: 'boolean', example: true },
        msg: { type: 'string', example: '연결 상태 조회 완료' },
        result_data: {
          type: 'object',
          properties: {
            isConnected: { type: 'boolean', example: true },
            subscriptions: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['BTCUSDT', 'ETHUSDT']
            }
          }
        },
        code: { type: 'string', example: 'S001' }
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  async getStatus() {
    const isConnected = this.streamingRepository.isConnected();
    const subscriptions = this.streamingRepository.getSubscriptions();

    return {
      result: true,
      msg: '연결 상태 조회 완료',
      result_data: {
        isConnected,
        subscriptions
      },
      code: 'S001'
    };
  }

  @Post('subscribe')
  @ApiOperation({
    summary: '심볼 구독',
    description: '특정 암호화폐 심볼을 실시간 스트림에 구독합니다.'
  })
  @ApiBody({ type: SubscribeRequestDto })
  @ApiResponse({
    status: 200,
    description: '구독 성공',
    schema: {
      type: 'object',
      properties: {
        result: { type: 'boolean', example: true },
        msg: { type: 'string', example: '구독 완료' },
        result_data: {
          type: 'object',
          properties: {
            subscribed: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['BTCUSDT', 'ETHUSDT']
            }
          }
        },
        code: { type: 'string', example: 'S001' }
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  async subscribe(@Body() body: SubscribeRequestDto) {
    try {
      await this.streamingRepository.subscribe(body.symbols);
      
      return {
        result: true,
        msg: '구독 완료',
        result_data: {
          subscribed: body.symbols
        },
        code: 'S001'
      };
    } catch (error) {
      return {
        result: false,
        msg: error.message,
        result_data: null,
        code: 'E400'
      };
    }
  }

  @Post('unsubscribe')
  @ApiOperation({
    summary: '심볼 구독 해제',
    description: '특정 암호화폐 심볼의 실시간 스트림 구독을 해제합니다.'
  })
  @ApiBody({ type: UnsubscribeRequestDto })
  @ApiResponse({
    status: 200,
    description: '구독 해제 성공',
    schema: {
      type: 'object',
      properties: {
        result: { type: 'boolean', example: true },
        msg: { type: 'string', example: '구독 해제 완료' },
        result_data: {
          type: 'object',
          properties: {
            unsubscribed: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['BTCUSDT', 'ETHUSDT']
            }
          }
        },
        code: { type: 'string', example: 'S001' }
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  async unsubscribe(@Body() body: UnsubscribeRequestDto) {
    try {
      await this.streamingRepository.unsubscribe(body.symbols);
      
      return {
        result: true,
        msg: '구독 해제 완료',
        result_data: {
          unsubscribed: body.symbols
        },
        code: 'S001'
      };
    } catch (error) {
      return {
        result: false,
        msg: error.message,
        result_data: null,
        code: 'E400'
      };
    }
  }

  @Get('subscriptions')
  @ApiOperation({
    summary: '현재 구독 목록 조회',
    description: '현재 구독 중인 모든 심볼 목록을 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '구독 목록 조회 성공',
    schema: {
      type: 'object',
      properties: {
        result: { type: 'boolean', example: true },
        msg: { type: 'string', example: '구독 목록 조회 완료' },
        result_data: {
          type: 'object',
          properties: {
            subscriptions: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['BTCUSDT', 'ETHUSDT']
            }
          }
        },
        code: { type: 'string', example: 'S001' }
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  async getSubscriptions() {
    const subscriptions = this.streamingRepository.getSubscriptions();

    return {
      result: true,
      msg: '구독 목록 조회 완료',
      result_data: {
        subscriptions
      },
      code: 'S001'
    };
  }
}
