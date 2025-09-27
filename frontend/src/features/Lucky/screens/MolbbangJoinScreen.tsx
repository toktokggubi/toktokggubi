import React, { useCallback, useState } from "react";
import { router } from "expo-router";
import { molbbangApi } from "@/features/Lucky/api/molbbangService";
import JoinRoomTemplate from "@/features/Lucky/templates/Molbbang/JoinRoomTemplate";
import MolbbangAlert from "@/shared/ui/MolbbangAlert";

export default function MolbbangJoinScreen() {
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("참가자");

  // Alert 상태 관리
  const [alert, setAlert] = useState<{
    visible: boolean;
    title?: string;
    message: string;
    type?: "default" | "success" | "error" | "warning";
  }>({
    visible: false,
    message: "",
  });

  const handleJoin = useCallback(async () => {
    if (code.trim().length < 4) {
      setAlert({
        visible: true,
        title: "입력 오류",
        message: "코드를 정확히 입력해줘!",
        type: "warning",
      });
      return;
    }
    const upper = code.trim().toUpperCase();

    const res = await molbbangApi.joinRoom({ code: upper, nickname });
    if (!res.ok) {
      setAlert({
        visible: true,
        title: "입장 실패",
        message: "방 코드를 확인해주세요.",
        type: "error",
      });
      return;
    }

    const lobbyParams = { code: upper, nick: nickname };

    router.replace({
      pathname: "/molbbang/room/[code]",
      params: lobbyParams,
    });
  }, [code, nickname]);

  return (
    <>
      <JoinRoomTemplate
        nickname={nickname}
        code={code}
        onChangeNickname={setNickname}
        onChangeCode={setCode}
        onSubmit={handleJoin}
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
