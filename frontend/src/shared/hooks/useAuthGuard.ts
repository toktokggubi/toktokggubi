import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useProfileQuery } from '~features/Auth/model/useAuthQueries';

export const useAuthGuard = () => {
  const router = useRouter();
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const profileQuery = useProfileQuery();

  // 토큰 존재 여부 확인
  useEffect(() => {
    const checkToken = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync('access_token');
        setHasToken(!!accessToken);
        
        // 토큰이 없으면 즉시 로그인 페이지로 리다이렉트
        if (!accessToken) {
          router.replace('/auth/login');
        }
      } catch (error) {
        setHasToken(false);
        router.replace('/auth/login');
      }
    };

    checkToken();
  }, [router]);

  // 프로필 쿼리 에러 처리
  useEffect(() => {
    if (profileQuery.isError) {
      const error = profileQuery.error as any;
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        // 토큰이 유효하지 않으면 삭제하고 로그인 페이지로 리다이렉트
        SecureStore.deleteItemAsync('access_token');
        SecureStore.deleteItemAsync('refresh_token');
        router.replace('/auth/login');
      }
    }
  }, [profileQuery.isError, profileQuery.error, router]);

  return {
    isAuthenticated: hasToken && profileQuery.isSuccess,
    isLoading: hasToken === null || profileQuery.isLoading,
    error: profileQuery.error,
  };
};
