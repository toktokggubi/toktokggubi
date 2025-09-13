import { font } from "@/shared/typography/font";
import React, { memo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { CardSlideProps } from "./types";

function CardSlideImpl({ card }: CardSlideProps) {
  return (
    <View style={s.wrap}>
      <Image source={card.image} style={s.cardImg} />
      <Text style={s.name}>{card.cardName}</Text>
      <Text style={s.sub}>**** **** **** {card.last4}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    alignItems: "center",
    width: "100%",
  },
  cardImg: {
    width: "100%",
    height: 280,
    borderRadius: 12,
    resizeMode: "contain",
    marginBottom: 12,
    marginTop: 12,
  },
  name: { fontSize: 16, ...font.bold },
  sub: { marginTop: 4, color: "#6b7280" },
});

export default memo(CardSlideImpl);
