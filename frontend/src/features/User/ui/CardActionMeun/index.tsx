import React, { memo, useState, useCallback } from "react";
import { Modal, Pressable, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type {
  CardActionMenuProps,
  CardActionMenuControlledProps,
  MenuViewProps,
} from "./types";

const TXT = "#0f172a";

function MenuView({
  onSelectImport,
  onSelectDelete,
  onClose,
  top = 56,
  right = 12,
}: MenuViewProps) {
  return (
    <Pressable style={styles.backdrop} onPress={onClose}>
      <Pressable style={[styles.menu, { top, right }]} onPress={() => {}}>
        <Pressable
          style={styles.item}
          onPress={() => {
            onClose();
            onSelectImport();
          }}
        >
          <Text style={styles.text}>카드 불러오기</Text>
        </Pressable>
        <View style={styles.divider} />
        <Pressable
          style={styles.item}
          onPress={() => {
            onClose();
            onSelectDelete();
          }}
        >
          <Text style={styles.text}>카드 삭제하기</Text>
        </Pressable>
      </Pressable>
    </Pressable>
  );
}

/** A. 부모가 open/close 제어하는 버전 */
export const CardActionMenuControlled = memo(function CardActionMenuControlled({
  open,
  onClose,
  ...rest
}: CardActionMenuControlledProps) {
  return (
    <Modal
      transparent
      visible={open}
      animationType="fade"
      onRequestClose={onClose}
    >
      <MenuView onClose={onClose} {...rest} />
    </Modal>
  );
});

/** B. 자체 +버튼을 포함한 버전(헤더에 꽂기 좋음) */
export const CardActionMenu = memo(function CardActionMenu({
  color = "#246BFD",
  top,
  right,
  onSelectImport,
  onSelectDelete,
}: CardActionMenuProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const openMenu = useCallback(() => setOpen(true), []);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={openMenu}
        style={{ paddingHorizontal: 0, paddingVertical: 6 }}
        hitSlop={8}
      >
        <Ionicons name="ellipsis-vertical" size={24} color={color} />
      </Pressable>

      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={close}
      >
        <MenuView
          onClose={close}
          onSelectImport={onSelectImport}
          onSelectDelete={onSelectDelete}
          top={top}
          right={right}
          color={color}
        />
      </Modal>
    </>
  );
});

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.08)" },
  menu: {
    position: "absolute",
    minWidth: 168,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    paddingVertical: 6,
  },
  item: { paddingHorizontal: 14, paddingVertical: 12 },
  text: { color: TXT, fontSize: 14, fontWeight: "500" },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E7EBF2",
    marginHorizontal: 6,
  },
});
