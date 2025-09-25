export const MOLBBANG_ENDPOINTS = {
  // 방 생성
  createRoom: "/molbbang",
  // 방 참가
  joinRoom: "/molbbang/join",
  // 내 방 정보 조회
  myRoom: "/molbbang/me",
  // 준비 상태 변경
  setReady: "/molbbang/me/ready",
  // 방 나가기
  leaveRoom: "/molbbang/me/leave",
  // 게임 시작
  startGame: "/molbbang/me/start",
  // 점수 제출
  submitScore: "/molbbang/me/score",
  // 라운드 종료
  endRound: "/molbbang/me/endRound",
  // 최종 결과 조회
  getResults: "/molbbang/me/results",
} as const;
