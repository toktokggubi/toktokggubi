import React, { useLayoutEffect, useMemo, useState, useCallback } from "react";
import { Pressable, Alert, Image as RNImage } from "react-native";
import { useNavigation, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/shared/constants/colors";

import GifticonsTemplate from "@/features/User/templates/GifticonsTemplate";
import { dummyGifticons } from "@/features/User/model/gifticon/dummy";
import type { Gifticon } from "@/features/User/model/gifticon/types";
import { gifticonImages } from "@/features/User/model/gifticon/images";
import { GifticonImageViewer } from "@/features/User/ui/GifticonImageViewer";
import type { GifticonSort } from "@/features/User/ui/GifticonSortTabs/types";

const BG = colors.BACKGROUND_PRIMARY;
const TXT = colors.BLUE_DARKER;
const ACCENT = colors.BLUE_NORMAL;

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");

export default function GifticonsScreen() {
  const navigation = useNavigation();

  // 원본(사용 가능만)
  const all = useMemo<Gifticon[]>(
    () => dummyGifticons.filter((g) => g.status === "ACTIVE"),
    []
  );

  // 🔍 검색 상태
  const [query, setQuery] = useState("");

  // 🔽 정렬 상태
  const [sort, setSort] = useState<GifticonSort>("createdAtDesc");

  // 1) 검색 필터
  const filtered = useMemo(() => {
    if (!query) return all;
    const q = normalize(query);
    return all.filter((g) =>
      [g.label, g.merchantName, g.categoryName].some((x) =>
        normalize(x).includes(q)
      )
    );
  }, [all, query]);

  // 2) 정렬 (더미 안전 가드: createdAt 없으면 gifticonId 기준)
  const data = useMemo(() => {
    const arr = [...filtered];
    if (sort === "createdAtDesc") {
      arr.sort((a, b) => {
        const ta = a.createdAt ? Date.parse(a.createdAt) : a.gifticonId ?? 0;
        const tb = b.createdAt ? Date.parse(b.createdAt) : b.gifticonId ?? 0;
        return tb - ta; // 최신순
      });
    } else {
      arr.sort((a, b) => (a.remainingDays ?? 9e9) - (b.remainingDays ?? 9e9)); // 만료임박순
    }
    return arr;
  }, [filtered, sort]);

  // 이미지 뷰어
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const imagesForViewer = useMemo(
    () =>
      data.map((g) => {
        const src = gifticonImages[g.imageKey];
        const resolved = RNImage.resolveAssetSource(src);
        return { uri: resolved.uri };
      }),
    [data]
  );

  const handleSelect = useCallback((item: Gifticon, index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  }, []);

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
          <Ionicons name="add" size={24} color={ACCENT} />
        </Pressable>
      ),
    });
  }, [navigation]);

  return (
    <>
      <GifticonsTemplate
        data={data}
        onSelect={handleSelect}
        query={query}
        onQueryChange={setQuery}
        onClearQuery={() => setQuery("")}
        onSubmitSearch={(text) => setQuery(text)}
        sort={sort}
        onSortChange={setSort}
      />
      <GifticonImageViewer
        visible={viewerOpen}
        images={imagesForViewer}
        index={viewerIndex}
        onRequestClose={() => setViewerOpen(false)}
      />
    </>
  );
}
