import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { colors } from '@/shared/constants/colors';
import { font } from '@/shared/typography/font';
import { spacing, borderRadius, createInputStyles, createTextStyles } from '@/shared/theme/styles';
import { ValidationError } from '@/shared/components/ValidationError';

export interface EditableBudgetSummaryRowProps {
  title: string;
  amount: number;
  onAmountChange: (amount: number) => void;
  mode?: 'edit' | 'ai-setup';
}

export default function EditableBudgetSummaryRow({ 
  title, 
  amount, 
  onAmountChange,
  mode = 'edit'
}: EditableBudgetSummaryRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState((amount || 0).toString());
  const [error, setError] = useState<string | null>(null);

  const handlePress = () => {
    setIsEditing(true);
    setEditValue((amount || 0).toString());
    setError(null);
  };

  const handleSave = () => {
    const newAmount = parseInt(editValue.replace(/[^0-9]/g, '')) || 0;
    
    // 기본 유효성 검사만 수행 (합계 검사는 상위 컴포넌트에서)
    if (newAmount < 0) {
      setError('💰 금액은 0원 이상이어야 해요!');
      return;
    }
    
    if (newAmount > 10000000) {
      setError('💰 너무 큰 금액이에요! 최대 1천만원까지 가능해요');
      return;
    }

    setError(null);
    onAmountChange(newAmount);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue((amount || 0).toString());
    setIsEditing(false);
    setError(null);
  };

  return (
    <View style={[styles.editableRow, mode === 'ai-setup' && styles.aiModeRow]}>
      <Text style={[styles.editableRowTitle, mode === 'ai-setup' && styles.aiModeTitle]}>{title}</Text>
      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={[styles.editInput, error && styles.editInputError]}
            value={editValue}
            onChangeText={setEditValue}
            keyboardType="numeric"
            autoFocus
            onSubmitEditing={handleSave}
            onBlur={handleSave}
          />
          <TouchableOpacity onPress={handleCancel} style={styles.cancelEditButton}>
            <Text style={styles.cancelEditText}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={handlePress}>
          <Text style={[styles.editableAmount, mode === 'ai-setup' && styles.aiModeAmount]}>{(amount || 0).toLocaleString()}원</Text>
        </TouchableOpacity>
      )}
      <ValidationError error={error} />
    </View>
  );
}

const inputStyles = createInputStyles();
const textStyles = createTextStyles();

const styles = StyleSheet.create({
  editableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.BLUE_LIGHT,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  editableRowTitle: {
    ...textStyles.body,
  },
  editableAmount: {
    ...textStyles.body,
    ...font.bold,
    color: colors.BLUE_NORMAL,
  },
  editContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  editInput: {
    ...inputStyles.base,
  },
  editInputError: {
    ...inputStyles.error,
  },
  cancelEditButton: {
    padding: spacing.xs,
  },
  cancelEditText: {
    ...textStyles.body,
    color: colors.GRAY_DARK,
  },
  aiModeRow: {
    backgroundColor: colors.BLUE_NORMAL,
  },
  aiModeTitle: {
    color: "#ffffff",
  },
  aiModeAmount: {
    color: "#ffffff",
  },
});
