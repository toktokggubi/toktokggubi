import { Alert } from "react-native";
import { router, type Href } from "expo-router";
import MyPageTemplate from "@/features/User/templates/MyPageTemplate";
import { useLogout } from "@/features/Auth/model/useAuthQueries";

const cardImg = require("@/assets/images/illustration/my_card.png");
const giftImg = require("@/assets/images/illustration/my_gifticon.png");

const MypageScreen = () => {
  const logoutMutation = useLogout();

  const handleLogout = () => {
    Alert.alert(
      "로그아웃",
      "정말 로그아웃하시겠습니까?",
      [
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
      ]
    );
  };

  return (
    <MyPageTemplate
      cardImage={cardImg}
      gifticonImage={giftImg}
      onPressCard={() => router.push("/cards" as Href)}
      onPressGifticon={() => router.push("/gifticons" as Href)}
      onPressLogout={handleLogout}
      isLoggingOut={logoutMutation.isPending}
    />
  );
};

export default MypageScreen;
