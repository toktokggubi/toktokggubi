import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/shared/constants/colors';
import { font } from '@/shared/typography/font';
import { spacing, borderRadius, createTextStyles } from '@/shared/theme/styles';

interface ValidationErrorProps {
  error?: string | null;
  visible?: boolean;
}

export const ValidationError: React.FC<ValidationErrorProps> = ({ 
  error, 
  visible = true 
}) => {
  if (!error || !visible) return null;

  const textStyles = createTextStyles();

  return (
    <View style={styles.errorContainer}>
      <Text style={[textStyles.small, styles.errorText]}>{error}</Text>
    </View>
  );
};

interface ValidationSummaryProps {
  errors: Array<{ field: string; message: string }>;
  visible?: boolean;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({ 
  errors, 
  visible = true 
}) => {
  if (!errors.length || !visible) return null;

  const textStyles = createTextStyles();

  return (
    <View style={styles.summaryContainer}>
      {errors.map((error, index) => (
        <Text key={index} style={[textStyles.small, styles.summaryError]}>
          {error.message}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.YELLOW_LIGHT,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.YELLOW_NORMAL,
  },
  errorText: {
    color: colors.GRAY_DARK,
    lineHeight: 18,
  },
  summaryContainer: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.sm,
    padding: spacing.md + 2,
    backgroundColor: colors.YELLOW_LIGHT,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.YELLOW_NORMAL,
  },
  summaryError: {
    color: colors.GRAY_DARK,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
});
