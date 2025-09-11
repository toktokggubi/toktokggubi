import { View } from "react-native";
import { router, type Href } from "expo-router";
import MyPageTemplate from "@/features/User/templates/MyPageTemplate";

const cardImg = require("@/assets/images/illustration/my_card.png");
const giftImg = require("@/assets/images/illustration/my_gifticon.png");
const MypageScreen = () => {
  return (
    <MyPageTemplate
      cardImage={cardImg}
      gifticonImage={giftImg}
      onPressCard={() => router.push("/(tabs)/mypage/cards")}
      onPressGifticon={() => router.push("/(tabs)/mypage/gifticons" as Href)}
    />
  );
};

export default MypageScreen;
