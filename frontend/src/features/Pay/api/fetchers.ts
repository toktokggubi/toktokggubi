import { http } from "@/shared/api/http";
import { PAY_ENDPOINTS } from "./endpoints";

// 위치 정보를 서버로 전송하는 API
export async function pushLocation(categoryId: number) {
  const { data } = await http.post(PAY_ENDPOINTS.pushLocation, null, {
    params: { categoryId }
  });
  return data;
}
