import Button from "@/features/Auth/ui/Button";
import { font } from "@/shared/typography/font";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { WelcomeTemplateProps } from "./types";

const WelcomeTemplate = ({
  centerImageSource,
  onStart,
}: WelcomeTemplateProps) => {
  return (
    <View style={style.wrap}>
      <Text style={style.textWrap}>환영합니다!</Text>
      <View style={style.imageWrap}>
        {centerImageSource && (
          <Image
            source={centerImageSource}
            style={{ width: 300, height: 300, marginTop: 4 }}
            resizeMode="contain"
          />
        )}
      </View>
      <Button value="시작하기" onPress={onStart} />
    </View>
  );
};

const style = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#F8FBFF",
    padding: 16,
  },
  textWrap: {
    fontSize: 32,
    ...font.regular,
    textAlign: "center",
  },
  imageWrap: {
    alignItems: "center",
  },
});

export default WelcomeTemplate;
