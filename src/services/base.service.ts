/**
 * BaseResponse - 공통 응답 데이터 모델 인터페이스
 * 
 * 모든 API 응답의 표준 형식을 정의
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
 * abstract class - 추상 클래스로 정의
 * 공통 응답 형식 생성 메서드 제공
 */
export abstract class BaseService {
  
  // 성공 응답 생성
  protected success<T>(
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

  // 실패 응답 생성
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



  // 서버 내부 오류 응답 생성
  protected fail<T = any>(
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