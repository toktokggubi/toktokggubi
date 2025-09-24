import MenuTile from "@/features/User/ui/MenuTile";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import type { MyPageTemplateProps } from "./types";

export default function MyPageTemplate({
  userInfo,
  onPressCard,
  onPressGifticon,
  onPressLogout,
  onPressSettings,
  onPressProfileEdit,
  onPressBudgetSetup,
  onPressAIBudgetSetup,
  onPressFCMTest,
  cardImage,
  gifticonImage,
  isLoggingOut = false,
}: MyPageTemplateProps) {
  const formatCurrency = (amount: number) => {
    // API에서 받아온 데이터를 그대로 표시 (이미 원 단위)
    return amount.toLocaleString("ko-KR");
  };

  return (
    <ScrollView style={s.page} showsVerticalScrollIndicator={false}>
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

      {/* 개발용 임시 버튼들 */}
      <View style={s.tempButtonContainer}>
        <Text style={s.tempButtonTitle}>🧪 예산 설정 테스트</Text>
        
        <View style={s.tempButtonRow}>
          <TouchableOpacity style={[s.tempButtonSmall, s.tempButtonBlue]} onPress={onPressBudgetSetup}>
            <Text style={[s.tempButtonTextSmall, s.tempButtonTextBlue]}>
              📋 초기설정
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[s.tempButtonSmall, s.tempButtonGreen]} onPress={onPressAIBudgetSetup}>
            <Text style={[s.tempButtonTextSmall, s.tempButtonTextGreen]}>
              🤖 AI추천
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[s.tempButtonTitle, { marginTop: 16 }]}>🔔 FCM 토큰 테스트</Text>
        
        <TouchableOpacity style={[s.tempButtonSmall, s.tempButtonPurple]} onPress={onPressFCMTest}>
          <Text style={[s.tempButtonTextSmall, s.tempButtonTextPurple]}>
            📱 FCM 토큰 확인
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  tempButtonContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  tempButtonTitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
    ...font.bold,
  },
  tempButtonRow: {
    flexDirection: "row",
    gap: 8,
  },
  tempButtonSmall: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  tempButtonBlue: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3B82F6",
  },
  tempButtonGreen: {
    backgroundColor: "#F0FDF4",
    borderColor: "#10B981",
  },
  tempButtonPurple: {
    backgroundColor: "#FAF5FF",
    borderColor: "#8B5CF6",
  },
  tempButtonTextSmall: {
    fontSize: 12,
    fontWeight: "500",
    ...font.medium,
  },
  tempButtonTextBlue: {
    color: "#1E40AF",
  },
  tempButtonTextGreen: {
    color: "#047857",
  },
  tempButtonTextPurple: {
    color: "#6B21A8",
  },
});
