import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AddFixedExpenseForm from "~features/Budget/ui/forms/AddFixedExpenseForm";
import BudgetCopy from "~features/Budget/ui/molecules/BudgetCopy";
import BudgetWizardFooter from "~features/Budget/ui/organisms/BudgetWizardFooter";
import FixedExpenseList from "~features/Budget/ui/organisms/FixedExpenseList";

import type { FixedExpenseTemplateProps } from "./types";
import { COPY_DEFAULT, LAYOUT } from "./variants";

export default function FixedExpenseTemplate({
  title = COPY_DEFAULT.title,
  subtitle = COPY_DEFAULT.subtitle,
  items,
  onPressItem,
  onPressAdd,
  formVisible,
  formMode = "create",
  formDefaultValues,
  onSubmitForm,
  onCancelForm,
  availableNextMonth,
  stepIndex,
  stepTotal,
  onPressPrev,
  onPressNext,
  nextDisabled,
}: FixedExpenseTemplateProps) {
  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      {/* 1) 상단 카피 (header) */}
      <View style={s.header}>
        <BudgetCopy title={title} subtitle={subtitle} />
      </View>

      {/* 2) 리스트 영역 (centerContent 느낌, 화면을 채우는 본문) */}
      <View style={s.listArea}>
        <FixedExpenseList
          items={items}
          onPressItem={onPressItem}
          onPressAdd={onPressAdd}
        />
      </View>

      {/* 3) 하단 안내문 (bottomContent) */}
      <View style={s.bottomContent}>
        <Text style={s.notice}>
          다음 달 사용 가능 예산은{" "}
          <Text style={s.accent}>{availableNextMonth.toLocaleString()}원</Text>{" "}
          입니다.
        </Text>
      </View>

      {/* 4) 푸터 (이전/점/다음) - 동일 좌표 고정 */}
      <BudgetWizardFooter
        stepIndex={stepIndex}
        stepTotal={stepTotal}
        onPressPrev={onPressPrev}
        onPressNext={onPressNext}
        nextDisabled={nextDisabled}
        baseBottom={LAYOUT.footerBaseBottom}
      />

      {/* 5) 옆 모달 */}
      <Modal
        visible={formVisible}
        animationType="slide"
        onRequestClose={onCancelForm}
        presentationStyle="pageSheet"
      >
        <AddFixedExpenseForm
          mode={formMode}
          defaultValues={formDefaultValues}
          onSubmit={onSubmitForm}
          onCancel={onCancelForm}
        />
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_PRIMARY,
    paddingTop: 32,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  listArea: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  bottomContent: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  notice: {
    textAlign: "left",
    color: "#222",
  },
  accent: {
    color: colors.BLUE_NORMAL,
    ...font.bold,
  },
});
