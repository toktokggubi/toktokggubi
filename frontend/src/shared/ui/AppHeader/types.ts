// src/shared/ui/AppHeader/types.ts
export interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  onBackPress?: () => void;

  // 오른쪽 메뉴 (CardActionMenu 같은거)
  onSelectImport?: () => void;
  onSelectDelete?: () => void;

  // 색상 오버라이드
  backgroundColor?: string;
  tintColor?: string;
}
