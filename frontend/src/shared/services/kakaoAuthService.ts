import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

// 카카오 로그인 설정
const KAKAO_REST_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_KEY || '3b8c18987928538f088c5476448df8b0';
const KAKAO_JAVASCRIPT_KEY = process.env.EXPO_PUBLIC_KAKAO_JAVA_SCRIPT_KEY || '414c0e1b105559f858bfb9148d6e6dba';
const KAKAO_NATIVE_APP_KEY = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY || '7fd9a4d14429317c504ce52311ae3cc0';

// 리다이렉트 URI 설정 - 앱 스킴만 사용 (더 간단한 방법)
const REDIRECT_URI = 'toktokggubi://oauth';

// 웹 환경용 대안 (필요시 사용)
// const WEB_REDIRECT_URI = 'https://j13b207.p.ssafy.io/auth/kakao/callback';

// 카카오 로그인 URL 생성
const getKakaoLoginUrl = (): string => {
  const baseUrl = 'https://kauth.kakao.com/oauth/authorize';
  const params = new URLSearchParams({
    client_id: KAKAO_REST_KEY,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'profile_nickname', // 이름만 요청
  });
  
  return `${baseUrl}?${params.toString()}`;
};

// 카카오 액세스 토큰 교환
const exchangeCodeForToken = async (code: string): Promise<string> => {
  const tokenUrl = 'https://kauth.kakao.com/oauth/token';
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: KAKAO_REST_KEY,
    redirect_uri: REDIRECT_URI,
    code: code,
  });

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error(`토큰 교환 실패: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('카카오 토큰 교환 오류:', error);
    throw new Error('카카오 로그인 토큰을 가져오는데 실패했습니다.');
  }
};

// URL에서 인증 코드 추출
const extractCodeFromUrl = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.searchParams.get('code');
  } catch (error) {
    console.error('URL 파싱 오류:', error);
    return null;
  }
};

// 카카오톡 앱 우선 시도, 실패 시 웹 브라우저 Fallback
export const performKakaoLogin = async (): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const loginUrl = getKakaoLoginUrl();
      
      // 1단계: 카카오톡 앱으로 로그인 시도
      console.log('카카오톡 앱으로 로그인 시도');
      const appResult = await WebBrowser.openAuthSessionAsync(
        loginUrl,
        REDIRECT_URI,
        {
          showInRecents: false,
          preferEphemeralSession: true,
        }
      );

      if (appResult.type === 'success' && appResult.url) {
        const code = extractCodeFromUrl(appResult.url);
        if (code) {
          const accessToken = await exchangeCodeForToken(code);
          resolve(accessToken);
          return;
        }
      }
      
      // 2단계: 웹 브라우저로 Fallback
      console.log('카카오톡 앱 로그인 실패, 웹 브라우저로 Fallback');
      const webResult = await WebBrowser.openAuthSessionAsync(
        loginUrl,
        REDIRECT_URI,
        {
          showInRecents: false,
          preferEphemeralSession: true,
        }
      );

      if (webResult.type === 'success' && webResult.url) {
        const code = extractCodeFromUrl(webResult.url);
        
        if (code) {
          const accessToken = await exchangeCodeForToken(code);
          resolve(accessToken);
        } else {
          reject(new Error('인증 코드를 찾을 수 없습니다.'));
        }
      } else if (webResult.type === 'cancel') {
        reject(new Error('사용자가 로그인을 취소했습니다.'));
      } else {
        reject(new Error('카카오 로그인에 실패했습니다.'));
      }
      
    } catch (error) {
      console.error('카카오 로그인 오류:', error);
      reject(error);
    }
  });
};

// 카카오 로그인 서비스 클래스
export class KakaoAuthService {
  private static instance: KakaoAuthService;

  public static getInstance(): KakaoAuthService {
    if (!KakaoAuthService.instance) {
      KakaoAuthService.instance = new KakaoAuthService();
    }
    return KakaoAuthService.instance;
  }

  // 카카오 로그인 실행
  public async login(): Promise<string> {
    return performKakaoLogin();
  }

  // 카카오 로그아웃 (선택사항)
  public async logout(): Promise<void> {
    // 카카오 웹 로그아웃 URL
    const logoutUrl = `https://kauth.kakao.com/oauth/logout?client_id=${KAKAO_REST_KEY}&logout_redirect_uri=${REDIRECT_URI}`;
    
    try {
      await WebBrowser.openBrowserAsync(logoutUrl);
    } catch (error) {
      console.error('카카오 로그아웃 오류:', error);
    }
  }
}

export default KakaoAuthService;
