// src/features/Lucky/screens/MolbbangCreateScreen.tsx
import React, { useCallback, useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { molbbangApi } from "@/features/Lucky/api/molbbangService";
import CreateRoomTemplate from "@/features/Lucky/templates/Molbbang/CreateRoomTemplate";

export default function MolbbangCreateScreen() {
  const [amount, setAmount] = useState<string>("");
  const [nickname, setNickname] = useState<string>("호스트");
  const [loading, setLoading] = useState<boolean>(false);

  const handleCreate = useCallback(async () => {
    if (loading) return;

    const money = Number(amount);
    if (!money || money < 100) {
      Alert.alert("금액은 100원 이상 입력해줘!");
      return;
    }

    try {
      setLoading(true);
      const res = await molbbangApi.createRoom({ amount: money, nickname });
      // 방 코드로 라우팅
      router.replace({
        pathname: "/molbbang/room/[code]",
        params: {
          code: res.code,
          amount: String(money),
          nick: nickname,
          host: "1",
        },
      });
    } catch (err: any) {
      console.error("createRoom error:", err);
      Alert.alert(
        "방 생성 실패",
        "서버에 연결할 수 없었어요. 목 서버가 켜져 있는지, 주소가 맞는지 확인해줘.\n\n" +
          "개발용 예시\n- iOS: http://localhost:3001/api\n- Android 에뮬레이터: http://10.0.2.2:3001/api"
      );
    } finally {
      setLoading(false);
    }
  }, [amount, nickname, loading]);

  return (
    <CreateRoomTemplate
      nickname={nickname}
      amount={amount}
      onChangeNickname={setNickname}
      onChangeAmount={setAmount}
      onSubmit={handleCreate}
      // (선택) 로딩 상태를 버튼에 반영하고 싶으면 props에 내려서 disabled 처리
    />
  );
}
