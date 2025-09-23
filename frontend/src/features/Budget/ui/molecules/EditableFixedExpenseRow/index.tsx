import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { colors } from '@/shared/constants/colors';
import { font } from '@/shared/typography/font';
import { spacing, borderRadius, createButtonStyles, createTextStyles } from '@/shared/theme/styles';

export interface EditableFixedExpenseRowProps {
  item: {
    id: string;
    name: string;
    amount: number;
    includeInBudget: boolean;
    billingDay?: number;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export default function EditableFixedExpenseRow({ 
  item, 
  onEdit, 
  onDelete 
}: EditableFixedExpenseRowProps) {
  const handleDelete = () => {
    Alert.alert(
      "고정 지출 삭제",
      "이 고정 지출을 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { text: "삭제", style: "destructive", onPress: onDelete }
      ]
    );
  };

  return (
    <View style={styles.fixedExpenseRow}>
      <View style={styles.fixedExpenseLeft}>
        <Text style={styles.fixedExpenseName}>{item.name}</Text>
        {item.billingDay && (
          <Text style={styles.fixedExpenseBillingDay}>매달 {item.billingDay}일</Text>
        )}
      </View>
      <View style={styles.fixedExpenseRight}>
        <Text style={styles.fixedExpenseAmount}>{(item.amount || 0).toLocaleString()}원</Text>
        <View style={styles.fixedExpenseActions}>
          <TouchableOpacity onPress={onEdit} style={styles.editButton}>
            <Text style={styles.editButtonText}>편집</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>삭제</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const buttonStyles = createButtonStyles('sm');
const textStyles = createTextStyles();

const styles = StyleSheet.create({
  fixedExpenseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.BLUE_LIGHT,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  fixedExpenseLeft: {
    flex: 1,
  },
  fixedExpenseName: {
    ...textStyles.body,
  },
  fixedExpenseBillingDay: {
    ...textStyles.small,
    color: colors.GRAY_NORMAL,
    marginTop: spacing.xs,
  },
  fixedExpenseRight: {
    alignItems: "flex-end",
  },
  fixedExpenseAmount: {
    ...textStyles.body,
    ...font.bold,
    color: colors.GRAY_DARK,
    marginBottom: spacing.sm,
  },
  fixedExpenseActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  editButton: {
    ...buttonStyles.base,
    ...buttonStyles.secondary,
  },
  editButtonText: {
    ...textStyles.small,
    ...font.medium,
    color: colors.BLUE_NORMAL,
  },
  deleteButton: {
    ...buttonStyles.base,
    ...buttonStyles.secondary,
  },
  deleteButtonText: {
    ...textStyles.small,
    ...font.medium,
    color: colors.BLUE_DARK,
  },
});
