import React from "react";
import { View, StyleSheet, Text } from "react-native";
import type { GifticonsTemplateProps } from "./types";
import { GifticonGrid } from "@/features/User/ui/GifticonGrid";
import { colors } from "@/shared/constants/colors";
import { SearchBar } from "@/features/User/ui/SearchBar";
import { GifticonSortTabs } from "@/features/User/ui/GifticonSortTabs";

export default function GifticonsTemplate({
  data,
  onSelect,
  query,
  onQueryChange,
  onClearQuery,
  sort,
  onSortChange,
  onSubmitSearch,
}: GifticonsTemplateProps) {
  return (
    <View style={s.wrap}>
      <SearchBar
        value={query}
        onChangeText={onQueryChange}
        onClear={onClearQuery}
        onSubmit={onSubmitSearch}
        placeholder="브랜드/이름/카테고리 검색"
      />

      <GifticonSortTabs value={sort} onChange={onSortChange} />

      <GifticonGrid data={data} onSelect={onSelect} />
      {data.length === 0 && (
        <View style={s.empty}>
          <Text style={s.emptyTxt}>검색 결과가 없습니다.</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.BACKGROUND_PRIMARY, paddingTop: 8 },
  empty: { alignItems: "center", paddingTop: 32 },
  emptyTxt: { color: colors.GRAY_DARK_ACTIVE },
});
