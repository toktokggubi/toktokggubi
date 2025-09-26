import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface MonthlySummarySectionProps {
  overallSummary: string;
  month: string;
}

export const MonthlySummarySection: React.FC<MonthlySummarySectionProps> = ({
  overallSummary,
  month,
}) => {
  // 문장을 마침표, 느낌표, 물음표로 분리하고 "감사합니다"까지만 표시
  const splitSentences = (text: string): string[] => {
    const sentences = text
      .split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0)
      .map(sentence => sentence + (sentence.match(/[.!?]$/) ? '' : '.'))
      // TODO: 임시 하드코딩 - AI 응답 품질 개선 후 제거 예정
      // 불필요한 문장들 제거 (하드코딩)
      .filter(sentence => 
        !sentence.includes('전체적인 요약을 드리자면') &&
        !sentence.includes('지출되고 있습니다') &&
        !sentence.includes('요약하면') &&
        !sentence.includes('정리하면')
      );
    
    // "감사합니다"가 포함된 문장까지만 표시
    const gratitudeIndex = sentences.findIndex(sentence => 
      sentence.includes('감사합니다') || sentence.includes('감사')
    );
    
    if (gratitudeIndex !== -1) {
      return sentences.slice(0, gratitudeIndex + 1);
    }
    
    return sentences;
  };

  const sentences = splitSentences(overallSummary);

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="chatbubble-ellipses" size={18} color={colors.BLUE_NORMAL} />
          <Text style={styles.title}>{month} 월간 소비 한마디</Text>
        </View>
      </View>

      {/* 내용 */}
      <View style={styles.content}>
        {sentences.map((sentence, index) => (
          <Text key={index} style={styles.sentenceText}>{sentence}</Text>
        ))}
      </View>

      {/* 하단 장식 */}
      <View style={styles.footer}>
        <View style={styles.footerDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.WHITE,
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    marginTop: 8,
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.GRAY_DARKER,
    marginLeft: 6,
    ...font.medium,
  },
  content: {
    backgroundColor: colors.BLUE_LIGHT,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sentenceText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.GRAY_DARKER,
    marginBottom: 6,
    ...font.regular,
  },
  footer: {
    alignItems: "center",
  },
  footerDots: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 3,
  },
  dot1: {
    backgroundColor: colors.BLUE_NORMAL,
    opacity: 0.6,
  },
  dot2: {
    backgroundColor: colors.BLUE_NORMAL,
    opacity: 0.4,
  },
  dot3: {
    backgroundColor: colors.BLUE_NORMAL,
    opacity: 0.2,
  },
});