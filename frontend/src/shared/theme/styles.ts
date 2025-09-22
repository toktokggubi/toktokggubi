import { StyleSheet } from 'react-native';
import { colors } from '@/shared/constants/colors';
import { font } from '@/shared/typography/font';

// 공통 스타일 토큰
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
} as const;

export const buttonSizes = {
  sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: 12,
  },
  md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 14,
  },
  lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    fontSize: 16,
  },
} as const;

// 공통 스타일 팩토리
export const createButtonStyles = (size: keyof typeof buttonSizes = 'md') => {
  const sizeStyles = buttonSizes[size];
  
  return StyleSheet.create({
    base: {
      ...sizeStyles,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primary: {
      backgroundColor: colors.BLUE_NORMAL,
    },
    secondary: {
      backgroundColor: colors.BLUE_LIGHT,
      borderWidth: 1,
      borderColor: colors.BLUE_NORMAL,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.GRAY_LIGHT,
    },
    disabled: {
      backgroundColor: colors.GRAY_LIGHT,
      opacity: 0.5,
    },
  });
};

export const createTextStyles = () => {
  return StyleSheet.create({
    h1: {
      fontSize: 24,
      ...font.bold,
      color: colors.GRAY_DARK,
    },
    h2: {
      fontSize: 20,
      ...font.bold,
      color: colors.GRAY_DARK,
    },
    h3: {
      fontSize: 18,
      ...font.bold,
      color: colors.GRAY_DARK,
    },
    body: {
      fontSize: 16,
      ...font.medium,
      color: colors.GRAY_DARK,
    },
    caption: {
      fontSize: 14,
      ...font.medium,
      color: colors.GRAY_NORMAL,
    },
    small: {
      fontSize: 12,
      ...font.medium,
      color: colors.GRAY_NORMAL,
    },
  });
};

export const createInputStyles = () => {
  return StyleSheet.create({
    base: {
      fontSize: 16,
      ...font.bold,
      color: colors.BLUE_NORMAL,
      borderWidth: 1,
      borderColor: colors.BLUE_NORMAL,
      borderRadius: borderRadius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      minWidth: 100,
    },
    error: {
      borderColor: colors.BLUE_DARK,
      backgroundColor: colors.BLUE_LIGHT,
    },
    focused: {
      borderColor: colors.BLUE_NORMAL,
      borderWidth: 2,
    },
  });
};

export const createCardStyles = () => {
  return StyleSheet.create({
    base: {
      backgroundColor: '#ffffff',
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.sm,
    },
    elevated: {
      backgroundColor: '#ffffff',
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.sm,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    outlined: {
      backgroundColor: '#ffffff',
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.BLUE_LIGHT,
    },
  });
};
