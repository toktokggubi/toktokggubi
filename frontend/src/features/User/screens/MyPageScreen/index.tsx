import { View } from "react-native";
import { router } from "expo-router";
import MyPageTemplate from "@/features/User/templates/MyPageTemplate";

const cardImg = require("@/assets/images/illustration/my_card.png");
const giftImg = require("@/assets/images/illustration/my_gifticon.png");
const MypageScreen = () => {
  return (
    <MyPageTemplate
      cardImage={cardImg}
      gifticonImage={giftImg}
      onPressCard={() => router.push("/(tabs)/mypage/cards")}
      onPressGifticon={() => {
        /* 나중에 /mypage/gifticons 로 이동 */
      }}
    />
  );
};

export default MypageScreen;
