import { queryClient } from "@/shared/lib/queryClient";
import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from "axios";
import * as SecureStore from "expo-secure-store";

// ─────────────────────────────────────────────────────────────
// 1) 공용 axios 인스턴스
// ─────────────────────────────────────────────────────────────
export const http = axios.create({
  baseURL: "https://j13b207.p.ssafy.io/api",
  timeout: 10_000,
  withCredentials: false,
});

// ─────────────────────────────────────────────────────────────
// 2) Request 인터셉터: 액세스 토큰 자동 주입
// ─────────────────────────────────────────────────────────────
const AUTH_FREE = [
  "/auth/signup",
  "/auth/login",
  // "/auth/kakao/login",
  "/auth/password/reset",
  "/auth/token/refresh",
];

http.interceptors.request.use(async (config) => {
  // 비인증 엔드포인트는 토큰 주입 X
  if (AUTH_FREE.some((p) => config.url?.startsWith(p))) {
    return config;
  }

  const token = await SecureStore.getItemAsync("access_token");
  if (token) {
    config.headers = new AxiosHeaders({
      ...(config.headers ?? {}),
      Authorization: `Bearer ${token}`,
    });
  }
  return config;
});

// ─────────────────────────────────────────────────────────────
// 3) 401 응답 공통 처리: 토큰 재발급 + 원요청 재시도
//    - UM-9: POST /auth/token/refresh { refreshToken }
//    - 응답: { token: { accessToken, refreshToken, ... } }
// ─────────────────────────────────────────────────────────────
let isRefreshing = false;
let waiting: Array<() => void> = [];

async function doRefresh(): Promise<string> {
  const refresh = await SecureStore.getItemAsync("refresh_token");
  if (!refresh) throw new Error("NO_REFRESH_TOKEN");

  const res = await axios.post(
    `https://j13b207.p.ssafy.io/api/auth/token/refresh`,
    {
      refreshToken: refresh,
    }
  );

  const newAccess = res.data?.token?.accessToken as string | undefined;
  const newRefresh = res.data?.token?.refreshToken as string | undefined;

  if (!newAccess) throw new Error("NO_ACCESS_FROM_REFRESH");

  await SecureStore.setItemAsync("access_token", newAccess);
  if (newRefresh) await SecureStore.setItemAsync("refresh_token", newRefresh);

  return newAccess;
}

// axios 타입에 _retry가 없어서 안전 캐스팅용
interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

http.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const config = (error.config ?? {}) as RetryConfig;
    const status = error.response?.status;
    const url = String(config.url ?? "");

    // (1) 비인증 엔드포인트에서 401이면 리프레시 시도 금지하고 그대로 내보냄
    if (AUTH_FREE.some((p) => url.startsWith(p))) {
      return Promise.reject(error);
    }

    // (2) 401이 아니거나 이미 재시도한 요청이면 통과
    if (status !== 401 || config._retry) throw error;

    // (3) 동시성 제어: 리프레시 중이면 대기
    if (isRefreshing) {
      await new Promise<void>((resolve) => waiting.push(resolve));
    } else {
      isRefreshing = true;
      try {
        const newAccess = await doRefresh();
        // 대기중인 요청들 깨우기
        waiting.forEach((res) => res());
        waiting = [];
        // axios 기본 헤더도 업데이트(이후 새 요청들 대비)
        http.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
      } catch (e) {
        // 리프레시 실패 → 토큰/캐시 정리 후 에러 전파
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
        queryClient.clear();
        waiting.forEach((res) => res());
        waiting = [];
        isRefreshing = false;
        throw e;
      }
      isRefreshing = false;
    }

    config._retry = true;
    const latestAccess = await SecureStore.getItemAsync("access_token");
    if (latestAccess) {
      config.headers = new AxiosHeaders({
        ...(config.headers ?? {}),
        Authorization: `Bearer ${latestAccess}`,
      });
    }
    return http(config);
  }
);
