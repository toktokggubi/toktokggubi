import { useCallback, useMemo, useState } from "react";
import { router } from "expo-router";
import SelectCategoryTemplate from "~features/Budget/templates/SelectCategoryTemplate";
import {
  CATEGORY_ICON_BY_NAME,
  type CategoryName,
} from "@/shared/constants/categoryIcons";
import type { CategoryItem } from "~features/Budget/ui/organisms/CategoryGrid/types";

// ✅ 초기 선택 없음
const INITIAL_SELECTED: CategoryName[] = [];

// 전체 카테고리 리스트
const ALL: CategoryName[] = Object.keys(
  CATEGORY_ICON_BY_NAME
) as CategoryName[];

// (선택) 특정 카테고리 비활성화 예시
const DISABLED_SET = new Set<CategoryName>([]);

export default function SelectCategoryScreen() {
  const [selected, setSelected] = useState<CategoryName[]>(INITIAL_SELECTED);

  // 템플릿에 줄 아이템 변환
  const items: CategoryItem[] = useMemo(
    () =>
      ALL.map((name) => ({
        key: name,
        label: name,
        icon: CATEGORY_ICON_BY_NAME[name],
        disabled: DISABLED_SET.has(name),
      })),
    []
  );

  // 선택 토글 핸들러
  const toggle = useCallback((key: CategoryName) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  // 네비게이션
  const goPrev = useCallback(() => router.back(), []);
  const goNext = useCallback(() => {
    // TODO: 다음 단계 라우트 연결
    // router.push("/budget/set-amount");
    console.log("다음 단계로 이동 예정");
  }, []);

  return (
    <SelectCategoryTemplate
      // 헤더
      title="카테고리 선택"
      subtitle="예산을 관리할 카테고리를 선택해주세요."
      // 그리드
      items={items}
      selectedKeys={selected}
      onToggle={toggle}
      // 푸터
      stepIndex={2}
      stepTotal={5}
      onPressPrev={goPrev}
      onPressNext={goNext}
      nextDisabled={selected.length === 0}
    />
  );
}
