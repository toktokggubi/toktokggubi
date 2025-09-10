export interface CardActionMenuBaseProps {
  onSelectImport: () => void;
  onSelectDelete: () => void;
  color?: string;
  top?: number; // 메뉴 Y 위치 보정
  right?: number; // 메뉴 X 위치 보정
}

export interface CardActionMenuControlledProps extends CardActionMenuBaseProps {
  open: boolean;
  onClose: () => void;
}

export type CardActionMenuProps = CardActionMenuBaseProps;
export type MenuViewProps = Omit<CardActionMenuControlledProps, "open">;
