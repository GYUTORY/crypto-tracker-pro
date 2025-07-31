/**
 * 공통 응답 형식
 * 
 * 모든 API 응답에서 사용하는 표준화된 응답 구조입니다.
 * 일관된 응답 형식을 통해 클라이언트가 응답을 쉽게 처리할 수 있도록 합니다.
 * 
 * @template T 응답 데이터의 타입
 */
export interface BaseResponse<T = any> {
  result: boolean;    // 요청 성공 여부
  msg: string;        // 응답 메시지 (사용자에게 보여줄 메시지)
  result_data: T;     // 실제 응답 데이터
  code: string;       // 응답 코드 (성공/실패 구분 및 세부 코드)
}

/**
 * 성공 응답 코드
 * 
 * API 요청이 성공적으로 처리되었을 때 사용하는 코드들입니다.
 */
export const SUCCESS_CODES = {
  SUCCESS: 'S001',    // 일반적인 성공
  NO_DATA: 'S002'     // 성공했지만 데이터가 없는 경우
} as const;

/**
 * 에러 응답 코드
 * 
 * API 요청 처리 중 오류가 발생했을 때 사용하는 코드들입니다.
 */
export const ERROR_CODES = {
  GENERAL_ERROR: 'E001',    // 일반적인 오류
  BAD_REQUEST: 'E400',      // 잘못된 요청 (클라이언트 오류)
  INTERNAL_ERROR: 'E500'    // 서버 내부 오류
} as const;

/**
 * 기본 서비스 클래스
 * 
 * 모든 서비스 클래스가 상속받아 사용하는 기본 클래스입니다.
 * 공통 응답 형식을 생성하는 메서드들을 제공하여 일관된 응답을 보장합니다.
 * 
 * 추상 클래스로 선언하여 직접 인스턴스화를 방지하고,
 * 상속을 통해서만 사용할 수 있도록 합니다.
 */
export abstract class BaseService {
  
  /**
   * 성공 응답 생성
   * 
   * 요청이 성공적으로 처리되었을 때 사용하는 응답을 생성합니다.
   * 
   * @param data 응답 데이터
   * @param message 응답 메시지 (기본값: '성공')
   * @param code 응답 코드 (기본값: 'S001')
   * @returns 성공 응답 객체
   */
  protected success<T>(
    data: T,
    message: string = '성공',
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
   * 실패 응답 생성
   * 
   * 요청 처리 중 오류가 발생했을 때 사용하는 응답을 생성합니다.
   * 
   * @param message 오류 메시지
   * @param code 오류 코드 (기본값: 'E001')
   * @param data 추가 데이터 (선택적)
   * @returns 실패 응답 객체
   */
  protected false<T = any>(
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
   * 서버 오류 응답 생성
   * 
   * 서버 내부에서 발생한 예상치 못한 오류에 대한 응답을 생성합니다.
   * 
   * @param message 오류 메시지 (기본값: '서버 오류')
   * @param data 추가 데이터 (선택적)
   * @returns 서버 오류 응답 객체
   */
  protected fail<T = any>(
    message: string = '서버 오류',
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