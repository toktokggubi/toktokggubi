// src/features/Lucky/screens/MolbbangCreateScreen.tsx
import React, { useCallback, useState, useEffect } from "react";
import { router } from "expo-router";
import { molbbangApi } from "@/features/Lucky/api/molbbangService";
import CreateRoomTemplate from "@/features/Lucky/templates/Molbbang/CreateRoomTemplate";
import MolbbangAlert from "@/shared/ui/MolbbangAlert";
import { useProfileQuery } from "@/features/Auth/model/useAuthQueries";

export default function MolbbangCreateScreen() {
  const [amount, setAmount] = useState<string>("");
  const [nickname, setNickname] = useState<string>("호스트");
  const [loading, setLoading] = useState<boolean>(false);

  // 사용자 프로필 정보 가져오기
  const { data: profileData } = useProfileQuery();

  // 사용자 닉네임이 로드되면 기본값으로 설정
  useEffect(() => {
    if (profileData?.nickname) {
      setNickname(profileData.nickname);
    }
  }, [profileData?.nickname]);

  const [alert, setAlert] = useState<{
    visible: boolean;
    title?: string;
    message: string;
    type?: "default" | "success" | "error" | "warning";
  }>({
    visible: false,
    message: "",
  });

  const handleCreate = useCallback(async () => {
    if (loading) return;

    const money = Number(amount);
    if (!money || money < 100) {
      setAlert({
        visible: true,
        title: "금액 오류",
        message: "금액은 100원 이상 입력해줘!",
        type: "warning",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await molbbangApi.createRoom({ amount: money, nickname });
      // 방 코드로 라우팅
      const lobbyParams = {
        code: res.code,
        amount: String(money),
        nick: nickname,
        host: "1",
      };

      router.replace({
        pathname: "/molbbang/room/[code]",
        params: lobbyParams,
      });
    } catch (err: any) {
      setAlert({
        visible: true,
        title: "방 생성 실패",
        message:
          "서버에 연결할 수 없었어요. 목 서버가 켜져 있는지, 주소가 맞는지 확인해줘.\n\n개발용 예시\n- iOS: http://localhost:3001/api\n- Android 에뮬레이터: http://10.0.2.2:3001/api",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [amount, nickname, loading]);

  return (
    <>
      <CreateRoomTemplate
        nickname={nickname}
        amount={amount}
        onChangeNickname={setNickname}
        onChangeAmount={setAmount}
        onSubmit={handleCreate}
        // (선택) 로딩 상태를 버튼에 반영하고 싶으면 props에 내려서 disabled 처리
      />

      <MolbbangAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={() => setAlert({ ...alert, visible: false })}
      />
    </>
  );
}
