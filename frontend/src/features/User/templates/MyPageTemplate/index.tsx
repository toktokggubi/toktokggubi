import MenuTile from "@/features/User/ui/MenuTile";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { MyPageTemplateProps } from "./types";

export default function MyPageTemplate({
  userInfo,
  onPressCard,
  onPressGifticon,
  onPressLogout,
  onPressSettings,
  onPressProfileEdit,
  cardImage,
  gifticonImage,
  isLoggingOut = false,
}: MyPageTemplateProps) {
  const formatCurrency = (amount: number) => {
    // API에서 받아온 데이터를 그대로 표시 (이미 원 단위)
    return amount.toLocaleString("ko-KR");
  };

  return (
    <View style={s.page}>
      {/* 사용자 정보 섹션 */}
      {userInfo && (
        <View style={s.userInfoSection}>
          <View style={s.userHeader}>
            <Text style={s.nickname}>{userInfo.nickname} 님</Text>
            <TouchableOpacity onPress={onPressProfileEdit}>
              <Text style={s.settings}>계정설정</Text>
            </TouchableOpacity>
          </View>

          <View style={s.infoCard}>
            <View style={s.infoItem}>
              <Text style={s.label}>월 소득</Text>
              <Text style={s.value}>
                {userInfo.monthlyIncome > 0
                  ? `${formatCurrency(userInfo.monthlyIncome)} 원`
                  : "미입력"}
              </Text>
            </View>
            <View style={s.divider} />
            <View style={s.infoItem}>
              <Text style={s.label}>직업</Text>
              <Text style={s.value}>{userInfo.jobTitle}</Text>
            </View>
          </View>
        </View>
      )}

      <View style={s.grid}>
        <MenuTile label="내 카드" image={cardImage} onPress={onPressCard} />
        <MenuTile
          label="내 기프티콘"
          image={gifticonImage}
          onPress={onPressGifticon}
        />
      </View>

      {/* 설정 및 로그아웃 메뉴 */}
      <View style={s.menuCard}>
        <TouchableOpacity style={s.menuItem} onPress={onPressSettings}>
          <View style={s.menuItemLeft}>
            <Feather name="settings" size={20} color="#6B7280" />
            <Text style={s.menuText}>설정</Text>
          </View>
          <Text style={s.arrowIcon}>›</Text>
        </TouchableOpacity>

        <View style={s.menuDivider} />

        <TouchableOpacity
          style={s.menuItem}
          onPress={onPressLogout}
          disabled={isLoggingOut}
        >
          <View style={s.menuItemLeft}>
            <MaterialCommunityIcons name="logout" size={20} color="#6B7280" />
            <Text style={s.menuText}>로그아웃</Text>
          </View>
          <Text style={s.arrowIcon}>›</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.BACKGROUND_PRIMARY },
  userInfoSection: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  nickname: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    ...font.bold,
  },
  settings: {
    fontSize: 14,
    color: "#6B7280",
    ...font.regular,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 0,
    paddingHorizontal: 20,
    flexDirection: "row",
    shadowColor: colors.BLUE_LIGHT_ACTIVE,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  infoItem: {
    flex: 1,
    paddingVertical: 6,
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: colors.BLUE_LIGHT_HOVER,
    marginHorizontal: 20,
    alignSelf: "center",
  },
  label: {
    fontSize: 14,
    color: colors.BLUE_NORMAL,
    marginBottom: -15,
    ...font.medium,
  },
  value: {
    fontSize: 18,
    color: colors.BLUE_DARKER,
    ...font.medium,
  },
  grid: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: colors.BLUE_LIGHT_ACTIVE,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
    marginLeft: 12,
    ...font.medium,
  },
  arrowIcon: {
    fontSize: 30,
    color: colors.GRAY_LIGHT_ACTIVE,
  },
  menuDivider: {
    width: "90%",
    height: 1,
    backgroundColor: colors.BLUE_LIGHT,
    alignSelf: "center",
  },
});
