import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import Markdown from "react-native-markdown-display";

interface MonthlySummarySectionProps {
  overallSummary: string;
  month: string;
}

export const MonthlySummarySection: React.FC<MonthlySummarySectionProps> = ({
  overallSummary,
  month,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

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

  // ### 기준으로 섹션 나누기
  const splitIntoSections = (text: string): Array<{title: string, content: string}> => {
    const sections = text.split(/^###\s*/m).filter(section => section.trim().length > 0);
    
    return sections.map(section => {
      const lines = section.trim().split('\n');
      const title = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();
      
      return {
        title: title || '제목 없음',
        content: content || section.trim()
      };
    });
  };

  // 마크다운 리스트 형식 수정
  const processMarkdownText = (text: string): string => {
    return text
      // 순서가 있는 리스트 수정 (1. 다음 줄바꿈 제거)
      .replace(/(\d+\.)\s*\n\s*/g, '$1 ')
      // 불릿 리스트 수정 (- 다음 줄바꿈 제거)
      .replace(/(-\s*)\n\s*/g, '$1')
      // 별표 불릿 리스트 수정 (* 다음 줄바꿈 제거)
      .replace(/(\*\s*)\n\s*/g, '$1');
  };

  const sections = splitIntoSections(sentences.join('\n\n'));

  // 섹션 토글 함수
  const toggleSection = (index: number) => {
    const newExpandedSections = new Set(expandedSections);
    if (newExpandedSections.has(index)) {
      newExpandedSections.delete(index);
    } else {
      newExpandedSections.add(index);
    }
    setExpandedSections(newExpandedSections);
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <TouchableOpacity 
        style={[styles.header, !isExpanded && styles.headerCollapsed]} 
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.titleContainer}>
          <Image 
            source={require("@/assets/images/character/big-character-07.png")} 
            style={styles.characterImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>
            {month} 월간 소비 한마디 ▼
          </Text>
        </View>
      </TouchableOpacity>

      {/* 내용 */}
      {isExpanded && (
        <View style={styles.content}>
          {sections.map((section, index) => {
            // 첫 번째 섹션은 줄글로 표시
            if (index === 0) {
              return (
                <View key={index} style={styles.firstSection}>
                  <Markdown style={markdownStyles}>
                    {processMarkdownText(section.content)}
                  </Markdown>
                </View>
              );
            }
            
            // 나머지 섹션들은 접었다 폈다 기능 적용
            return (
              <View key={index} style={styles.sectionContainer}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => toggleSection(index)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Ionicons
                    name={expandedSections.has(index) ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={colors.GRAY_NORMAL}
                  />
                </TouchableOpacity>
                
                {expandedSections.has(index) && (
                  <View style={styles.sectionContent}>
                    <Markdown style={markdownStyles}>
                      {processMarkdownText(section.content)}
                    </Markdown>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

    </View>
  );
};

// 마크다운 스타일 정의
const markdownStyles = {
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.GRAY_DARKER,
    ...font.regular,
  },
  paragraph: {
    marginBottom: 16,
    lineHeight: 24,
  },
  strong: {
    fontWeight: '600' as const,
    color: colors.BLUE_NORMAL,
  },
  em: {
    fontStyle: 'italic' as const,
    color: colors.GRAY_DARK,
  },
  heading1: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.GRAY_DARKER,
    marginBottom: 8,
    ...font.medium,
  },
  heading2: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.GRAY_DARKER,
    marginBottom: 6,
    ...font.medium,
  },
  heading3: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.GRAY_DARKER,
    marginBottom: 4,
    ...font.medium,
  },
  bullet_list: {
    marginBottom: 12,
    paddingLeft: 16,
  },
  bullet_list_item: {
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 22,
    color: colors.GRAY_DARKER,
    ...font.regular,
  },
  ordered_list: {
    marginBottom: 12,
    paddingLeft: 16,
  },
  ordered_list_item: {
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 22,
    color: colors.GRAY_DARKER,
    ...font.regular,
  },
  code_inline: {
    backgroundColor: colors.GRAY_LIGHT,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  code_block: {
    backgroundColor: colors.GRAY_LIGHT,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: colors.BLUE_NORMAL,
    paddingLeft: 12,
    marginVertical: 8,
    backgroundColor: colors.BLUE_LIGHT,
    padding: 12,
    borderRadius: 8,
  },
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 8,
  },
  header: {
    marginTop: 4,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  headerCollapsed: {
    marginTop: 4,
    marginBottom: 0,
    backgroundColor: 'transparent',
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  characterImage: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.GRAY_DARKER,
    ...font.medium,
  },
  content: {
    backgroundColor: colors.BLUE_LIGHT,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  firstSection: {
    marginBottom: 16,
  },
  sectionContainer: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.BACKGROUND_PRIMARY,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.GRAY_LIGHT,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.GRAY_DARKER,
    flex: 1,
    ...font.medium,
  },
  sectionContent: {
    backgroundColor: colors.BACKGROUND_PRIMARY,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.GRAY_LIGHT,
  },
});