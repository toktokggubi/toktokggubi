import { CATEGORY_ICON_BY_NAME } from "@/shared/constants/categoryIcons";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import { spacing, borderRadius, createButtonStyles, createTextStyles } from "@/shared/theme/styles";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BudgetSummaryHeaderRow from "~features/Budget/ui/molecules/BudgetSummaryHeaderRow";
import DividerDashed from "~features/Budget/ui/molecules/DividerDashed";
import EditableBudgetSummaryRow from "~features/Budget/ui/molecules/EditableBudgetSummaryRow";
import EditableCategoryBudgetRow from "~features/Budget/ui/molecules/EditableCategoryBudgetRow";
import EditableFixedExpenseRow from "~features/Budget/ui/molecules/EditableFixedExpenseRow";
import { ValidationSummary } from "@/shared/components/ValidationError";
import { validateBudgetSums } from "./validation";
import type { BudgetEditTemplateProps } from "./types";

export default function BudgetEditTemplate({
  month,
  totalBudget,
  variableBudget,
  fixedIncludedBudget,
  fixedExcludedBudget,
  categoryBudgets,
  fixedIncludedExpenses,
  fixedExcludedExpenses,
  onTotalBudgetChange,
  onVariableBudgetChange,
  onCategoryBudgetChange,
  onAddFixedExpense,
  onEditFixedExpense,
  onDeleteFixedExpense,
  onPressCancel,
  onPressSave,
  saveDisabled = false,
  mode = 'edit',
  saveButtonText = '수정 완료',
  aiRecommendations,
}: BudgetEditTemplateProps) {
  
  // 합계 유효성 검사
  const validationResult = useMemo(() => {
    return validateBudgetSums({
      totalBudget,
      variableBudget,
      fixedIncludedBudget,
      categoryBudgets
    });
  }, [totalBudget, variableBudget, fixedIncludedBudget, categoryBudgets]);
  
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* 고정 헤더 */}
      <View style={styles.header}>
        <Text style={styles.editText}>
          {mode === 'ai-setup' ? `${month} 예산 설정` : `${month} 예산 편집`}
        </Text>
        {/* 유효성 검사 결과 표시 */}
        <ValidationSummary errors={validationResult.errors} />
      </View>

      {/* 스크롤 가능한 메인 콘텐츠 영역 */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* AI 추천 배너 */}
        {mode === 'ai-setup' && (
          <View style={styles.aiRecommendationBanner}>
            <View style={styles.aiRecommendationHeader}>
              <Text style={styles.aiRecommendationTitle}>
                🤖 AI 예산 추천
              </Text>
            </View>
            <Text style={styles.aiRecommendationText}>
              이전 달 지출 내역과 예산 달성 등 정보를 활용하여 제안한 이번 달 예산입니다.
            </Text>
                <View style={styles.aiRecommendationReasonBox}>
                  <Text style={styles.aiRecommendationReasonTitle}>
                    💡 이렇게 예산을 설정한 이유
                  </Text>
                  <Text style={styles.aiRecommendationReason}>
                    {aiRecommendations?.recommendationReason ? (
                      <>
                        • 총 예산: {aiRecommendations.recommendationReason.totalBudgetReason}{'\n'}
                        {aiRecommendations.recommendationReason.categoryReasons.slice(0, 3).map((reason: any, index: number) => (
                          <Text key={index}>
                            • {reason.categoryName}: {reason.reason}{'\n'}
                          </Text>
                        ))}
                        {aiRecommendations.recommendationReason.overallInsights.length > 0 && (
                          <Text>
                            • {aiRecommendations.recommendationReason.overallInsights[0]}
                          </Text>
                        )}
                      </>
                    ) : (
                      <>
                        • 식비: 월 평균 패턴 분석 기반{'\n'}
                        • 카페/간식: 이용 빈도 고려{'\n'}
                        • 미사용 카테고리: 0원으로 유연성 확보
                      </>
                    )}
                  </Text>
                </View>
            <Text style={styles.aiRecommendationSubText}>
              필요에 따라 수정해주세요.
            </Text>
          </View>
        )}
        {/* 전체 예산 요약 */}
        <EditableBudgetSummaryRow 
          title={`${month} 예산`} 
          amount={totalBudget}
          onAmountChange={onTotalBudgetChange}
          mode={mode}
        />

        {/* 변동 지출 예산 섹션 */}
        <View style={styles.section}>
          <EditableBudgetSummaryRow
            title="변동 지출 예산"
            amount={variableBudget}
            onAmountChange={onVariableBudgetChange}
            mode={mode}
          />
          {categoryBudgets
            .sort((a, b) => b.amount - a.amount) // 금액이 많은 순으로 정렬
            .map((item) => (
              <EditableCategoryBudgetRow
                key={item.name}
                name={item.name}
                icon={CATEGORY_ICON_BY_NAME[item.name]}
                amount={item.amount}
                onAmountChange={(amount) => onCategoryBudgetChange(item.name, amount)}
              />
            ))}
        </View>

        {/* 고정 지출 (예산 포함) 섹션 */}
        <View style={styles.section}>
          <BudgetSummaryHeaderRow
            title="고정 지출 (예산 포함)"
            amount={fixedIncludedBudget}
            mode={mode}
          />
          {fixedIncludedExpenses.map((item) => (
            <EditableFixedExpenseRow 
              key={item.id} 
              item={item}
              onEdit={() => onEditFixedExpense(item)}
              onDelete={() => onDeleteFixedExpense(item.id)}
            />
          ))}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={onAddFixedExpense}
          >
            <Text style={styles.addButtonText}>+ 고정 지출 추가</Text>
          </TouchableOpacity>
        </View>

        {/* 구분선 */}
        <DividerDashed />

        {/* 고정 지출 (예산 미포함) 섹션 */}
        <View style={styles.section}>
          <BudgetSummaryHeaderRow
            title="고정 지출 (예산 미포함)"
            amount={fixedExcludedBudget}
            mode={mode}
          />
          {fixedExcludedExpenses.map((item) => (
            <EditableFixedExpenseRow 
              key={item.id} 
              item={item}
              onEdit={() => onEditFixedExpense(item)}
              onDelete={() => onDeleteFixedExpense(item.id)}
            />
          ))}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={onAddFixedExpense}
          >
            <Text style={styles.addButtonText}>+ 고정 지출 추가</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 하단 버튼들 */}
      <View style={styles.footerContainer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onPressCancel}
          >
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.saveButton, (saveDisabled || !validationResult.isValid) && styles.saveButtonDisabled]}
            onPress={onPressSave}
            disabled={saveDisabled || !validationResult.isValid}
          >
            <Text style={[styles.saveButtonText, (saveDisabled || !validationResult.isValid) && styles.saveButtonTextDisabled]}>
              {saveButtonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}


