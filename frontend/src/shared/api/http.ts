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
    console.log(`비인증 엔드포인트: ${config.url}`);
    return config;
  }

  const token = await SecureStore.getItemAsync("access_token");
  console.log(`API 요청: ${config.url}, 토큰 존재: ${!!token}`);
  
  if (token) {
    config.headers = new AxiosHeaders({
      ...(config.headers ?? {}),
      Authorization: `Bearer ${token}`,
    });
    console.log(`토큰 주입 완료: ${token.substring(0, 20)}...`);
  } else {
    console.log("토큰이 없습니다.");
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

  console.log("토큰 갱신 시도 중...");
  
  try {
    const res = await axios.post(
      `https://j13b207.p.ssafy.io/api/auth/token/refresh`,
      {
        refreshToken: refresh,
      },
      {
        timeout: 10000, // 10초 타임아웃
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    console.log("토큰 갱신 응답:", res.data);

    const newAccess = res.data?.token?.accessToken as string | undefined;
    const newRefresh = res.data?.token?.refreshToken as string | undefined;

    if (!newAccess) {
      console.error("토큰 갱신 실패: accessToken이 없습니다.", res.data);
      throw new Error("NO_ACCESS_FROM_REFRESH");
    }

    await SecureStore.setItemAsync("access_token", newAccess);
    if (newRefresh) await SecureStore.setItemAsync("refresh_token", newRefresh);

    console.log("토큰 갱신 성공");
    return newAccess;
  } catch (error: any) {
    console.error("토큰 갱신 API 호출 실패:", error);
    
    // 네트워크 에러나 타임아웃인 경우
    if (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR') {
      console.error("네트워크 에러로 인한 토큰 갱신 실패");
    }
    
    // 401 에러인 경우 (refresh token도 만료됨)
    if (error.response?.status === 401) {
      console.error("Refresh token도 만료됨 - 재로그인 필요");
    }
    
    throw error;
  }
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

    console.log(`API 응답 에러: ${status} - ${url}`);

    // (1) 비인증 엔드포인트에서 401이면 리프레시 시도 금지하고 그대로 내보냄
    if (AUTH_FREE.some((p) => url.startsWith(p))) {
      console.log("비인증 엔드포인트 401 에러 - 리프레시 시도하지 않음");
      return Promise.reject(error);
    }

    // (2) 401이 아니면 통과
    if (status !== 401) {
      console.log(`401이 아님: status=${status}`);
      throw error;
    }

    // (3) 이미 재시도한 요청이면 통과 (하지만 토큰 갱신은 시도)
    if (config._retry) {
      console.log(`이미 재시도함: retry=${config._retry}`);
      throw error;
    }

    console.log("401 에러 감지 - 토큰 갱신 시도");

    // (4) 동시성 제어: 리프레시 중이면 대기
    if (isRefreshing) {
      console.log("토큰 갱신 중 - 대기열에 추가");
      await new Promise<void>((resolve) => waiting.push(resolve));
    } else {
      isRefreshing = true;
      try {
        console.log("토큰 갱신 시작");
        const newAccess = await doRefresh();
        console.log("토큰 갱신 완료 - 대기중인 요청들 재시도");
        
        // 대기중인 요청들 깨우기
        waiting.forEach((res) => res());
        waiting = [];
        
        // axios 기본 헤더도 업데이트(이후 새 요청들 대비)
        http.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
      } catch (e) {
        console.error("토큰 갱신 실패:", e);
        
        // 리프레시 실패 → 토큰/캐시 정리 후 에러 전파
        try {
          await SecureStore.deleteItemAsync("access_token");
          await SecureStore.deleteItemAsync("refresh_token");
          queryClient.clear();
        } catch (cleanupError) {
          console.error("토큰 정리 실패:", cleanupError);
        }
        
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
      console.log("갱신된 토큰으로 원래 요청 재시도");
    }
    return http(config);
  }
);
