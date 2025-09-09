import type { ImageSourcePropType } from "react-native";

export interface MenuTileProps {
  label: string;
  image: ImageSourcePropType; // require(...) 또는 { uri }
  onPress?: () => void;
  disabled?: boolean;
}
