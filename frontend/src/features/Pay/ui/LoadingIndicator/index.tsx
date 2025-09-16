import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/shared/constants/colors';
import type { LoadingIndicatorProps } from './types';



export default function LoadingIndicator({ 
  isLoading, 
  isFetching, 
  message = "주변 가맹점을 찾는 중...",
  showBackground = true 
}: LoadingIndicatorProps) {
  if (!isLoading && !isFetching) return null;

  return (
    <View style={[styles.container, !showBackground && styles.noBackground]} pointerEvents="none">
      <ActivityIndicator size="large" color={colors.BLUE_NORMAL} />
      <Text style={styles.message}>
        {isLoading ? message : "업데이트 중..."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  noBackground: {
    backgroundColor: 'transparent',
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: colors.GRAY_DARK,
    textAlign: 'center',
  },
});
