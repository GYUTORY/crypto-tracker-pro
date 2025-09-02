import { Injectable } from '@nestjs/common';
import { UserRepository } from '@/domain/repositories/user/user-repository.interface';
import { 
  User, 
  CreateUserDto, 
  UpdateUserDto, 
  UserResponseDto 
} from '@/domain/entities/user';
import * as bcrypt from 'bcrypt';

/**
 * 메모리 기반 사용자 리포지토리
 * 
 * 개발 및 테스트용으로 사용되는 인메모리 사용자 데이터 저장소입니다.
 */
@Injectable()
export class MemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();
  private emailToId: Map<string, string> = new Map();

  constructor() {
    // 테스트용 기본 사용자 생성
    this.createDefaultUsers();
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const id = `u_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 이메일 중복 확인
    if (this.emailToId.has(createUserDto.email)) {
      throw new Error('이미 존재하는 이메일입니다.');
    }

    const user: User = {
      id,
      email: createUserDto.email,
      name: createUserDto.name,
      nickname: createUserDto.nickname,
      password: createUserDto.password, // 이미 해시된 상태로 전달됨
      profileImage: undefined,
      role: 'user',
      isActive: true,
      isEmailVerified: false,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(id, user);
    this.emailToId.set(createUserDto.email, id);

    return this.toUserResponseDto(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const userId = this.emailToId.get(email);
    if (!userId) return null;
    
    const user = this.users.get(userId);
    return user || null;
  }

  async findById(id: string): Promise<UserResponseDto | null> {
    const user = this.users.get(id);
    return user ? this.toUserResponseDto(user) : null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    const updatedUser: User = {
      ...user,
      ...updateUserDto,
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);
    return this.toUserResponseDto(updatedUser);
  }

  async delete(id: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;

    this.users.delete(id);
    this.emailToId.delete(user.email);
    return true;
  }

  async findAll(page: number = 1, limit: number = 20): Promise<{
    users: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const allUsers = Array.from(this.users.values());
    const total = allUsers.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = allUsers.slice(startIndex, endIndex);

    return {
      users: paginatedUsers.map(user => this.toUserResponseDto(user)),
      total,
      page,
      limit,
    };
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.emailToId.has(email);
  }

  async updateLastLogin(id: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;

    user.lastLoginAt = new Date();
    user.updatedAt = new Date();
    this.users.set(id, user);
    return true;
  }

  async updateEmailVerification(id: string, isVerified: boolean): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;

    user.isEmailVerified = isVerified;
    user.updatedAt = new Date();
    this.users.set(id, user);
    return true;
  }

  private toUserResponseDto(user: User): UserResponseDto {
    const { password, ...userResponse } = user;
    return userResponse as UserResponseDto;
  }

  private createDefaultUsers() {
    // 테스트용 관리자 사용자
    const adminUser: User = {
      id: 'u_admin_001',
      email: 'admin@example.com',
      name: '관리자',
      nickname: 'admin',
      password: bcrypt.hashSync('admin123!', 10),
      profileImage: undefined,
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 테스트용 일반 사용자
    const normalUser: User = {
      id: 'u_user_001',
      email: 'user@example.com',
      name: '일반사용자',
      nickname: 'user',
      password: bcrypt.hashSync('user123!', 10),
      profileImage: undefined,
      role: 'user',
      isActive: true,
      isEmailVerified: true,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(adminUser.id, adminUser);
    this.users.set(normalUser.id, normalUser);
    this.emailToId.set(adminUser.email, adminUser.id);
    this.emailToId.set(normalUser.email, normalUser.id);
  }
}



