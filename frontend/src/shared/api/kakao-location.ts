import { z } from "zod";
import type { KakaoPlace } from "@/shared/types/location.types";

const KakaoPlaceZ = z.object({
  documents: z.array(
    z.object({
      place_name: z.string(),
      address_name: z.string(),
      road_address_name: z.string().nullable().optional(),
      x: z.string(),
      y: z.string(),
    })
  ),
});

export async function fetchNearbyPlaces(
  lng: number,
  lat: number,
  query: string,
  apiKey: string
): Promise<KakaoPlace[]> {
  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
      query
    )}&x=${lng}&y=${lat}&radius=1500`,
    { headers: { Authorization: `KakaoAK ${apiKey}` } }
  );
  if (!res.ok) throw new Error("kakao keyword search failed");
  const json = await res.json();
  return KakaoPlaceZ.parse(json).documents;
}
