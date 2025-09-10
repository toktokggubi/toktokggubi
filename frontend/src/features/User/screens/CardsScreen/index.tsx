// src/features/User/screens/Cards/index.tsx
import React, { useLayoutEffect, useState, useCallback } from "react";
import {
  Alert,
  ActivityIndicator,
  View,
  Pressable,
  StyleSheet,
} from "react-native";
import { router, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import CardCarouselTemplate from "@/features/User/templates/CardTemplate";
import { getUserCards, syncUserCards } from "@/features/User/api/cardService";
import { CardActionMenu } from "@/features/User/ui/CardActionMeun";
import type { UserCard } from "@/features/User/screens/MyPageScreen/types";

const BG = "#F8FBFF";
const TXT = "#0f172a";
const ACCENT = "#246BFD";

export default function CardsScreen() {
  const navigation = useNavigation();
  const [cards, setCards] = useState<UserCard[]>(getUserCards());
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const userId = "me"; // TODO: 실제 사용자 id

  const handleImport = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { list } = await syncUserCards(userId);
      setCards(list);
      // 새 데이터 길이에 맞춰 인덱스 보정
      setActiveIndex((prev) => Math.min(prev, Math.max(0, list.length - 1)));
      Alert.alert("카드 정보가 최신으로 갱신되었습니다");
    } catch (e) {
      Alert.alert(
        "동기화 실패",
        e instanceof Error ? e.message : "Unknown error"
      );
    } finally {
      setLoading(false);
    }
  }, [userId, loading]);

  const handleDelete = useCallback(() => {
    if (cards.length === 0) return;

    const target = activeIndex;
    const next = cards.filter((_, idx) => idx !== target);

    setCards(next);

    if (next.length === 0) {
      setActiveIndex(0);
      Alert.alert("삭제 완료", "마지막 카드를 삭제했습니다.");
      return;
    }

    // 다음 활성 인덱스: 지운 자리에 오른쪽 카드가 있었다면 같은 인덱스로 유지,
    // 마지막을 지웠다면 왼쪽 카드로 이동
    const nextIndex = Math.min(target, next.length - 1);
    setActiveIndex(nextIndex);
  }, [cards, activeIndex]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "나의 카드",
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
        <CardActionMenu
          color={ACCENT}
          onSelectImport={handleImport}
          onSelectDelete={handleDelete}
        />
      ),
    });
  }, [navigation, handleImport, handleDelete]);

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {loading && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.08)",
              zIndex: 10,
            },
          ]}
        >
          <ActivityIndicator size="large" />
        </View>
      )}

      <CardCarouselTemplate
        cards={cards}
        activeIndex={activeIndex}
        onActiveChange={setActiveIndex}
      />
    </View>
  );
}
