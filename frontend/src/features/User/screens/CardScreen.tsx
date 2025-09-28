import React, { useCallback, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";

import CardCarouselTemplate from "@/features/User/templates/CardTemplate";
import { CardActionMenu } from "@/features/User/ui/CardActionMeun";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";

import {
  useUserCards,
  useRefetchUserCards,
} from "@/features/User/model/card/hooks";
import type { UserCardVM } from "@/features/User/model/card/types";

const BG = colors.BACKGROUND_PRIMARY;
const TXT = colors.BLUE_DARKER;
const ACCENT = colors.BLUE_NORMAL;

export default function CardsScreen() {
  const navigation = useNavigation();
  const { data: cards = [], isFetching, isLoading, isError } = useUserCards();
  const refetchCards = useRefetchUserCards();

  const [activeIndex, setActiveIndex] = useState<number>(0);

  const handleImport = useCallback(async () => {
    try {
      await refetchCards();
      Alert.alert("완료", "최신 카드 목록으로 갱신했어요.");
      if (activeIndex > cards.length - 1) {
        setActiveIndex(Math.max(0, cards.length - 1));
      }
    } catch (e) {
      Alert.alert(
        "동기화 실패",
        e instanceof Error ? e.message : "Unknown error"
      );
    }
  }, [refetchCards, activeIndex, cards.length]);


  const handleDelete = useCallback(() => {
    Alert.alert("안내", "삭제 기능은 서버 API 스펙 확정 후 연결할게요.");
  }, []);

  useLayoutEffect(() => {
    // 네비게이션 옵션을 강제로 설정
    const setNavigationOptions = () => {
      navigation.setOptions({
        headerShown: true,
        title: "나의 카드",
        headerTitleAlign: "center",
        headerTintColor: TXT,
        headerStyle: { backgroundColor: BG },
        headerShadowVisible: false,
        headerTitleStyle: { fontSize: 18, ...font.bold },
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
    };

    setNavigationOptions();
    
    // 컴포넌트가 마운트된 후에도 다시 한 번 설정
    const timeoutId = setTimeout(setNavigationOptions, 100);
    
    return () => clearTimeout(timeoutId);
  }, [navigation, handleImport, handleDelete]);

  const loading = isLoading || isFetching;

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

      {isError ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: colors.GRAY_NORMAL, fontSize: 14, ...font.medium }}>
            카드를 불러오는데 실패했어요
          </Text>
        </View>
      ) : (
        <CardCarouselTemplate
          cards={cards as UserCardVM[]}
          activeIndex={activeIndex}
          onActiveChange={setActiveIndex}
        />
      )}
    </View>
  );
}
