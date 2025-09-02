import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../../domain/entities/user/user.entity';
import { UserRepository } from '../../../domain/repositories/user/user-repository.interface';
import { 
  CreateUserDto, 
  UpdateUserDto, 
  UserResponseDto 
} from '../../../domain/entities/user';

@Injectable()
export class PostgresUserRepository implements UserRepository {
  private readonly userRepository: Repository<User>;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    this.userRepository = this.dataSource.getRepository(User);
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);
    return this.toUserResponseDto(savedUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user ? this.toUserResponseDto(user) : null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    await this.userRepository.update(id, updateUserDto);
    const updatedUser = await this.userRepository.findOne({ where: { id } });
    if (!updatedUser) {
      throw new Error('User not found');
    }
    return this.toUserResponseDto(updatedUser);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return result.affected > 0;
  }

  async findAll(page?: number, limit?: number): Promise<{
    users: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = page && limit ? (page - 1) * limit : 0;
    const take = limit || 10;
    
    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take,
      order: { createdAt: 'DESC' }
    });

    return {
      users: users.map(user => this.toUserResponseDto(user)),
      total,
      page: page || 1,
      limit: take
    };
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userRepository.count({ where: { email } });
    return count > 0;
  }

  async updateLastLogin(id: string): Promise<boolean> {
    const result = await this.userRepository.update(id, { lastLoginAt: new Date() });
    return result.affected > 0;
  }

  async updateEmailVerification(id: string, isVerified: boolean): Promise<boolean> {
    const result = await this.userRepository.update(id, { isEmailVerified: isVerified });
    return result.affected > 0;
  }

  private toUserResponseDto(user: User): UserResponseDto {
    return {
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
    };
  }
}
