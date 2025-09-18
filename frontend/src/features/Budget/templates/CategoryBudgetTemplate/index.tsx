import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import { krw } from "@/shared/utils/currency";
import React, { useMemo } from "react";
import { StyleSheet, Text, View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BudgetCopy from "~features/Budget/ui/molecules/BudgetCopy";
import BudgetWizardFooter from "~features/Budget/ui/organisms/BudgetWizardFooter";
import CategoryBudgetList from "~features/Budget/ui/organisms/CategoryBudgetList";
import type { CategoryBudgetTemplateProps } from "./types";

export default function CategoryBudgetTemplate({
  availableNextMonth,
  items,
  onChangeItem,
  onPressPrev,
  onPressNext,
  title = "카테고리별 예산 설정",
  subtitle = "꺼비가 회원님의 정보를 바탕으로 제안했어요.",
  disabled,
  nextDisabled,
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

      {/* 2) 전체 예산 안내 - 고정 위치 */}
      <View style={styles.budgetInfo}>
        <Text style={styles.totalLine}>
          전체 예산은{" "}
          <Text style={styles.totalEmph}>{krw(availableNextMonth)}</Text>{" "}
          입니다.
        </Text>
        
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

      {/* 3) 키보드 회피 영역 */}
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'android' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}
      >
        {/* 스크롤 가능한 메인 콘텐츠 영역 */}
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 4) 푸터 (이전/다음) - 동일 좌표 고정 */}
      <BudgetWizardFooter
        stepIndex={stepIndex}
        stepTotal={stepTotal}
        onPressPrev={onPressPrev}
        onPressNext={onPressNext}
        nextDisabled={nextDisabled}
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
  budgetInfo: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.BACKGROUND_PRIMARY,
    borderBottomWidth: 1,
    borderBottomColor: colors.GRAY_LIGHT,
    gap: 4,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20, // footer와의 간격 확보
  },
  totalLine: {
    fontSize: 16,
    color: colors.GRAY_DARK,
    textAlign: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 10,
    borderColor: colors.BLUE_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    ...font.bold,
  },
  totalEmph: {
    ...font.bold,
    color: "#000000",
  },
  editHint: {
    fontSize: 14,
    color: colors.GRAY_NORMAL,
    textAlign: "center",
    marginBottom: 16,
  },
  listBox: {
    gap: 12,
  },
  remained: {
    textAlign: "center",
    fontSize: 14,
    ...font.bold,
  },
  leftAmount: {
    color: colors.BLUE_NORMAL, // 파란색으로 남은 금액만 표시
    ...font.bold,
  },
  leftText: {
    color: colors.GRAY_DARK, // 텍스트는 기본 색상
    ...font.bold,
  },
  overAmount: {
    color: "#E53935", // 빨간색으로 초과 금액만 표시
    ...font.bold,
  },
  overText: {
    color: colors.GRAY_DARK, // 텍스트는 기본 색상
    ...font.bold,
  },
});
