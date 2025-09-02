import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '@/domain/repositories/user/user-repository.interface';
import { CreateUserDto, LoginUserDto, UserResponseDto } from '@/domain/entities/user';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{
    user: UserResponseDto;
    accessToken: string;
  }> {
    // 이메일 중복 확인
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 사용자 생성
    const user = await this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // JWT 토큰 생성
    const accessToken = this.generateToken(user);

    return {
      user,
      accessToken,
    };
  }

  async login(loginDto: LoginUserDto): Promise<{
    user: UserResponseDto;
    accessToken: string;
  }> {
    // 사용자 조회
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 마지막 로그인 시간 업데이트
    await this.userRepository.updateLastLogin(user.id);

    // JWT 토큰 생성
    const accessToken = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        profileImage: user.profileImage,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
    };
  }

  async validateToken(token: string): Promise<UserResponseDto> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  async refreshToken(userId: string): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    const accessToken = this.generateToken(user);
    return { accessToken };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.userRepository.findByEmail(userId);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    // 현재 비밀번호 검증
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('현재 비밀번호가 올바르지 않습니다.');
    }

    // 새 비밀번호 해시화
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 비밀번호 업데이트
    await this.userRepository.update(userId, { password: hashedNewPassword } as any);
    return true;
  }

  async verifyEmail(userId: string): Promise<boolean> {
    return this.userRepository.updateEmailVerification(userId, true);
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    if (user.isEmailVerified) {
      throw new ConflictException('이미 인증된 이메일입니다.');
    }

    // TODO: 이메일 인증 메일 재전송 로직 구현
    console.log(`인증 메일 재전송: ${email}`);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // 보안상 사용자가 존재하지 않아도 성공 응답
      return;
    }

    // TODO: 비밀번호 재설정 메일 전송 로직 구현
    console.log(`비밀번호 재설정 메일 전송: ${email}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const payload = this.jwtService.verify(token);
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.userRepository.update(payload.sub, { password: hashedPassword } as any);
      return true;
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  private generateToken(user: any): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }
}
