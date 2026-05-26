"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentStatusForSelection } from "@/lib/selection";

const productSchema = z.object({
  sourceUrl: z.string().trim().url("URL 형식이 올바르지 않습니다.").or(z.literal("")).optional(),
  sourcePlatform: z.string().trim().max(80).optional(),
  originalName: z.string().trim().min(1, "원본 상품명은 필수입니다."),
  translatedName: z.string().trim().max(160).optional(),
  sourceCost: z.coerce.number().nonnegative().optional().or(z.literal("")),
  imageUrl: z.string().trim().url("이미지 URL 형식이 올바르지 않습니다.").or(z.literal("")).optional(),
  sourcingMemo: z.string().trim().max(1000).optional()
});

const selectionSchema = z.object({
  productId: z.coerce.number().int().positive(),
  selectionStatus: z.enum(["proceed", "hold", "exclude"]),
  demandSignal: z.enum(["high", "medium", "low", "uncertain"]),
  competitionLevel: z.enum(["low", "medium", "high"]),
  priceAttractiveness: z.enum(["good", "uncertain", "poor"]),
  sourcingDifficulty: z.enum(["easy", "medium", "hard"]),
  selectionScore: z.coerce.number().int().min(0).max(100),
  reasonCodes: z.array(z.string()).default([]),
  reviewerNote: z.string().trim().max(1000).optional()
});

export type ActionState = {
  ok: boolean;
  message: string;
};

export async function createProduct(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = productSchema.safeParse({
    sourceUrl: formData.get("sourceUrl"),
    sourcePlatform: formData.get("sourcePlatform"),
    originalName: formData.get("originalName"),
    translatedName: formData.get("translatedName"),
    sourceCost: formData.get("sourceCost") || undefined,
    imageUrl: formData.get("imageUrl"),
    sourcingMemo: formData.get("sourcingMemo")
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }

  const data = parsed.data;

  await prisma.product.create({
    data: {
      sourceUrl: data.sourceUrl || null,
      sourcePlatform: data.sourcePlatform || null,
      originalName: data.originalName,
      translatedName: data.translatedName || null,
      sourceCost: typeof data.sourceCost === "number" ? data.sourceCost : null,
      imageUrl: data.imageUrl || null,
      sourcingMemo: data.sourcingMemo || null
    }
  });

  revalidatePath("/");
  return { ok: true, message: "상품 후보를 등록했습니다." };
}

export async function createSelectionReview(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = selectionSchema.safeParse({
    productId: formData.get("productId"),
    selectionStatus: formData.get("selectionStatus"),
    demandSignal: formData.get("demandSignal"),
    competitionLevel: formData.get("competitionLevel"),
    priceAttractiveness: formData.get("priceAttractiveness"),
    sourcingDifficulty: formData.get("sourcingDifficulty"),
    selectionScore: formData.get("selectionScore"),
    reasonCodes: formData.getAll("reasonCodes"),
    reviewerNote: formData.get("reviewerNote")
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "선정 값을 확인해주세요." };
  }

  const data = parsed.data;

  if (data.selectionStatus === "exclude" && data.reasonCodes.length === 0) {
    return { ok: false, message: "제외 상품은 최소 1개 이상의 제외 사유가 필요합니다." };
  }

  if (
    data.selectionStatus === "hold" &&
    data.reasonCodes.length === 0 &&
    !data.reviewerNote
  ) {
    return { ok: false, message: "보류 상품은 사유 코드 또는 메모가 필요합니다." };
  }

  await prisma.$transaction([
    prisma.selectionReview.create({
      data: {
        productId: data.productId,
        selectionStatus: data.selectionStatus,
        demandSignal: data.demandSignal,
        competitionLevel: data.competitionLevel,
        priceAttractiveness: data.priceAttractiveness,
        sourcingDifficulty: data.sourcingDifficulty,
        selectionScore: data.selectionScore,
        reasonCodesJson: JSON.stringify(data.reasonCodes),
        reviewerNote: data.reviewerNote || null
      }
    }),
    prisma.product.update({
      where: { id: data.productId },
      data: { currentStatus: currentStatusForSelection(data.selectionStatus) }
    })
  ]);

  revalidatePath("/");
  return { ok: true, message: "상품 선정 리뷰를 저장했습니다." };
}