const buttonStyles = createButtonStyles('lg');
const textStyles = createTextStyles();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_PRIMARY,
  },
  header: {
    alignItems: "center",
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.BACKGROUND_PRIMARY,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  editText: {
    ...textStyles.h3,
  },
  aiRecommendationBanner: {
    backgroundColor: "#FFFFFF",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  aiRecommendationHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  aiRecommendationTitle: {
    ...textStyles.body,
    color: colors.BLUE_NORMAL,
    fontWeight: '700',
    fontSize: 18,
    ...font.bold,
  },
  aiRecommendationText: {
    ...textStyles.body,
    color: "#374151",
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  aiRecommendationReasonBox: {
    backgroundColor: "#F8FAFC",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.BLUE_NORMAL,
  },
  aiRecommendationReasonTitle: {
    ...textStyles.caption,
    color: colors.BLUE_NORMAL,
    fontWeight: '600',
    marginBottom: spacing.xs,
    ...font.bold,
  },
  aiRecommendationReason: {
    ...textStyles.caption,
    color: "#4B5563",
    lineHeight: 18,
    fontSize: 13,
  },
  aiRecommendationSubText: {
    ...textStyles.caption,
    color: "#6B7280",
    textAlign: 'center',
    fontSize: 12,
    fontStyle: 'italic',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  section: {
    gap: spacing.xs,
  },
  addButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: "#ffffff",
    borderRadius: borderRadius.md,
    alignItems: "center",
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.GRAY_LIGHT,
  },
  addButtonText: {
    ...textStyles.caption,
    color: colors.BLUE_NORMAL,
  },
  footerContainer: {
    backgroundColor: colors.BACKGROUND_PRIMARY,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: colors.GRAY_LIGHT,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    ...buttonStyles.base,
    ...buttonStyles.outline,
  },
  cancelButtonText: {
    ...textStyles.body,
    color: colors.GRAY_DARK,
  },
  saveButton: {
    flex: 1,
    ...buttonStyles.base,
    ...buttonStyles.primary,
  },
  saveButtonDisabled: {
    ...buttonStyles.disabled,
  },
  saveButtonText: {
    ...textStyles.body,
    ...font.bold,
    color: "#ffffff",
  },
  saveButtonTextDisabled: {
    color: colors.GRAY_DARK,
  },
});
