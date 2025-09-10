import React from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
import { colors } from "@/shared/constants/colors";

import BudgetCopy from "~features/Budget/ui/molecules/BudgetCopy";
import FixedExpenseList from "~features/Budget/ui/organisms/FixedExpenseList";
import BudgetWizardFooter from "~features/Budget/ui/organisms/BudgetWizardFooter";
import AddFixedExpenseForm from "~features/Budget/ui/forms/AddFixedExpenseForm";

import type { FixedExpenseTemplateProps } from "./types";
import { COPY_DEFAULT, LAYOUT } from "./variants";

export default function FixedExpenseTemplate({
  // 상단 카피
  title = COPY_DEFAULT.title,
  subtitle = COPY_DEFAULT.subtitle,

  // 리스트
  items,
  onPressItem,
  onPressAdd,

  // 폼(옆 모달)
  formVisible,
  formMode = "create",
  formDefaultValues,
  onSubmitForm,
  onCancelForm,

  // 안내 텍스트
  availableNextMonth,

  // 푸터
  stepIndex,
  stepTotal,
  onPressPrev,
  onPressNext,
  nextDisabled,
}: FixedExpenseTemplateProps) {
  return (
    <View style={s.container}>
      {/* 1) 상단 카피 */}
      <View
        style={{ paddingHorizontal: LAYOUT.horizontal, paddingTop: LAYOUT.top }}
      >
        <BudgetCopy title={title} subtitle={subtitle} />
      </View>

      {/* 2) 리스트 영역 */}
      <View style={{ paddingHorizontal: LAYOUT.horizontal, marginTop: 16 }}>
        <FixedExpenseList
          items={items}
          onPressItem={onPressItem}
          onPressAdd={onPressAdd}
        />
      </View>

      {/* 3) 안내 텍스트 */}
      <View style={{ paddingHorizontal: LAYOUT.horizontal, marginTop: 12 }}>
        <Text style={s.notice}>
          다음 달 사용 가능 예산은{" "}
          <Text style={s.accent}>{availableNextMonth.toLocaleString()}원</Text>{" "}
          입니다.
        </Text>
      </View>

      {/* 4) 푸터 (이전/점/다음) */}
      <BudgetWizardFooter
        stepIndex={stepIndex}
        stepTotal={stepTotal}
        onPressPrev={onPressPrev}
        onPressNext={onPressNext}
        nextDisabled={nextDisabled}
        baseBottom={LAYOUT.footerBaseBottom}
      />

      {/* 5) 우측(옆) 모달: 추가/수정 겸용 폼 */}
      <Modal
        visible={formVisible}
        animationType="slide"
        onRequestClose={onCancelForm}
        presentationStyle="pageSheet" // iOS 시트 느낌, 안드로이드는 slide
      >
        <AddFixedExpenseForm
          mode={formMode}
          defaultValues={formDefaultValues}
          onSubmit={onSubmitForm}
          onCancel={onCancelForm}
        />
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FF" },
  notice: { textAlign: "left", color: "#222" },
  accent: { color: colors.BLUE_NORMAL, fontWeight: "700" },
});
