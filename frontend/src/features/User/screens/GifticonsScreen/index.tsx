// src/features/User/screens/Gifticons/index.tsx
import React, { useLayoutEffect } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { useNavigation, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/shared/constants/colors";

const BG = colors.BACKGROUND_PRIMARY;
const TXT = colors.BLUE_DARKER;
const ACCENT = colors.BLUE_NORMAL;

export default function GifticonsScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "나의 기프티콘",
      headerTitleAlign: "center",
      headerTintColor: TXT,
      headerStyle: { backgroundColor: BG },
      headerShadowVisible: false,
      headerTitleStyle: { fontSize: 18, fontWeight: "800" },
      headerLeft: () => (
        <Pressable
          onPress={() => router.back()}
          style={{ paddingHorizontal: 12, paddingVertical: 6 }}
        >
          <Ionicons name="chevron-back" size={24} color={TXT} />
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          onPress={() =>
            Alert.alert("기프티콘 등록", "등록 기능은 나중에 연결할게요")
          }
          style={{ paddingHorizontal: 12, paddingVertical: 6 }}
          accessibilityRole="button"
          accessibilityLabel="기프티콘 추가"
        >
          {/* 원하면 'add-outline'이나 'add-circle-outline'로 교체 가능 */}
          <Ionicons name="add" size={24} color={ACCENT} />
        </Pressable>
      ),
    });
  }, [navigation]);

  return (
    <View style={s.page}>
      <Text style={s.title}>여기에 기프티콘 리스트가 들어옵니다.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: BG, padding: 16 },
  title: { fontSize: 16, fontWeight: "600", color: TXT },
});
