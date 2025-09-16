import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import type { GifticonImageUploadProps } from "./types";

export function GifticonImageUpload({
  value,
  onChange,
  loading = false,
}: GifticonImageUploadProps) {
  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.9,
    });
    if (!res.canceled && res.assets?.[0]?.uri) onChange(res.assets[0].uri);
  };

  return (
    <Pressable style={[s.box, value && s.boxFilled]} onPress={pick}>
      {loading ? (
        <ActivityIndicator />
      ) : value ? (
        <Image source={{ uri: value }} style={s.img} />
      ) : (
        <Text style={s.txt}>기프티콘 사진 업로드 ＋</Text>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  box: {
    height: 220,
    borderRadius: 12,
    backgroundColor: colors.BLUE_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.BLUE_LIGHT_ACTIVE,
  },
  boxFilled: { backgroundColor: "#fff" },
  img: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    borderRadius: 12,
  },
  txt: { color: colors.BLUE_NORMAL, ...font.medium },
});
