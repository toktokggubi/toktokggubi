import { http } from "@/shared/api/http";
import { AUTH_ENDPOINTS } from "./endpoints";

// UM-4 이메일 로그인
export async function login(dto: { email: string; password: string }) {
  const { data } = await http.post(AUTH_ENDPOINTS.login, dto);
  return data as {
    message: string;
    userId: number;
    token?: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      refreshExpiresIn: number;
      tokenType: string;
    };
  };
}

// UM-6 카카오 로그인
export async function kakaoLogin(accessToken: string) {
  const { data } = await http.post(AUTH_ENDPOINTS.kakaoLogin, { accessToken });
  return data as {
    message: string;
    userId: number;
    token?: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      refreshExpiresIn: number;
      tokenType: string;
    };
  };
}

// UM-10 가입 완료(Authorization: Bearer <signupToken>)
export async function signupComplete(payload: {
  nickname: string;
  gender: string;
  ageGroup: string;
  jobTitle: string;
  monthlyIncome: number;
}) {
  const { data } = await http.post(AUTH_ENDPOINTS.signupComplete, payload);
  return data;
}

// UM-11 내 프로필
export async function fetchProfile() {
  const { data } = await http.get(AUTH_ENDPOINTS.profile);
  return data as {
    userId: number;
    nickname: string;
    gender: string;
    ageGroup: string;
    jobTitle: string;
    monthlyIncome: number;
  };
}

// UM-12 프로필 수정
export async function updateProfile(payload: {
  nickname: string;
  ageGroup: string;
  jobTitle: string;
  monthlyIncome: number;
}) {
  const { data } = await http.put(AUTH_ENDPOINTS.profile, payload);
  return data as { message: string };
}

// UM-7 로그아웃
export async function logout() {
  const { data } = await http.post(AUTH_ENDPOINTS.logout);
  return data as { message: string };
}
