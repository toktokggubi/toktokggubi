import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { CharacterBackgroundProps } from "./types";
import { colors } from "@/shared/constants/colors";

const { width: screenWidth } = Dimensions.get("window");

export const CharacterBackground: React.FC<CharacterBackgroundProps> = ({
  message = "아직은 넉넉하다꺼비",
  showSpeechBubble = true,
}) => {
  return (
    <View style={styles.container}>
      {/* 하단 지형 (언덕) */}
      <View style={styles.ground} />
      
      {/* 물 그릇 (bowl) */}
      <Image
        source={require("@/assets/images/illustration/bowl.png")}
        style={styles.bowl}
        resizeMode="contain"
      />
      
      {/* 물 (water) */}
      <Image
        source={require("@/assets/images/illustration/water.png")}
        style={styles.water}
        resizeMode="contain"
      />
      
      {/* 캐릭터 */}
      <Image
        source={require("@/assets/images/character/big-character-02.png")}
        style={styles.character}
        resizeMode="contain"
      />
      
      {/* 말풍선 */}
      {showSpeechBubble && (
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>{message}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    height: 260,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  ground: {
    position: "absolute",
    bottom: 0,
    width: screenWidth,
    height: 120,
    backgroundColor: colors.BLUE_LIGHT,
    borderTopLeftRadius: screenWidth / 2,
    borderTopRightRadius: screenWidth / 2,
  },
  bowl: {
    position: "absolute",
    top: 20,
    width: screenWidth * 0.8,
    height: 200,
    zIndex: 3,
  },
  water: {
    position: "absolute",
    top: 40,
    width: screenWidth * 0.6,
    height: 120,
    zIndex: 1,
  },
  character: {
    position: "absolute",
    bottom: 40,
    width: 120,
    height: 120,
    zIndex: 10,
  },
  speechBubble: {
    position: "absolute",
    top: 60,
    right: screenWidth * 0.15,
    backgroundColor: colors.BLUE_LIGHT,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  speechText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.GRAY_DARKER,
    textAlign: "center",
  },
});
