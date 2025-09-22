import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/shared/constants/colors';
import { font } from '@/shared/typography/font';

interface ValidationErrorProps {
  error?: string | null;
  visible?: boolean;
}

export const ValidationError: React.FC<ValidationErrorProps> = ({ 
  error, 
  visible = true 
}) => {
  if (!error || !visible) return null;

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
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

  return (
    <View style={styles.summaryContainer}>
      {errors.map((error, index) => (
        <Text key={index} style={styles.summaryError}>
          {error.message}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.YELLOW_LIGHT,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.YELLOW_NORMAL,
  },
  errorText: {
    fontSize: 13,
    ...font.medium,
    color: colors.GRAY_DARK,
    lineHeight: 18,
  },
  summaryContainer: {
    marginTop: 8,
    marginHorizontal: 8,
    padding: 10,
    backgroundColor: colors.YELLOW_LIGHT,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.YELLOW_NORMAL,
  },
  summaryTitle: {
    fontSize: 16,
    ...font.bold,
    color: colors.GRAY_DARK,
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryError: {
    fontSize: 13,
    ...font.medium,
    color: colors.GRAY_DARK,
    lineHeight: 18,
    marginBottom: 6,
  },
});
