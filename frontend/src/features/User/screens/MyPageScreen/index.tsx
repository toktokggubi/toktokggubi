import { Alert } from "react-native";
import { router, type Href } from "expo-router";
import MyPageTemplate from "@/features/User/templates/MyPageTemplate";
import { useLogout, useProfileQuery } from "@/features/Auth/model/useAuthQueries";
import { useAuthGuard } from "@/shared/hooks/useAuthGuard";

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
    router.push("/user/profile-edit" as Href);
  };

  // 인증 로딩 중이거나 인증되지 않은 경우
  if (authLoading || !isAuthenticated) {
    return null; // useAuthGuard에서 자동으로 리다이렉트됨
  }

  return (
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
      isLoggingOut={logoutMutation.isPending}
    />
  );
};

export default MypageScreen;
