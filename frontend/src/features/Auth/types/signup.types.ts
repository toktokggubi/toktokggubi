// 회원가입 요청 타입
export interface SignupRequest {
  email: string;
  password: string;
}

// 회원가입 응답 타입
export interface SignupResponse {
  signupToken: string;
  message: string;
}

// 회원가입 폼 상태 타입
export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

// 회원가입 폼 에러 타입
export interface SignupFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}
