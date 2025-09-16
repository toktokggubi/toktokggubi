import { z } from "zod";

export const GifticonPreviewSchema = z.object({
  merchant: z.string().nullable().optional(),
  label: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(), // "YYYY-MM-DD"
});
export type GifticonPreview = z.infer<typeof GifticonPreviewSchema>;

export const GifticonCreateResponseSchema = z.object({
  message: z.string(),
  gifticon: z.object({
    gifticonId: z.number(),
    label: z.string(),
    merchant: z.object({ merchantId: z.number(), merchantName: z.string() }),
    category: z.object({ categoryId: z.number(), categoryName: z.string() }),
    imageUrl: z.string().url(),
    expiresAt: z.string(),
    status: z.string(),
    createdAt: z.string(),
  }),
});
export type GifticonCreateResponse = z.infer<
  typeof GifticonCreateResponseSchema
>;
