import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

export interface TabItem {
  name: string;
  icon: string;
  label: string;
}

export interface SvgTabBarProps extends BottomTabBarProps {
  tabs: TabItem[];
}

