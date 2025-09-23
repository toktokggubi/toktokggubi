import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { login, kakaoLogin, fetchProfile, logout, signup, signupComplete, updateProfile } from "../api/fetchers";
import type { SignupRequest } from "../types/signup.types";
import FCMService from "@/shared/services/fcmService";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

// 내 프로필
export const useProfileQuery = () =>
  useQuery({
    queryKey: authKeys.me(),
    queryFn: fetchProfile,
    staleTime: 60_000,
  });

// FCM 토큰을 서버에 전송하는 헬퍼 함수
const sendFCMTokenToServer = async (accessToken: string) => {
  try {
    console.log('🔔 FCM: 로그인 후 토큰 전송 시작');
    const fcmService = FCMService.getInstance();
    const fcmToken = await fcmService.getToken();
    
    if (fcmToken) {
      console.log('🔔 FCM: 토큰 획득 성공, 서버 전송 중...');
      await fcmService.sendTokenToServer(fcmToken, accessToken);
    } else {
      console.log('🔔 FCM: 토큰 획득 실패');
    }
  } catch (error) {
    console.log('🔔 FCM: 토큰 전송 중 오류:', error);
    // FCM 토큰 전송 실패는 로그인을 방해하지 않도록 에러를 무시
  }
};

// 이메일 로그인
export const useEmailLogin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: async (res) => {
      const at = res.token?.accessToken;
      const rt = res.token?.refreshToken;
      if (at) await SecureStore.setItemAsync("access_token", at);
      if (rt) await SecureStore.setItemAsync("refresh_token", rt);
      
      // FCM 토큰을 서버에 전송
      if (at) {
        await sendFCMTokenToServer(at);
      }
      
      qc.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
};

// 카카오 로그인
export const useKakaoLogin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (kakaoAccessToken: string) => kakaoLogin(kakaoAccessToken),
    onSuccess: async (res) => {
      const at = res?.token?.accessToken;
      const rt = res?.token?.refreshToken;
      if (at) await SecureStore.setItemAsync("access_token", at);
      if (rt) await SecureStore.setItemAsync("refresh_token", rt);
      
      // FCM 토큰을 서버에 전송
      if (at) {
        await sendFCMTokenToServer(at);
      }
      
      qc.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
};

// 회원가입
export const useSignup = () => {
  return useMutation({
    mutationFn: (data: SignupRequest) => signup(data),
    onSuccess: async (res) => {
      // 회원가입 성공 시 signupToken을 저장
      if (res.signupToken) {
        await SecureStore.setItemAsync("signup_token", res.signupToken);
      }
    },
  });
};

// 회원가입 완료
export const useSignupComplete = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      nickname: string;
      gender: string;
      ageGroup: string;
      jobTitle: string;
      monthlyIncome: number;
    }) => {
      const signupToken = await SecureStore.getItemAsync("signup_token");
      if (!signupToken) {
        throw new Error("회원가입 토큰이 없습니다.");
      }
      return signupComplete(payload, signupToken);
    },
    onSuccess: async (res) => {
      // 회원가입 완료 후 signupToken 삭제
      await SecureStore.deleteItemAsync("signup_token");
      
      // 액세스 토큰과 리프레시 토큰 저장
      if (res.token?.accessToken) {
        await SecureStore.setItemAsync("access_token", res.token.accessToken);
      }
      if (res.token?.refreshToken) {
        await SecureStore.setItemAsync("refresh_token", res.token.refreshToken);
      }
      
      // FCM 토큰을 서버에 전송
      if (res.token?.accessToken) {
        await sendFCMTokenToServer(res.token.accessToken);
      }
      
      // 프로필 쿼리 무효화
      qc.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
};

// 프로필 수정
export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
};

// 로그아웃
export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      // FCM 토큰 삭제 (모든 기기에서 로그아웃)
      try {
        const fcmService = FCMService.getInstance();
        const accessToken = await SecureStore.getItemAsync("access_token");
        if (accessToken) {
          await fcmService.deleteToken(accessToken, true); // 모든 토큰 삭제
        }
      } catch (error) {
      }
      
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("refresh_token");
      qc.clear();
    },
  });
};
