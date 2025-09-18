import React from "react";
import { View, Text, Image, type ImageSourcePropType } from "react-native";
import { s } from "./variants";

interface Props {
  text: string;
  iconSource?: ImageSourcePropType;
}

export function SectionTitle({ text, iconSource }: Props) {
  return (
    <View style={s.wrap}>
      {iconSource && (
        <Image source={iconSource} style={s.icon} resizeMode="contain" />
      )}
      <Text style={s.title}>{text}</Text>
    </View>
  );
}
