import { font } from "@/shared/typography/font";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { SegmentedTabsProps } from "./types";

function SegmentedTabs({
  options,
  value,
  onChange,
  height = 48,
}: SegmentedTabsProps) {
  const [containerW, setContainerW] = useState(0);
  const itemW = containerW > 0 ? containerW / Math.max(options.length, 1) : 0;
  const anim = useRef(new Animated.Value(value)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [value]);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setContainerW(w);
    anim.setValue(value);
  };

  const translateX = useMemo(
    () =>
      anim.interpolate({
        inputRange: options.map((_, i) => i),
        outputRange: options.map((_, i) => i * itemW),
      }),
    [options.length, itemW]
  );

  return (
    <View
      onLayout={onLayout}
      style={[styles.wrap, { height, borderRadius: height / 2 }]}
    >
      {/* 선택된 thumb */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.thumb,
          {
            height: height,
            width: itemW - 4,
            borderRadius: (height - 8) / 2,
            transform: [{ translateX }],
          },
        ]}
      />
      {/* 탭 버튼 */}
      {options.map((label, i) => {
        const selected = i === value;
        return (
          <Pressable
            key={`${label}-${i}`}
            style={styles.item}
            onPress={() => {
              onChange(i);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            hitSlop={10}
            pressRetentionOffset={10}
          >
            <Text style={[styles.text, selected && styles.textSelected]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default SegmentedTabs;

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: "#EAF2FF",
    overflow: "hidden",
  },
  thumb: {
    position: "absolute",
    left: 4,
    backgroundColor: "#2F86FF",
  },
  item: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  text: {
    fontSize: 13,
    color: "#3B3F4A",
  },
  textSelected: {
    color: "#FFFFFF",
    ...font.medium,
  },
});
