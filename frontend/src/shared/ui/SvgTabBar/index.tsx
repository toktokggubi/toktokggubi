import React from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, AntDesign, Ionicons } from "@expo/vector-icons";
import Svg, {
  Path,
  Defs,
  Filter,
  FeFlood,
  FeColorMatrix,
  FeMorphology,
  FeOffset,
  FeGaussianBlur,
  FeComposite,
  FeBlend,
} from "react-native-svg";
import { colors } from "@/shared/constants/colors";
import { SvgTabBarProps } from "./types";

const { width } = Dimensions.get("window");
const TAB_WIDTH = width / 3;

// SVG 탭바 배경 컴포넌트
const TabBarBackground = () => {
  return (
    <Svg
      width="120%"
      height="120%"
      viewBox="0 0 468 163"
      style={styles.tabBarBackground}
    >
      <Defs>
        <Filter
          id="filter0_d_538_972"
          x="0"
          y="-20"
          width="468"
          height="100"
          filterUnits="userSpaceOnUse"
        >
          <FeFlood floodOpacity="0" result="BackgroundImageFix" />
          <FeColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 127 0"
            result="hardAlpha"
          />
          <FeGaussianBlur in="hardAlpha" stdDeviation="12" result="blurred" />
          <FeOffset in="blurred" dy="-12" result="moved" />
          <FeComposite in="moved" in2="hardAlpha" operator="out" />
          <FeColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.15 0"
          />
          <FeBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="shadow"
          />
          <FeBlend
            mode="normal"
            in="SourceGraphic"
            in2="shadow"
            result="shape"
          />
        </Filter>
      </Defs>
      <Path
        d="M303.649 63.929C289.882 63.929 276.687 57.796 268.278 46.8861C260.367 36.6168 247.954 30 233.997 30C220.039 30 207.627 36.6168 199.715 46.8861C191.306 57.796 178.111 63.929 164.344 63.929H28C12.536 63.929 0 76.465 0 91.929V137H440V91.929C440 76.465 427.464 63.929 412 63.929H303.656H303.649Z"
        fill={colors.BACKGROUND_PRIMARY}
        filter="url(#filter0_d_538_972)"
      />
    </Svg>
  );
};

export default function SvgTabBar({
  state,
  descriptors,
  navigation,
  tabs,
}: SvgTabBarProps) {
  const insets = useSafeAreaInsets();

  const getIconComponent = (iconName: string, color: string, size: number) => {
    switch (iconName) {
      case "home":
        return <Feather name="home" size={size} color={color} />;
      case "staro":
        return <AntDesign name="staro" size={size} color={color} />;
      case "person-circle":
        return <Ionicons name="person-circle" size={size} color={color} />;
      default:
        return <Feather name="home" size={size} color={color} />;
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabBarContainer}>
        {/* SVG 탭바 배경 */}
        <TabBarBackground />

        {/* 아이콘들을 SVG 위에 배치 */}
        <View style={styles.iconsContainer}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const tab = tabs[index];

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            // 중앙 탭(두 번째)은 SVG의 돌출된 부분에 배치
            const isCenterTab = index === 1;
            const iconStyle = isCenterTab
              ? styles.centerIconContainer
              : styles.sideIconContainer;

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={[styles.tabItem, isCenterTab && styles.centerTabItem]}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, iconStyle]}>
                  {getIconComponent(
                    tab.icon,
                    isFocused ? colors.BLUE_NORMAL : colors.GRAY_NORMAL,
                    28
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.BACKGROUND_PRIMARY,
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  tabBarContainer: {
    position: "relative",
    height: 150,
    marginBottom: 0,
  },
  // 탭 바 세부 위치
  tabBarBackground: {
    position: "absolute",
    top: -20,
    left: -38,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "120%",
    alignSelf: "center",
  },
  iconsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-around",
    paddingHorizontal: 0,
    paddingTop: 10, // SVG의 돌출된 부분에 아이콘 배치
  },
  tabItem: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  centerIconContainer: {
    marginTop: -60, // SVG의 돌출된 부분에 맞춰 조정
  },
  sideIconContainer: {
    marginTop: 10, // 양쪽 아이콘은 SVG의 하단 부분에 배치
  },
  centerTabItem: {
    zIndex: 2, // 중앙 탭이 위에 오도록
  },
});
