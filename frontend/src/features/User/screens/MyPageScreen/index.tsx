import {
  useLogout,
  useProfileQuery,
} from "@/features/Auth/model/useAuthQueries";
import MyPageTemplate from "@/features/User/templates/MyPageTemplate";
import { useAuthGuard } from "@/shared/hooks/useAuthGuard";
import FCMService from "@/shared/services/fcmService";
import * as SecureStore from "expo-secure-store";
import { router, type Href } from "expo-router";
import { Alert, StyleSheet, View } from "react-native";

const cardImg = require("@/assets/images/illustration/my_card.png");
const giftImg = require("@/assets/images/illustration/my_gifticon.png");

const MypageScreen = () => {
  // 인증 가드
  const { isAuthenticated, isLoading: authLoading } = useAuthGuard();

  const logoutMutation = useLogout();
  const { data: profileData, isLoading: isProfileLoading } = useProfileQuery();

  // 디버깅용 로그

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          try {
            await logoutMutation.mutateAsync();
            Alert.alert("성공", "로그아웃되었습니다.");
            router.replace("/auth/login");
          } catch (error) {
            Alert.alert("오류", "로그아웃 중 오류가 발생했습니다.");
          }
        },
      },
    ]);
  };

  const handleSettings = () => {
    router.push("/user/settings" as Href);
  };

  const handleBudgetSetup = () => {
    router.push("/budget" as Href);
  };

  const handleAIBudgetSetup = () => {
    router.push("/budget/ai-setup" as Href);
  };

  const handleFCMTest = async () => {
    try {
      const fcmService = FCMService.getInstance();
      
      // FCM 토큰 가져오기
      const fcmToken = await fcmService.getToken();
      
      if (!fcmToken) {
        Alert.alert("FCM 토큰 테스트", "FCM 토큰을 가져올 수 없습니다.\n앱을 재시작하거나 권한을 확인해주세요.");
        return;
      }

      // 토큰을 서버에 전송
      const accessToken = await SecureStore.getItemAsync('access_token');
      if (!accessToken) {
        Alert.alert("FCM 토큰 테스트", "로그인이 필요합니다.");
        return;
      }

      const result = await fcmService.sendTokenToServer(fcmToken, accessToken);
      
      if (result.success) {
        Alert.alert(
          "FCM 토큰 테스트 성공", 
          `토큰이 서버에 성공적으로 전송되었습니다.\n\n토큰: ${fcmToken.substring(0, 50)}...`
        );
      } else {
        Alert.alert("FCM 토큰 테스트 실패", result.message || "토큰 전송에 실패했습니다.");
      }
    } catch (error) {
      Alert.alert("FCM 토큰 테스트 오류", "FCM 토큰 테스트 중 오류가 발생했습니다.");
    }
  };

  // 인증 로딩 중이거나 인증되지 않은 경우
  if (authLoading || !isAuthenticated) {
    return null; // useAuthGuard에서 자동으로 리다이렉트됨
  }

  return (
    <View style={styles.container}>
      <MyPageTemplate
        userInfo={
          profileData
            ? {
                nickname: profileData.nickname,
                monthlyIncome: (profileData.monthlyIncome || 0) * 10000, // 만원 단위를 원 단위로 변환
                jobTitle: profileData.jobTitle,
              }
            : undefined
        }
        cardImage={cardImg}
        gifticonImage={giftImg}
        onPressCard={() => router.push("/cards" as Href)}
        onPressGifticon={() => router.push("/gifticons" as Href)}
        onPressLogout={handleLogout}
        onPressSettings={handleSettings}
        onPressBudgetSetup={handleBudgetSetup}
        onPressAIBudgetSetup={handleAIBudgetSetup}
        onPressFCMTest={handleFCMTest}
        isLoggingOut={logoutMutation.isPending}
      />
    </View>
  );
};

export default MypageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
