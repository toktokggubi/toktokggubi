// frontend/src/features/User/screens/GifticonScreen.tsx
import React, {
  useLayoutEffect,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Pressable, Alert, ActivityIndicator, View } from "react-native";
import { useNavigation, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/shared/constants/colors";

import GifticonsTemplate from "@/features/User/templates/GifticonsTemplate";
import type { Gifticon } from "@/features/User/model/gifticon/types";
import { GifticonImageViewer } from "@/features/User/ui/GifticonImageViewer";
import type { GifticonSort } from "@/features/User/ui/GifticonSortTabs/types";
import { useGifticonsQuery } from "@/features/User/model/gifticon/queries";

const BG = colors.BACKGROUND_PRIMARY;
const TXT = colors.BLUE_DARKER;
const ACCENT = colors.BLUE_NORMAL;

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");
const gid = (g: Gifticon): string =>
  String(g.gifticonId ?? `${g.merchantName}|${g.label}|${g.expiresAt ?? "na"}`);

export default function GifticonsScreen() {
  const navigation = useNavigation();

  const { data: serverItems, isLoading } = useGifticonsQuery();

  // 🔹 전체 보유 목록(가변) – 선택/삭제 반영용
  const [items, setItems] = useState<Gifticon[]>([]);

  // ✅ 서버 데이터만 반영 (비어있으면 빈 배열 유지)
  useEffect(() => {
    if (Array.isArray(serverItems)) setItems(serverItems);
  }, [serverItems]);

  // 🔎 검색 상태 + "검색 시도" 상태
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false); // ★ 추가

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
            // TODO: 서버 삭제 API 준비되면 호출 후 목록 refetch
          },
        },
      ]
    );
  }, [selectedIds]);

  // 1) 검색(텍스트 변경)
  const handleChangeQuery = useCallback((text: string) => {
    setQuery(text);
    // 입력만으로는 검색 '시도'로 보지 않음
  }, []);

  // 2) 검색 제출(엔터/버튼)
  const handleSubmitSearch = useCallback((text: string) => {
    setQuery(text);
    setHasSearched(true); // ★ 검색 시도
  }, []);

  // 3) 검색어 지우기
  const handleClearQuery = useCallback(() => {
    setQuery("");
    setHasSearched(false); // ★ 초기화
  }, []);

  // 필터링
  const filtered = useMemo(() => {
    if (!query) return items;
    const q = normalize(query);
    return items.filter((g) =>
      [g.label, g.merchantName, g.categoryName].some((x) =>
        normalize(x).includes(q)
      )
    );
  }, [items, query]);

  // 정렬
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

  // 🖼 이미지 뷰어 (서버 이미지 URL 표시를 추후 확장)
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const imagesForViewer = useMemo(() => data.map(() => ({ uri: "" })), [data]);

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

  if (isLoading && items.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: BG,
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <GifticonsTemplate
        data={data}
        totalCount={items.length} // ★ 전체 보유 개수
        onSelect={handleCardPress}
        // 검색/정렬
        query={query}
        onQueryChange={handleChangeQuery} // ★ 변경
        onClearQuery={handleClearQuery} // ★ 변경
        onSubmitSearch={handleSubmitSearch} // ★ 변경
        sort={sort}
        onSortChange={setSort}
        hasSearched={hasSearched} // ★ 추가
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
