import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { colors } from "@/shared/constants/colors";


interface CharacterBackgroundProps {
  message: string;
  children?: React.ReactNode;
  progressPercentage?: number;
  size?: number;
}

export const CharacterBackground: React.FC<CharacterBackgroundProps> = ({
  message,
  children,
  progressPercentage = 0,
  size = 120,
}) => {
  // 예산 사용률에 따라 다른 물 애니메이션 선택
  const getWaterImage = () => {
    if (progressPercentage <= 25) {
      return require("@/assets/images/illustration/water1.gif");
    } else if (progressPercentage <= 50) {
      return require("@/assets/images/illustration/water2.gif");
    } else if (progressPercentage <= 75) {
      return require("@/assets/images/illustration/water3.gif");
    } else {
      return require("@/assets/images/illustration/water4.gif");
    }
  };

  return (
    <View style={styles.container}>
      {/* Bowl 이미지 - 화면 상단에 위치 (예산 사용률에 따라 다른 물 애니메이션) */}
      <ExpoImage 
        source={getWaterImage()} 
        style={styles.bowlImage}
        contentFit="contain"
      />
      
      {/* Water 이미지 - bowl 아래에 위치, 화면 전체 가로폭 */}
      <Image 
        source={require("@/assets/images/illustration/water.png")} 
        style={[
          styles.waterImage,
          { 
            height: `${85 + (progressPercentage / 100) * 30}%`, // 높이 줄여서 탭과의 여백 줄임
            top: "35%" // 화면 상단에서 35% 지점에서 시작 (bowl 아래)
          }
        ]}
        resizeMode="stretch"
      />
      
      {/* 캐릭터 - water 시작 높이에 위치 */}
      <ExpoImage 
        source={require("@/assets/images/character/character-jump.gif")} 
        style={styles.characterImage}
        contentFit="contain"
      />
      
      {/* 캐릭터 메시지 */}
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>{message}</Text>
      </View>
      
      {/* 자식 컴포넌트 (CircularProgress 등) */}
      {children && (
        <View style={styles.childrenContainer}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  bowlImage: {
    position: "absolute",
    width: "60%",
    height: "30%",
    top: "10%",
    left: "3%", // 왼쪽으로 이동 (기본값은 0%)
    zIndex: 1, // bowl이 가장 뒤에
  },
  waterImage: {
    position: "absolute",
    width: "100%",
    zIndex: 2, // water가 bowl보다 앞에
  },
  characterImage: {
    position: "absolute",
    width: 150, // 크기 증가
    height: 150,
    top: "23%",
    left: "15%",
    zIndex: 3, // character가 가장 앞에
  },
  messageContainer: {
    position: "absolute",
    top: "23%",
    left: "5%",
    backgroundColor: colors.BACKGROUND_PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.BLUE_LIGHT,
    zIndex: 5,
  },
  messageText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.BLUE_NORMAL,
    textAlign: "center",
  },
  childrenContainer: {
    position: "absolute",
    top: "20%",
    right: "17%",
    zIndex: 4,
    backgroundColor: "transparent",
  },
});
