import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import { krw } from "@/shared/utils/currency";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

interface BudgetConfirmModalProps {
  visible: boolean;
  month: string;
  totalBudget: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function BudgetConfirmModal({
  visible,
  month,
  totalBudget,
  onConfirm,
  onCancel,
}: BudgetConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>예산 최종 확정</Text>
            <Text style={styles.subtitle}>
              {month} 예산을 최종 확정하시겠습니까?
            </Text>
          </View>

          <View style={styles.budgetInfo}>
            <Text style={styles.budgetLabel}>확정할 예산</Text>
            <Text style={styles.budgetAmount}>{krw(totalBudget)}</Text>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              확정 후에는 이번 달 예산을 수정할 수 없습니다.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>확정</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    ...font.bold,
    color: colors.GRAY_DARK,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.GRAY_NORMAL,
    textAlign: "center",
  },
  budgetInfo: {
    backgroundColor: colors.BLUE_LIGHT,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  budgetLabel: {
    fontSize: 14,
    color: colors.GRAY_NORMAL,
    marginBottom: 4,
  },
  budgetAmount: {
    fontSize: 24,
    ...font.bold,
    color: colors.BLUE_NORMAL,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3CD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#856404",
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.GRAY_LIGHT,
  },
  confirmButton: {
    backgroundColor: colors.BLUE_NORMAL,
  },
  cancelButtonText: {
    fontSize: 16,
    ...font.medium,
    color: colors.GRAY_DARK,
  },
  confirmButtonText: {
    fontSize: 16,
    ...font.medium,
    color: "#fff",
  },
});
