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
import { useGifticonsQuery, useInvalidateGifticons } from "@/features/User/model/gifticon/queries";
import type { GifticonListParams } from "@/features/User/model/gifticon/schemas";
import { useFranchisesQuery } from "@/features/User/model/franchise/queries";
import { deleteGifticon } from "@/features/User/api/gifticonService";
import { normalizeImageUrl } from "@/features/User/utils/imageUtils";

const BG = colors.BACKGROUND_PRIMARY;
const TXT = colors.BLUE_DARKER;
const ACCENT = colors.BLUE_NORMAL;

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");
const gid = (g: Gifticon): string =>
  String(g.gifticonId ?? `${g.merchantName}|${g.label}|${g.expiresAt ?? "na"}`);

export default function GifticonsScreen() {
  const navigation = useNavigation();
  const invalidateGifticons = useInvalidateGifticons();

  // 🔽 정렬 상태 (서버에서 처리)
  const [sort, setSort] = useState<GifticonSort>("createdAtDesc");
  
  // 🔽 필터 상태
  const [franchiseId, setFranchiseId] = useState<number | undefined>();
  const [usable, setUsable] = useState<boolean | undefined>();

  // 프랜차이즈 목록 조회
  const { data: franchises = [] } = useFranchisesQuery();

  // API 파라미터 구성
  const apiParams: GifticonListParams = useMemo(() => {
    const params: GifticonListParams = {};
    
    if (franchiseId) params.franchiseId = franchiseId;
    if (usable !== undefined) params.usable = usable;
    
    // 정렬 매핑
    if (sort === "createdAtDesc") {
      params.sort = "latest";
    } else if (sort === "remainingAsc") {
      params.sort = "expires";
    }
    
    return params;
  }, [franchiseId, usable, sort]);

  const { data: serverItems, isLoading } = useGifticonsQuery(apiParams);

  // 🔹 전체 보유 목록(가변) – 선택/삭제 반영용
  const [items, setItems] = useState<Gifticon[]>([]);

  // ✅ 서버 데이터만 반영 (비어있으면 빈 배열 유지)
  useEffect(() => {
    if (Array.isArray(serverItems)) setItems(serverItems);
  }, [serverItems]);

  // 🔎 검색 상태 + "검색 시도" 상태
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false); // ★ 추가

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

  const deleteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    Alert.alert(
      "삭제",
      `선택한 ${selectedIds.size}개의 기프티콘을 삭제할까요?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              // 선택된 기프티콘들의 ID 추출
              const selectedGifticons = items.filter((g) => selectedIds.has(gid(g)));
              const gifticonIds = selectedGifticons
                .map((g) => g.gifticonId)
                .filter((id): id is number => id !== undefined);

              // 서버에서 삭제
              await Promise.all(gifticonIds.map((id) => deleteGifticon(id)));

              // ✅ 삭제 성공 후 캐시 무효화
              invalidateGifticons();

              // 로컬 상태에서 제거
              setItems((prev) => prev.filter((g) => !selectedIds.has(gid(g))));
              setSelectedIds(new Set());
              setSelecting(false);

              Alert.alert("삭제 완료", "선택한 기프티콘이 삭제되었습니다.");
            } catch (error) {
              console.error("기프티콘 삭제 실패:", error);
              Alert.alert("삭제 실패", "기프티콘 삭제 중 오류가 발생했습니다.");
            }
          },
        },
      ]
    );
  }, [selectedIds, items]);


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

  // 4) 필터 초기화
  const handleClearFilters = useCallback(() => {
    setFranchiseId(undefined);
    setUsable(undefined);
  }, []);

  // 필터링 (클라이언트 사이드 검색만)
  const filtered = useMemo(() => {
    if (!query) return items;
    const q = normalize(query);
    return items.filter((g) =>
      [g.label, g.merchantName, g.categoryName].some((x) =>
        normalize(x).includes(q)
      )
    );
  }, [items, query]);

  // 서버에서 정렬이 처리되므로 클라이언트 사이드 정렬 제거
  const data = filtered;

  // 🖼 이미지 뷰어 (서버 이미지 URL 표시를 추후 확장)
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const imagesForViewer = useMemo(() => 
    data.map((item) => ({ uri: normalizeImageUrl(item.imageKey) })), 
    [data]
  );

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
        // 필터링
        franchiseId={franchiseId}
        onFranchiseChange={setFranchiseId}
        usable={usable}
        onUsableChange={setUsable}
        onClearFilters={handleClearFilters}
        franchises={franchises}
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
