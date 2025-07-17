// HttpStatus는 더 이상 사용하지 않으므로 제거

/**
 * 공통 응답 데이터 모델 인터페이스
 */
export interface BaseResponse<T = any> {
  result: boolean;
  msg: string;
  result_data: T;
  code: string;
}

/**
 * BaseService - 모든 서비스의 기본 클래스
 * 
 * 모든 서비스가 상속받아서 사용하는 공통 기능들을 제공합니다:
 * - 성공/실패 응답 생성
 * - HTTP 상태 코드 관리
 * - 일관된 응답 형식 보장
 */
export abstract class BaseService {
  
  /**
   * 성공 응답을 생성합니다.
   * @param data 응답 데이터
   * @param message 성공 메시지 (기본값: "Success")
   * @param code 응답 코드 (기본값: "S001")
   * @returns BaseResponse 형태의 성공 응답
   */
  protected createSuccessResponse<T>(
    data: T,
    message: string = 'Success',
    code: string = 'S001'
  ): BaseResponse<T> {
    return {
      result: true,
      msg: message,
      result_data: data,
      code: code
    };
  }

  /**
   * 실패 응답을 생성합니다.
   * @param message 에러 메시지
   * @param code 에러 코드 (기본값: "E001")
   * @param data 추가 에러 데이터 (선택사항)
   * @returns BaseResponse 형태의 실패 응답
   */
  protected createErrorResponse<T = any>(
    message: string,
    code: string = 'E001',
    data?: T
  ): BaseResponse<T> {
    return {
      result: false,
      msg: message,
      result_data: data || null,
      code: code
    };
  }

  /**
   * 데이터가 없는 경우의 응답을 생성합니다.
   * @param message 메시지 (기본값: "No data found")
   * @returns BaseResponse 형태의 빈 데이터 응답
   */
  protected createNoDataResponse(
    message: string = 'No data found'
  ): BaseResponse<null> {
    return {
      result: true,
      msg: message,
      result_data: null,
      code: 'S002'
    };
  }

  /**
   * 서버 내부 오류 응답을 생성합니다.
   * @param message 에러 메시지 (기본값: "Internal server error")
   * @param data 추가 에러 데이터 (선택사항)
   * @returns BaseResponse 형태의 서버 오류 응답
   */
  protected createInternalErrorResponse<T = any>(
    message: string = 'Internal server error',
    data?: T
  ): BaseResponse<T> {
    return {
      result: false,
      msg: message,
      result_data: data || null,
      code: 'E500'
    };
  }
} 