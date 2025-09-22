import axios from "axios";

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE || "http://localhost:3001/api";
// Android 에뮬레이터면 .env에서 10.0.2.2로 설정해줘.

export const http = axios.create({
  baseURL: API_BASE,
  timeout: 7000,
});
