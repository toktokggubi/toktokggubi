import NextButton from "@/features/Budget/ui/atoms/NextButton";
import { Image as ExpoImage } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import { Animated, ImageSourcePropType, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BudgetIntroTemplateProps } from "./types";
import { introTemplateStyles as s } from "./variants";

export default function BudgetIntroTemplate({
  onNext,
  nextDisabled,
  mascotSource,
}: BudgetIntroTemplateProps) {
  // 애니메이션 값들
  const line1Opacity = useRef(new Animated.Value(0)).current;
  const line2Opacity = useRef(new Animated.Value(0)).current;
  const line3Opacity = useRef(new Animated.Value(0)).current;
  const mascotOpacity = useRef(new Animated.Value(1)).current; // 처음부터 보이도록 1로 설정

  // 애니메이션 완료 상태
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  useEffect(() => {
    // 순차적으로 애니메이션 실행 (총 1.5초)
    const animationSequence = Animated.sequence([
      // 첫 번째 라인 (0.5초)
      Animated.timing(line1Opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // 두 번째 라인 (0.5초)
      Animated.timing(line2Opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // 세 번째 라인 (0.5초)
      Animated.timing(line3Opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    // 애니메이션 시작
    animationSequence.start(() => {
      // 애니메이션 완료 후 버튼 활성화
      setIsAnimationComplete(true);
    });
  }, []);

  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      {/* 메인 콘텐츠 */}
      <View style={s.content}>
        <View style={s.titleWrap}>
          <Animated.Text style={[s.line, { opacity: line1Opacity }]}>
            <Text style={s.hl}>이번 달 예산</Text>을 세워
          </Animated.Text>
          <Animated.Text style={[s.line, { opacity: line2Opacity }]}>
            똑똑꺼비와 함께
          </Animated.Text>
          <Animated.Text style={[s.line, { opacity: line3Opacity }]}>
            <Text style={s.hl}>소비 관리</Text>를 시작해 보세요.
          </Animated.Text>
        </View>

        {mascotSource && (
          <Animated.View style={[s.mascot, { opacity: mascotOpacity }]}>
            <ExpoImage
              source={mascotSource as ImageSourcePropType}
              style={s.mascot}
              contentFit="cover"
            />
          </Animated.View>
        )}
      </View>

      {/* 하단 버튼 - 애니메이션 완료 후 활성화 */}
      <View style={s.footer}>
        <NextButton
          onPress={onNext}
          disabled={nextDisabled || !isAnimationComplete}
          tone="link"
        />
      </View>
    </SafeAreaView>
  );
}
