// src/features/User/templates/GifticonsTemplate/index.tsx
import React, { memo } from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";
import type { GifticonsTemplateProps } from "./types";
import { GifticonGrid } from "@/features/User/ui/GifticonGrid";
import { colors } from "@/shared/constants/colors";
import { SearchBar } from "@/features/User/ui/SearchBar";
import { GifticonSortTabs } from "@/features/User/ui/GifticonSortTabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
function GifticonsTemplateImpl({
  data,
  onSelect,
  query,
  onQueryChange,
  onClearQuery,
  sort,
  onSortChange,
  onSubmitSearch,
  selecting,
  onToggleSelecting,
  selectedIds,
  onToggleSelectItem,
  onDeleteSelected,
  getId,
}: GifticonsTemplateProps) {
  const insets = useSafeAreaInsets();
  const selectedCount = selectedIds.size;

  return (
    <View style={s.wrap}>
      {/* 검색 */}
      <SearchBar
        value={query}
        onChangeText={onQueryChange}
        onClear={onClearQuery}
        onSubmit={onSubmitSearch}
        placeholder="브랜드/이름/카테고리 검색"
      />

      {/* 정렬 탭 + 삭제 토글 */}
      <View style={s.row}>
        <GifticonSortTabs value={sort} onChange={onSortChange} />
        <Pressable onPress={onToggleSelecting} hitSlop={8}>
          <Text style={[s.deleteTxt, selecting && s.doneTxt]}>
            {selecting ? "완료" : "삭제"}
          </Text>
        </Pressable>
      </View>

      {/* 그리드 */}
      <GifticonGrid
        data={data}
        onSelect={onSelect}
        isSelecting={selecting}
        selectedIds={selectedIds}
        onToggleSelectItem={onToggleSelectItem}
        getId={getId}
        extraBottomPadding={(selecting ? 80 : 16) + insets.bottom}
      />

      {/* 빈 상태 */}
      {data.length === 0 && (
        <View style={s.empty}>
          <Text style={s.emptyTxt}>검색 결과가 없습니다.</Text>
        </View>
      )}

      {/* 선택모드 하단 바 */}
      {selecting && (
        <View
          style={[
            s.bottomBar,
            { paddingBottom: Math.max(10, 10 + insets.bottom) },
          ]}
        >
          <Text style={s.count}>{selectedCount}개 선택됨</Text>
          <Pressable
            onPress={onDeleteSelected}
            style={s.deleteBtn}
            accessibilityRole="button"
            accessibilityLabel="선택 항목 삭제"
          >
            <Text style={s.deleteBtnTxt}>선택 삭제</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default memo(GifticonsTemplateImpl);

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.BACKGROUND_PRIMARY, paddingTop: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 6,
  },
  deleteTxt: {
    color: colors.GRAY_DARK_ACTIVE,
    paddingVertical: 0,
    paddingHorizontal: 6,
    marginBottom: 10,
  },
  doneTxt: { color: colors.BLUE_NORMAL },
  empty: { alignItems: "center", paddingTop: 32 },
  emptyTxt: { color: colors.GRAY_DARK_ACTIVE },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.GRAY_LIGHT_ACTIVE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  count: { color: colors.GRAY_DARK_ACTIVE, fontWeight: "600" },
  deleteBtn: {
    backgroundColor: colors.BLUE_NORMAL,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  deleteBtnTxt: { color: "#fff", fontWeight: "800" },
});
