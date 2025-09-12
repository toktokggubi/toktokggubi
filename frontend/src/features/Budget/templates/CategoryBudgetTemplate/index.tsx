import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BudgetCopy from "~features/Budget/ui/molecules/BudgetCopy";
import CategoryBudgetList from "~features/Budget/ui/organisms/CategoryBudgetList";
import BudgetWizardFooter from "~features/Budget/ui/organisms/BudgetWizardFooter";
import type { CategoryBudgetTemplateProps } from "./types";
import { colors } from "@/shared/constants/colors";
import { krw } from "@/shared/utils/currency";

export default function CategoryBudgetTemplate({
  availableNextMonth,
  items,
  onChangeItem,
  onPressPrev,
  onPressNext,
  title = "카테고리별 예산 설정",
  subtitle = "꺼비가 회원님의 정보를 바탕으로 제안했어요.",
  disabled,
  stepIndex,
  stepTotal,
}: CategoryBudgetTemplateProps) {
  const allocated = useMemo(
    () => items.reduce((sum, it) => sum + (it.amount || 0), 0),
    [items]
  );
  const rest = availableNextMonth - allocated;
  const isOver = rest < 0;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* 1) 상단 카피 (header) */}
      <View style={styles.header}>
        <BudgetCopy title={title} subtitle={subtitle} />
      </View>

      {/* 2) 메인 콘텐츠 영역 */}
      <View style={styles.content}>
        {/* 전체 예산 안내 */}
        <Text style={styles.totalLine}>
          전체 예산은{" "}
          <Text style={styles.totalEmph}>{krw(availableNextMonth)}</Text>{" "}
          입니다.
        </Text>

        {/* 수정 안내 문구 */}
        <Text style={styles.editHint}>
          카테고리별 금액을 클릭하여 수정할 수 있습니다.
        </Text>

        {/* 카테고리 리스트 */}
        <View style={styles.listBox}>
          <CategoryBudgetList
            items={items}
            disabled={disabled}
            onChangeItem={onChangeItem}
            gap={12}
          />
        </View>

        {/* 남은/초과 금액 안내 - 남은 금액이 0이 아닐 때만 표시 */}
        {rest !== 0 && (
          <Text style={styles.remained}>
            {isOver ? (
              <>
                <Text style={styles.overAmount}>{krw(Math.abs(rest))}</Text>
                <Text style={styles.overText}> 초과했습니다.</Text>
              </>
            ) : (
              <>
                <Text style={styles.leftAmount}>{krw(rest)}</Text>
                <Text style={styles.leftText}> 남았습니다.</Text>
              </>
            )}
          </Text>
        )}
      </View>

      {/* 3) 푸터 (이전/다음) - 동일 좌표 고정 */}
      <BudgetWizardFooter
        stepIndex={stepIndex}
        stepTotal={stepTotal}
        onPressPrev={onPressPrev}
        onPressNext={onPressNext}
        // 남은 금액이 음수면 Next 비활성화(팀 정책에 맞게 조정)
        nextDisabled={isOver}
        baseBottom={LAYOUT.footerBaseBottom}
      />
    </SafeAreaView>
  );
}

const LAYOUT = {
  horizontal: 24,
  top: 40,
  gap: 16,
  footerBaseBottom: 32,
} as const;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_PRIMARY,
    paddingTop: 32,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: 16,
    gap: 16,
  },
  totalLine: {
    fontSize: 16,
    color: colors.GRAY_DARK,
  },
  totalEmph: {
    fontWeight: "700",
    color: colors.BLUE_NORMAL,
  },
  editHint: {
    fontSize: 14,
    color: colors.GRAY_NORMAL,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  listBox: {
    marginTop: 8,
    gap: 12,
  },
  remained: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },
  leftAmount: {
    color: colors.BLUE_NORMAL, // 파란색으로 남은 금액만 표시
    fontWeight: "700",
  },
  leftText: {
    color: colors.GRAY_DARK, // 텍스트는 기본 색상
    fontWeight: "700",
  },
  overAmount: {
    color: "#E53935", // 빨간색으로 초과 금액만 표시
    fontWeight: "700",
  },
  overText: {
    color: colors.GRAY_DARK, // 텍스트는 기본 색상
    fontWeight: "700",
  },
});
