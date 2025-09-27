import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
WebBrowser.maybeCompleteAuthSession();

const BACKEND_AUTHORIZE_URL = "https://j13b207.p.ssafy.io/api/auth/kakao/authorize-url";

// 백엔드가 앱으로 리다이렉트하는 딥링크: toktokggubi://oauth/kakao
// const APP_RETURN_URL = Linking.createURL("/oauth/kakao");
const APP_RETURN_URL = "toktokggubi://oauth/kakao";

function parseDeepLinkParams(url: string) {
  const u = new URL(url);
  const get = (k: string) => {
    const v = u.searchParams.get(k);
    return v && v.length > 0 ? v : undefined;
  };
  return {
    message: get("message"),
    userId: get("userId") ? Number(get("userId")!) : undefined,
    token: get("token"),
    refreshToken: get("refreshToken"),
    signupToken: get("signupToken"),
  };
}

export type KakaoLoginResult =
  | { status: "active"; userId: number; accessToken: string; refreshToken?: string; message?: string }
  | { status: "needs-profile"; userId: number; signupToken: string; message?: string };

export default class KakaoAuthService {
  private static instance: KakaoAuthService;
  static getInstance() {
    if (!KakaoAuthService.instance) KakaoAuthService.instance = new KakaoAuthService();
    return KakaoAuthService.instance;
  }

  async login(): Promise<KakaoLoginResult> {
    const r = await fetch(BACKEND_AUTHORIZE_URL);
    if (!r.ok) throw new Error("카카오 로그인 URL을 가져오지 못했습니다.");
    const { url } = (await r.json()) as { url: string };
    if (!url) throw new Error("카카오 로그인 URL이 비어있습니다.");

    // A) Linking 이벤트로도 동시에 대기
    let resolved = false;
    let deepLinkFromEvent: string | null = null;
    const sub = Linking.addEventListener("url", ({ url }) => {
      if (!resolved && url.startsWith(APP_RETURN_URL)) {
        deepLinkFromEvent = url;
        resolved = true;
      }
    });

    try {
      // B) 브라우저 세션 시작
      const result = await WebBrowser.openAuthSessionAsync(url, APP_RETURN_URL, {
        showInRecents: false,
        // Android에서 딥링크 복귀 인식률 위해 false가 더 안정적인 케이스가 많음
        preferEphemeralSession: false,
      });

      // C) 어떤 경로든 먼저 도착한 URL 사용
      const finalUrl =
        deepLinkFromEvent ??
        (result.type === "success" && result.url?.startsWith(APP_RETURN_URL) ? result.url : null);

      if (!finalUrl) {
        console.log("openAuthSessionAsync result:", result);
        console.log("APP_RETURN_URL:", APP_RETURN_URL);
        throw new Error("앱으로 돌아오지 못했습니다. (딥링크 미수신)");
      }

      const { token, refreshToken, signupToken, userId } = parseDeepLinkParams(finalUrl);
      if (!userId || (!token && !signupToken)) {
        console.log("deep link url:", finalUrl);
        throw new Error("카카오 로그인 결과가 올바르지 않습니다.");
      }

      if (token) return { status: "active", userId, accessToken: token, refreshToken };
      return { status: "needs-profile", userId, signupToken: signupToken! };
    } finally {
      sub.remove();
    }
  }
}