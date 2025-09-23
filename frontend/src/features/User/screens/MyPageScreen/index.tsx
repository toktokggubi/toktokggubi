import {
  useLogout,
  useProfileQuery,
} from "@/features/Auth/model/useAuthQueries";
import MyPageTemplate from "@/features/User/templates/MyPageTemplate";
import { colors } from "@/shared/constants/colors";
import { useAuthGuard } from "@/shared/hooks/useAuthGuard";
import FCMService from "@/shared/services/fcmService";
import { router, type Href } from "expo-router";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

  // FCM 토큰 테스트 함수
  const testFCMToken = async () => {
    try {
      const fcmService = FCMService.getInstance();
      await fcmService.testTokenRetrieval();

      // 토큰을 직접 가져와서 Alert로 표시
      const token = await fcmService.getToken();
      if (token) {
        Alert.alert(
          "✅ FCM 토큰 획득 성공!",
          `토큰 길이: ${token.length}\n앞 30자: ${token.substring(
            0,
            30
          )}...\n\n💡 이 토큰을 백엔드 API에 전송하면 푸시 알림을 받을 수 있습니다.\n\n전체 토큰은 콘솔에서 확인하세요.`,
          [{ text: "확인", onPress: () => {} }, { text: "확인" }]
        );
      } else {
        Alert.alert(
          "❌ FCM 토큰 획득 실패",
          "토큰을 가져올 수 없습니다.\n\n가능한 원인:\n• Expo Go 환경 (Development Build 필요)\n• 네트워크 연결 문제\n• Firebase 설정 문제\n\n자세한 내용은 콘솔을 확인하세요."
        );
      }
    } catch (error: any) {
      Alert.alert(
        "❌ 오류 발생",
        `FCM 토큰 테스트 중 오류가 발생했습니다.\n\n오류: ${error.message}\n\n자세한 내용은 콘솔을 확인하세요.`
      );
    }
  };

  // 인증 로딩 중이거나 인증되지 않은 경우
  if (authLoading || !isAuthenticated) {
    return null; // useAuthGuard에서 자동으로 리다이렉트됨
  }

  return (
    <View style={styles.container}>
      <MyPageTemplate
        userInfo={profileData ? {
          nickname: profileData.nickname,
          monthlyIncome: (profileData.monthlyIncome || 0) * 10000, // 만원 단위를 원 단위로 변환
          jobTitle: profileData.jobTitle,
        } : undefined}
        cardImage={cardImg}
        gifticonImage={giftImg}
        onPressCard={() => router.push("/cards" as Href)}
        onPressGifticon={() => router.push("/gifticons" as Href)}
        onPressLogout={handleLogout}
        onPressSettings={handleSettings}
        onPressBudgetSetup={handleBudgetSetup}
        onPressAIBudgetSetup={handleAIBudgetSetup}
        isLoggingOut={logoutMutation.isPending}
      />

      {/* FCM 토큰 테스트 버튼 */}
      <TouchableOpacity style={styles.testButton} onPress={testFCMToken}>
        <Text style={styles.testButtonText}>FCM 토큰 테스트</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MypageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  testButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: colors.BLUE_NORMAL,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 1000,
  },
  testButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
