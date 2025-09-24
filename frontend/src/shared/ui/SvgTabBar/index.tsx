import Tabs2Png from "@/assets/icon/Tabs2.png";
import { colors } from "@/shared/constants/colors";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  ImageSourcePropType,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgTabBarProps } from "./types";

const { width } = Dimensions.get("window");
const TAB_WIDTH = width / 5;

/** 🔧 그림자 튜닝 포인트 */
const SHADOW = {
  color: "#000000",
  opacity: 0.18,
  radius: 14,
  offsetX: 0,
  offsetY: -3,
  elevation: 10,
};

interface TabBarBackgroundProps {
  source?: ImageSourcePropType;
  top?: number;
}

/** PNG 탭바 배경 (그림자는 View 래퍼에 적용) */
function TabBarBackground({
  source = Tabs2Png,
  top = -60,
}: TabBarBackgroundProps) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.tabBarBgWrap,
        {
          top,
          // iOS shadow
          shadowColor: SHADOW.color,
          shadowOpacity: SHADOW.opacity,
          shadowRadius: SHADOW.radius,
          shadowOffset: { width: SHADOW.offsetX, height: SHADOW.offsetY },
          // Android shadow
          ...(Platform.OS === "android"
            ? { elevation: SHADOW.elevation }
            : null),
        },
      ]}
    >
      <Image
        source={source}
        resizeMode="stretch"
        style={styles.tabBarBackgroundImage}
      />
    </View>
  );
}

export default function SvgTabBar({
  state,
  descriptors,
  navigation,
  tabs,
}: SvgTabBarProps) {
  const insets = useSafeAreaInsets();

  const getIconComponent = (
    iconName: string,
    color: string,
    size: number,
    isFocused: boolean
  ) => {
    switch (iconName) {
      case "home":
        return <Ionicons name="home" size={size} color={color} />;
      case "ai-report":
        return <Ionicons name="analytics" size={size} color={color} />;
      case "payment-barcode":
        return (
          <View style={styles.paymentIconContainer}>
            <View
              style={[
                styles.paymentIconInner,
                { backgroundColor: colors.BLUE_NORMAL },
              ]}
            >
              <View style={styles.paymentIconBackground}>
                <Ionicons name="qr-code" size={36} color={color} />
              </View>
            </View>
          </View>
        );
      case "staro":
        return <AntDesign name="staro" size={size} color={color} />;
      case "person-circle":
        return <Ionicons name="person-circle" size={size} color={color} />;
      default:
        return <Ionicons name="home" size={size} color={color} />;
    }
  };

  return (
    <View style={styles.outerContainer}>
      {/* ✅ PNG 탭바 배경 (그림자 조절은 SHADOW 상수에서) */}
      <TabBarBackground />

      {/* 컨테이너 - 배경 이미지 위에 위치 */}
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.tabBarContainer}>
          {/* 아이콘들을 PNG 위에 배치 */}
          <View style={styles.iconsContainer}>
            {state.routes.map((route, index) => {
              const isFocused = state.index === index;

              const onPress = () => {
                // 중간 버튼(payment)인 경우 다른 동작
                if (index === 2) {
                  // router로 직접 결제 화면 열기 (탭 없이)
                  router.push({
                    pathname: "/pay/payment",
                    params: { source: "tab" },
                  });
                  return;
                }
                
                // 일반 탭 네비게이션
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const isCenterTab = index === 2;
              const iconStyle = isCenterTab
                ? styles.centerIconContainer
                : styles.sideIconContainer;

              let iconName:
                | "home"
                | "ai-report"
                | "payment-barcode"
                | "staro"
                | "person-circle" = "home";
              switch (index) {
                case 0:
                  iconName = "home";
                  break;
                case 1:
                  iconName = "ai-report";
                  break;
                case 2:
                  iconName = "payment-barcode";
                  break;
                case 3:
                  iconName = "staro";
                  break;
                case 4:
                  iconName = "person-circle";
                  break;
              }

              return (
                <TouchableOpacity
                  key={route.key}
                  onPress={onPress}
                  style={[styles.tabItem, isCenterTab && styles.centerTabItem]}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconContainer, iconStyle]}>
                    {getIconComponent(
                      iconName,
                      isFocused ? colors.BLUE_NORMAL : colors.GRAY_NORMAL,
                      24,
                      isFocused
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: "relative",
    height: 130,
    backgroundColor: "transparent",
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  container: {
    backgroundColor: "#fff",
    paddingHorizontal: 0,
    paddingTop: 0,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  tabBarContainer: {
    position: "relative",
    height: 25,
    marginBottom: 0,
    backgroundColor: "transparent",
  },

  /** 🔽 배경/그림자 래퍼 (그림자는 여기에만 적용) */
  tabBarBgWrap: {
    position: "absolute",
    left: -41,
    right: 0,
    bottom: 0,
    width: "120%",
    height: "100%",
    zIndex: 1,
  },
  /** 🔽 실제 PNG 이미지 */
  tabBarBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  iconsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 0,
    paddingTop: 0,
    backgroundColor: "transparent",
  },
  tabItem: {
    width: TAB_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    backgroundColor: "transparent",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    backgroundColor: "transparent",
  },
  centerIconContainer: {
    marginTop: 0,
  },
  sideIconContainer: {
    marginTop: 0,
  },
  centerTabItem: {
    zIndex: 2,
    backgroundColor: "transparent",
  },
  paymentIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  paymentIconInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    marginTop: -30,
  },
  paymentIconBackground: {
    width: 40,
    height: 40,
    backgroundColor: "white",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
});
