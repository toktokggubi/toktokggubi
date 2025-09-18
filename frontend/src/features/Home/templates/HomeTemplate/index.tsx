import React from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HomeTemplateProps } from "./types";
import { CharacterBackground } from "@/features/Home/ui/CharacterBackground";
import { CircularProgress } from "../../ui/CircularProgress";
import { ProgressList } from "../../ui/ProgressList";
import { colors } from "@/shared/constants/colors";
import { krw } from "@/shared/utils/currency";

const { width: screenWidth } = Dimensions.get("window");

export const HomeTemplate: React.FC<HomeTemplateProps> = ({
  totalBudget,
  availableAmount,
  characterMessage = "아직은 넉넉하다꺼비",
  categoryBudgets,
  transactions = {},
  onTotalBudgetPress,
  onCategoryPress,
  onBudgetSetup,
  month = "12월",
  listTitle = "카테고리별 사용현황",
  hasBudget = true,
}) => {
  // 예산이 설정되지 않았을 때
  if (!hasBudget) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.noBudgetContainer}>
          <Text style={styles.noBudgetTitle}>예산을 설정해주세요</Text>
          <Text style={styles.noBudgetSubtitle}>
            예산을 설정하면{'\n'}더 체계적으로 소비를 관리할 수 있어요
          </Text>
          <TouchableOpacity 
            style={styles.budgetSetupButton}
            onPress={onBudgetSetup}
          >
            <Text style={styles.budgetSetupButtonText}>예산 설정하러 가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 전체 화면을 차지하는 CharacterBackground */}
      <CharacterBackground 
        message={characterMessage}
        progressPercentage={(totalBudget.currentAmount / totalBudget.totalAmount) * 100}
        size={screenWidth}
      >
        <CircularProgress
          currentAmount={totalBudget.currentAmount}
          totalAmount={totalBudget.totalAmount}
          month={month}
          size={Math.min(150, (screenWidth - 60) * 0.6)}
        />
      </CharacterBackground>

      {/* 카테고리별 사용현황 - CharacterBackground 위에 오버레이 */}
      <View style={styles.overlayContainer}>
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <ProgressList
            categoryBudgets={categoryBudgets}
            transactions={transactions}
            onCategoryPress={onCategoryPress}
            title={listTitle}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_PRIMARY,
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    paddingTop: 260, // CharacterBackground 아래쪽부터 시작 (더 여백 줄임)
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  noBudgetContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noBudgetTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.GRAY_DARKER,
    marginBottom: 16,
    textAlign: 'center',
  },
  noBudgetSubtitle: {
    fontSize: 16,
    color: colors.GRAY_NORMAL,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  budgetSetupButton: {
    backgroundColor: colors.BLUE_NORMAL,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  budgetSetupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
