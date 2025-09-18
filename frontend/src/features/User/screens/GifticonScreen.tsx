// src/features/User/screens/GifticonScreen.tsx
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
const gid = (g: Gifticon): string =>
  String(g.gifticonId ?? `${g.merchantName}|${g.label}|${g.expiresAt ?? "na"}`);

export default function GifticonsScreen() {
  const navigation = useNavigation();

  // 🔹 목록(가변) – 삭제 반영을 위해 useState로 들고 있음
  const [items, setItems] = useState<Gifticon[]>(() =>
    dummyGifticons.filter((g) => g.status === "ACTIVE")
  );

  // 🔎 검색 상태
  const [query, setQuery] = useState("");

  // 🔽 정렬 상태
  const [sort, setSort] = useState<GifticonSort>("createdAtDesc");

  // ✅ 선택 모드 & 선택된 아이템
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelecting = useCallback(() => {
    setSelecting((v) => {
      if (v) setSelectedIds(new Set()); // 종료 시 선택 초기화
      return !v;
    });
  }, []);

  const toggleSelectOne = useCallback((g: Gifticon) => {
    const id = gid(g);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const deleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    Alert.alert(
      "삭제",
      `선택한 ${selectedIds.size}개의 기프티콘을 삭제할까요?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => {
            setItems((prev) => prev.filter((g) => !selectedIds.has(gid(g))));
            setSelectedIds(new Set());
            setSelecting(false);
          },
        },
      ]
    );
  }, [selectedIds]);

  // 1) 검색
  const filtered = useMemo(() => {
    if (!query) return items;
    const q = normalize(query);
    return items.filter((g) =>
      [g.label, g.merchantName, g.categoryName].some((x) =>
        normalize(x).includes(q)
      )
    );
  }, [items, query]);

  // 2) 정렬
  const data = useMemo(() => {
    const arr = [...filtered];
    if (sort === "createdAtDesc") {
      arr.sort((a, b) => {
        const ta = a.createdAt ? Date.parse(a.createdAt) : a.gifticonId ?? 0;
        const tb = b.createdAt ? Date.parse(b.createdAt) : b.gifticonId ?? 0;
        return tb - ta; // 최신순
      });
    } else {
      arr.sort((a, b) => (a.remainingDays ?? 9e9) - (b.remainingDays ?? 9e9));
    }
    return arr;
  }, [filtered, sort]);

  // 🖼 이미지 뷰어
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

  // 카드 탭 동작: 선택모드면 체크 토글, 아니면 뷰어 열기
  const handleCardPress = useCallback(
    (item: Gifticon, index: number) => {
      if (selecting) {
        toggleSelectOne(item);
      } else {
        setViewerIndex(index);
        setViewerOpen(true);
      }
    },
    [selecting, toggleSelectOne]
  );

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
          onPress={() => router.push("/gifticons/register")}
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
        onSelect={handleCardPress}
        // 검색/정렬
        query={query}
        onQueryChange={setQuery}
        onClearQuery={() => setQuery("")}
        onSubmitSearch={(text) => setQuery(text)}
        sort={sort}
        onSortChange={setSort}
        // 삭제/선택 관련
        selecting={selecting}
        onToggleSelecting={toggleSelecting}
        selectedIds={selectedIds}
        onToggleSelectItem={toggleSelectOne}
        onDeleteSelected={deleteSelected}
        getId={gid}
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
