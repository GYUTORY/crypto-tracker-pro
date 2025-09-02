import { User, CreateUserDto, UpdateUserDto, UserResponseDto } from '@/domain/entities/user';

/**
 * 사용자 리포지토리 인터페이스
 * 
 * 사용자 데이터 접근을 위한 추상화된 인터페이스입니다.
 */
export interface UserRepository {
  /**
   * 사용자 생성
   * @param createUserDto - 사용자 생성 데이터
   * @returns 생성된 사용자 정보
   */
  create(createUserDto: CreateUserDto): Promise<UserResponseDto>;

  /**
   * 이메일로 사용자 조회
   * @param email - 사용자 이메일
   * @returns 사용자 정보 (비밀번호 포함)
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * ID로 사용자 조회
   * @param id - 사용자 ID
   * @returns 사용자 정보
   */
  findById(id: string): Promise<UserResponseDto | null>;

  /**
   * 사용자 정보 업데이트
   * @param id - 사용자 ID
   * @param updateUserDto - 업데이트할 데이터
   * @returns 업데이트된 사용자 정보
   */
  update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto>;

  /**
   * 사용자 삭제
   * @param id - 사용자 ID
   * @returns 삭제 성공 여부
   */
  delete(id: string): Promise<boolean>;

  /**
   * 사용자 목록 조회
   * @param page - 페이지 번호
   * @param limit - 페이지당 항목 수
   * @returns 사용자 목록
   */
  findAll(page?: number, limit?: number): Promise<{
    users: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * 사용자 존재 여부 확인
   * @param email - 사용자 이메일
   * @returns 존재 여부
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * 사용자 마지막 로그인 시간 업데이트
   * @param id - 사용자 ID
   * @returns 업데이트 성공 여부
   */
  updateLastLogin(id: string): Promise<boolean>;

  /**
   * 이메일 인증 상태 업데이트
   * @param id - 사용자 ID
   * @param isVerified - 인증 상태
   * @returns 업데이트 성공 여부
   */
  updateEmailVerification(id: string, isVerified: boolean): Promise<boolean>;
}
