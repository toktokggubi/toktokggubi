import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { login, kakaoLogin, fetchProfile, logout } from "../api/fetchers";

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
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("refresh_token");
      qc.clear();
    },
  });
};
