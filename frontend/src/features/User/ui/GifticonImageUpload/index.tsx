import React from "react";
import { View, Pressable, Image, Text, StyleSheet } from "react-native";

interface Props {
  value: string | null;
  onChange: (uri: string | null) => void;
}

export function GifticonImageUpload({ value, onChange }: Props) {
  const handlePick = async () => {
    // Expo ImagePicker 사용
    // onChange(result.uri);
  };

  return (
    <Pressable style={s.box} onPress={handlePick}>
      {value ? (
        <Image source={{ uri: value }} style={s.img} />
      ) : (
        <Text style={s.txt}>기프티콘 사진 업로드 ＋</Text>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  box: {
    height: 200,
    backgroundColor: "#eef3f8",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    borderRadius: 12,
  },
  txt: { color: "#288cff" },
});
