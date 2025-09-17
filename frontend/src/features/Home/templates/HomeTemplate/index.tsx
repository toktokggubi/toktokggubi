import React from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
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
  month = "12월",
  listTitle = "카테고리별 사용현황",
}) => {
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
});
