import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from '@/infrastructure/services/auth/auth.service';

/**
 * JWT 인증 가드
 * 
 * HttpOnly 쿠키에서 JWT 토큰을 추출하여 사용자 인증을 검증합니다.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookie(request);
    
    if (!token) {
      throw new UnauthorizedException('인증 토큰이 없습니다.');
    }

    try {
      // JWT 토큰 검증 및 사용자 정보 조회
      const user = await this.authService.validateToken(token);
      
      // 요청 객체에 사용자 정보 추가
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  /**
   * HttpOnly 쿠키에서 JWT 토큰 추출
   * @param request - HTTP 요청 객체
   * @returns JWT 토큰 또는 null
   */
  private extractTokenFromCookie(request: Request): string | null {
    const cookies = request.cookies;
    return cookies?.auth_token || null;
  }
}



