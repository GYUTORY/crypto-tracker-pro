import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * 사용자 엔티티
 * 
 * 사용자 정보를 담는 도메인 엔티티입니다.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: '사용자 고유 ID',
    example: 'u_1234567890'
  })
  id: string;

  @Column({ unique: true })
  @Index()
  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com'
  })
  email: string;

  @Column()
  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동'
  })
  name: string;

  @Column({ unique: true })
  @Index()
  @ApiProperty({
    description: '사용자 닉네임',
    example: 'crypto_trader'
  })
  nickname: string;

  @Column()
  @ApiProperty({
    description: '비밀번호 (해시된 값)',
    example: '$2b$10$...'
  })
  password: string;

  @Column({ nullable: true })
  @ApiProperty({
    description: '사용자 프로필 이미지 URL',
    example: 'https://example.com/profile.jpg',
    required: false
  })
  profileImage?: string;

  @Column({ default: 'user' })
  @ApiProperty({
    description: '사용자 역할',
    example: 'user',
    enum: ['user', 'admin', 'premium']
  })
  role: 'user' | 'admin' | 'premium';

  @Column({ default: true })
  @ApiProperty({
    description: '계정 활성화 상태',
    example: true
  })
  isActive: boolean;

  @Column({ default: false })
  @ApiProperty({
    description: '이메일 인증 상태',
    example: true
  })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  @ApiProperty({
    description: '마지막 로그인 시간',
    example: '2024-01-15T10:30:00Z'
  })
  lastLoginAt: Date;

  @CreateDateColumn()
  @ApiProperty({
    description: '계정 생성 시간',
    example: '2024-01-01T00:00:00Z'
  })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({
    description: '계정 수정 시간',
    example: '2024-01-15T10:30:00Z'
  })
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}

/**
 * 사용자 생성 DTO
 */
export class CreateUserDto {
  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com'
  })
  email: string;

  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동'
  })
  name: string;

  @ApiProperty({
    description: '사용자 닉네임',
    example: 'crypto_trader'
  })
  nickname: string;

  @ApiProperty({
    description: '비밀번호',
    example: 'securePassword123!'
  })
  password: string;
}

/**
 * 사용자 업데이트 DTO
 */
export class UpdateUserDto {
  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
    required: false
  })
  name?: string;

  @ApiProperty({
    description: '사용자 닉네임',
    example: 'crypto_trader',
    required: false
  })
  nickname?: string;

  @ApiProperty({
    description: '사용자 프로필 이미지 URL',
    example: 'https://example.com/profile.jpg',
    required: false
  })
  profileImage?: string;
}

/**
 * 사용자 로그인 DTO
 */
export class LoginUserDto {
  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com'
  })
  email: string;

  @ApiProperty({
    description: '비밀번호',
    example: 'securePassword123!'
  })
  password: string;
}

/**
 * 사용자 응답 DTO (비밀번호 제외)
 */
export class UserResponseDto {
  @ApiProperty({
    description: '사용자 고유 ID',
    example: 'u_1234567890'
  })
  id: string;

  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com'
  })
  email: string;

  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동'
  })
  name: string;

  @ApiProperty({
    description: '사용자 닉네임',
    example: 'crypto_trader'
  })
  nickname: string;

  @ApiProperty({
    description: '사용자 프로필 이미지 URL',
    example: 'https://example.com/profile.jpg',
    required: false
  })
  profileImage?: string;

  @ApiProperty({
    description: '사용자 역할',
    example: 'user'
  })
  role: string;

  @ApiProperty({
    description: '계정 활성화 상태',
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: '이메일 인증 상태',
    example: true
  })
  isEmailVerified: boolean;

  @ApiProperty({
    description: '마지막 로그인 시간',
    example: '2024-01-15T10:30:00Z'
  })
  lastLoginAt: Date;

  @ApiProperty({
    description: '계정 생성 시간',
    example: '2024-01-01T00:00:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: '계정 수정 시간',
    example: '2024-01-15T10:30:00Z'
  })
  updatedAt: Date;
}
