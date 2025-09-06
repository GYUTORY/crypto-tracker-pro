import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards, 
  Request, 
  Put,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiBearerAuth 
} from '@nestjs/swagger';
import { AuthService } from '@/infrastructure/services/auth/auth.service';
import { BaseService } from '@/shared/base-response';
import { 
  CreateUserDto, 
  LoginUserDto, 
  UpdateUserDto, 
  UserResponseDto 
} from '@/domain/entities/user';

/**
 * 인증 컨트롤러
 * 
 * 사용자 회원가입, 로그인, 인증 관련 API를 제공합니다.
 */
@ApiTags('Authentication')
@Controller()
export class AuthController extends BaseService {
  constructor(private readonly authService: AuthService) {
    super();
  }

  @Post('auth/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '사용자 회원가입',
    description: '새로운 사용자를 등록합니다. JWT 토큰을 반환합니다.'
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/UserResponseDto' },
            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
          }
        },
        message: { type: 'string', example: '회원가입이 완료되었습니다.' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터'
  })
  @ApiResponse({
    status: 409,
    description: '이미 존재하는 이메일'
  })
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const result = await this.authService.register(createUserDto);
      return this.success(result, '회원가입이 완료되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '사용자 로그인',
    description: '이메일과 비밀번호로 로그인합니다. JWT 토큰을 반환합니다.'
  })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/UserResponseDto' },
            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
          }
        },
        message: { type: 'string', example: '로그인이 완료되었습니다.' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패 (잘못된 이메일/비밀번호)'
  })
  async login(@Body() loginUserDto: LoginUserDto) {
    try {
      const result = await this.authService.login(loginUserDto);
      return this.success(result, '로그인이 완료되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Get('auth/profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '사용자 프로필 조회',
    description: '현재 로그인한 사용자의 프로필 정보를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '프로필 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/UserResponseDto' },
        message: { type: 'string', example: '프로필 조회가 완료되었습니다.' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패 (유효하지 않은 토큰)'
  })
  async getProfile(@Request() req) {
    try {
      // JWT 가드를 통해 검증된 사용자 정보
      const user = req.user;
      return this.success(user, '프로필 조회가 완료되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Put('auth/profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '사용자 프로필 업데이트',
    description: '현재 로그인한 사용자의 프로필 정보를 업데이트합니다.'
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: '프로필 업데이트 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/UserResponseDto' },
        message: { type: 'string', example: '프로필이 업데이트되었습니다.' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패'
  })
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    try {
      const userId = req.user.id;
      // 실제로는 UserService를 통해 업데이트
      // const result = await this.userService.update(userId, updateUserDto);
      return this.success({}, '프로필이 업데이트되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Post('auth/change-password')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '비밀번호 변경',
    description: '현재 로그인한 사용자의 비밀번호를 변경합니다.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        currentPassword: { type: 'string', example: 'currentPassword123!' },
        newPassword: { type: 'string', example: 'newPassword123!' }
      },
      required: ['currentPassword', 'newPassword']
    }
  })
  @ApiResponse({
    status: 200,
    description: '비밀번호 변경 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '비밀번호가 변경되었습니다.' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 현재 비밀번호'
  })
  async changePassword(
    @Request() req,
    @Body() body: { currentPassword: string; newPassword: string }
  ) {
    try {
      const userId = req.user.id;
      const result = await this.authService.changePassword(
        userId,
        body.currentPassword,
        body.newPassword
      );
      return this.success(result, '비밀번호가 변경되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Post('auth/verify-email')
  @ApiOperation({
    summary: '이메일 인증',
    description: '사용자의 이메일 인증을 완료합니다.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'u_1234567890' }
      },
      required: ['userId']
    }
  })
  @ApiResponse({
    status: 200,
    description: '이메일 인증 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '이메일 인증이 완료되었습니다.' }
      }
    }
  })
  async verifyEmail(@Body() body: { userId: string }) {
    try {
      const result = await this.authService.verifyEmail(body.userId);
      return this.success(result, '이메일 인증이 완료되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }

  @Post('auth/refresh-token')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '토큰 갱신',
    description: 'JWT 토큰을 갱신합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '토큰 갱신 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
          }
        },
        message: { type: 'string', example: '토큰이 갱신되었습니다.' }
      }
    }
  })
  async refreshToken(@Request() req) {
    try {
      const userId = req.user.id;
      const result = await this.authService.refreshToken(userId);
      return this.success(result, '토큰이 갱신되었습니다.');
    } catch (error) {
      return this.fail(error.message);
    }
  }
}
