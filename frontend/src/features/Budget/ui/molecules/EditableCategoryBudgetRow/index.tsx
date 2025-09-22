import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, StyleSheet } from 'react-native';
import { colors } from '@/shared/constants/colors';
import { font } from '@/shared/typography/font';
import { spacing, borderRadius, createInputStyles, createTextStyles } from '@/shared/theme/styles';
import { ValidationError } from '@/shared/components/ValidationError';

export interface EditableCategoryBudgetRowProps {
  name: string;
  icon: any;
  amount: number;
  onAmountChange: (amount: number) => void;
}

export default function EditableCategoryBudgetRow({ 
  name, 
  icon, 
  amount, 
  onAmountChange 
}: EditableCategoryBudgetRowProps) {
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
    <View>
      <TouchableOpacity
        onPress={handlePress}
        style={styles.categoryRow}
      >
        <View style={styles.categoryLeft}>
          <Image source={icon} style={styles.categoryIcon} resizeMode="contain" />
          <Text style={styles.categoryName}>{name}</Text>
        </View>
        <View style={styles.categoryRight}>
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
            <Text style={styles.categoryAmount}>{(amount || 0).toLocaleString()}</Text>
          )}
          <Text style={styles.categoryWon}>원</Text>
        </View>
      </TouchableOpacity>
      <ValidationError error={error} />
    </View>
  );
}

const inputStyles = createInputStyles();
const textStyles = createTextStyles();

const styles = StyleSheet.create({
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.BLUE_LIGHT,
    backgroundColor: "#fff",
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  categoryIcon: {
    width: 36,
    height: 36,
  },
  categoryName: {
    ...textStyles.body,
  },
  categoryRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryAmount: {
    minWidth: 90,
    textAlign: "right",
    ...textStyles.body,
    ...font.bold,
    color: colors.GRAY_DARK,
    padding: 0,
    margin: 0,
  },
  categoryWon: {
    marginLeft: spacing.xs,
    ...textStyles.caption,
    color: colors.GRAY_DARK,
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
});
