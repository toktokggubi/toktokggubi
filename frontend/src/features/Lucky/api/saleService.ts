import { z } from "zod";
import { CATEGORY_VALUES, type Category } from "@/shared/constants/categories";
import {
  MonthParams,
  MonthResult,
  saleEventSchema,
  Merchant,
} from "@/features/Lucky/model/types";

// 기간별 API 타입 정의
interface PeriodParams {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  franchiseId?: number;
}

interface PeriodResult {
  events: ReturnType<typeof transformSaleEventResponse>[];
  merchants: Merchant[];
}
import { http } from "@/shared/api/http";

// 백엔드 API 응답 스키마
const franchiseSchema = z.object({
  franchiseId: z.number(),
  merchantName: z.string(),
  imageUrl: z.string().nullable(),
});

const saleEventResponseSchema = z.object({
  saleEventId: z.number(),
  franchise: franchiseSchema,
  title: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  description: z.string(),
});

const monthResultSchema = z.object({
  events: z.array(saleEventSchema),
  merchants: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      category: z.enum(CATEGORY_VALUES),
    })
  ),
});

// 백엔드 API 응답을 내부 타입으로 변환하는 함수
function transformSaleEventResponse(
  response: z.infer<typeof saleEventResponseSchema>
) {
  return {
    id: response.saleEventId.toString(),
    merchantId: response.franchise.franchiseId.toString(),
    category: "cafe_snack" as Category, // 기본값, 실제로는 franchise 정보에서 매핑 필요
    title: response.title,
    startDate: response.startsAt.split("T")[0], // "2025-10-05T00:00:00" -> "2025-10-05"
    endDate: response.endsAt.split("T")[0], // "2025-10-19T23:59:59" -> "2025-10-19"
    note: response.description,
  };
}

// 월별 세일 이벤트 조회 API
export async function fetchSalesByMonth(
  params: MonthParams
): Promise<MonthResult> {
  const { year, month, category } = params;

  try {
    const response = await http.get("/sale-events/month", {
      params: {
        year,
        month,
        // franchiseId는 선택사항이므로 일단 제외
      },
    });

    const responseData = z.array(saleEventResponseSchema).parse(response.data);

    // 응답 데이터를 내부 타입으로 변환
    const events = responseData.map(transformSaleEventResponse);

    // merchants는 franchise 정보에서 추출
    const merchants: Merchant[] = responseData.map((item) => ({
      id: item.franchise.franchiseId.toString(),
      name: item.franchise.merchantName,
      category: "cafe_snack" as Category, // 기본값, 실제로는 franchise 정보에서 매핑 필요
    }));

    const result = monthResultSchema.parse({ events, merchants });
    return result;
  } catch (error) {
    throw error;
  }
}

// 기간별 세일 이벤트 조회 API
export async function fetchSalesByPeriod(
  params: PeriodParams
): Promise<PeriodResult> {
  const { startDate, endDate, franchiseId } = params;

  const response = await http.get("/sale-events/period", {
    params: {
      startDate,
      endDate,
      ...(franchiseId && { franchiseId }),
    },
  });

  const responseData = z.array(saleEventResponseSchema).parse(response.data);

  // 응답 데이터를 내부 타입으로 변환
  const events = responseData.map(transformSaleEventResponse);

  // merchants는 franchise 정보에서 추출
  const merchants: Merchant[] = responseData.map((item) => ({
    id: item.franchise.franchiseId.toString(),
    name: item.franchise.merchantName,
    category: "cafe_snack" as Category, // 기본값, 실제로는 franchise 정보에서 매핑 필요
  }));

  return { events, merchants };
}
