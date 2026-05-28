"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentStatusForSelection } from "@/lib/selection";

const optionalNumber = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().nonnegative().optional()
);

const sourcingSessionSchema = z.object({
  title: z.string().trim().min(1, "세션 제목은 필수입니다."),
  targetCategory: z.string().trim().max(120).optional(),
  domesticKeyword: z.string().trim().min(1, "국내 검색 키워드는 필수입니다."),
  relatedKeywords: z.string().trim().max(500).optional(),
  sourcePlatforms: z.string().trim().max(300).optional(),
  sourcingStrategy: z.string().trim().max(1000).optional(),
  demandSignal: z.enum(["unknown", "weak", "normal", "strong"]),
  competitionLevel: z.enum(["unknown", "low", "normal", "high"]),
  targetCandidateCount: optionalNumber,
  memo: z.string().trim().max(1000).optional()
});

const productSchema = z.object({
  sourcingSessionId: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().int().positive().optional()
  ),
  sourceUrl: z.string().trim().url("URL 형식이 올바르지 않습니다.").or(z.literal("")).optional(),
  sourcePlatform: z.string().trim().max(80).optional(),
  originalName: z.string().trim().min(1, "원본 상품명은 필수입니다."),
  translatedName: z.string().trim().max(160).optional(),
  sourceCost: optionalNumber,
  sourceShippingFee: optionalNumber,
  imageUrl: z.string().trim().url("이미지 URL 형식이 올바르지 않습니다.").or(z.literal("")).optional(),
  optionsMemo: z.string().trim().max(1000).optional(),
  estimatedWeight: z.string().trim().max(80).optional(),
  estimatedVolume: z.string().trim().max(80).optional(),
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
  riskCodes: z.array(z.string()).default([]),
  sourcePrice: optionalNumber,
  sourceShippingFee: optionalNumber,
  exchangeRate: optionalNumber,
  exchangeRateBufferPercent: optionalNumber,
  paymentFeePercent: optionalNumber,
  estimatedInternationalShippingFee: optionalNumber,
  domesticShippingFee: optionalNumber,
  marketplaceFeePercent: optionalNumber,
  returnLossRiskBuffer: optionalNumber,
  targetMarginPercent: optionalNumber,
  expectedSellingPrice: optionalNumber,
  priceCompetitivenessMemo: z.string().trim().max(1000).optional(),
  reviewerNote: z.string().trim().max(1000).optional()
});

export type ActionState = {
  ok: boolean;
  message: string;
};

export async function createSourcingSession(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = sourcingSessionSchema.safeParse({
    title: formData.get("title"),
    targetCategory: formData.get("targetCategory"),
    domesticKeyword: formData.get("domesticKeyword"),
    relatedKeywords: formData.get("relatedKeywords"),
    sourcePlatforms: formData.get("sourcePlatforms"),
    sourcingStrategy: formData.get("sourcingStrategy"),
    demandSignal: formData.get("demandSignal"),
    competitionLevel: formData.get("competitionLevel"),
    targetCandidateCount: formData.get("targetCandidateCount"),
    memo: formData.get("memo")
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "소싱 세션 값을 확인해주세요." };
  }

  const data = parsed.data;

  await prisma.sourcingSession.create({
    data: {
      title: data.title,
      targetCategory: data.targetCategory || null,
      domesticKeyword: data.domesticKeyword,
      relatedKeywords: data.relatedKeywords || null,
      sourcePlatforms: data.sourcePlatforms || null,
      sourcingStrategy: data.sourcingStrategy || null,
      demandSignal: data.demandSignal,
      competitionLevel: data.competitionLevel,
      targetCandidateCount:
        typeof data.targetCandidateCount === "number" ? data.targetCandidateCount : null,
      memo: data.memo || null
    }
  });

  revalidatePath("/");
  return { ok: true, message: "소싱 세션을 만들었습니다." };
}

export async function createProduct(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = productSchema.safeParse({
    sourcingSessionId: formData.get("sourcingSessionId"),
    sourceUrl: formData.get("sourceUrl"),
    sourcePlatform: formData.get("sourcePlatform"),
    originalName: formData.get("originalName"),
    translatedName: formData.get("translatedName"),
    sourceCost: formData.get("sourceCost"),
    sourceShippingFee: formData.get("sourceShippingFee"),
    imageUrl: formData.get("imageUrl"),
    optionsMemo: formData.get("optionsMemo"),
    estimatedWeight: formData.get("estimatedWeight"),
    estimatedVolume: formData.get("estimatedVolume"),
    sourcingMemo: formData.get("sourcingMemo")
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }

  const data = parsed.data;

  await prisma.product.create({
    data: {
      sourcingSessionId: data.sourcingSessionId || null,
      sourceUrl: data.sourceUrl || null,
      sourcePlatform: data.sourcePlatform || null,
      originalName: data.originalName,
      translatedName: data.translatedName || null,
      sourceCost: typeof data.sourceCost === "number" ? data.sourceCost : null,
      sourceShippingFee:
        typeof data.sourceShippingFee === "number" ? data.sourceShippingFee : null,
      imageUrl: data.imageUrl || null,
      optionsMemo: data.optionsMemo || null,
      estimatedWeight: data.estimatedWeight || null,
      estimatedVolume: data.estimatedVolume || null,
      sourcingMemo: data.sourcingMemo || null
    }
  });

  revalidatePath("/");
  return { ok: true, message: "상품 후보를 등록했습니다." };
}

export async function updateProduct(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const productId = z.coerce.number().int().positive().safeParse(formData.get("productId"));

  if (!productId.success) {
    return { ok: false, message: "수정할 후보 상품을 찾을 수 없습니다." };
  }

  const parsed = productSchema.safeParse({
    sourcingSessionId: formData.get("sourcingSessionId"),
    sourceUrl: formData.get("sourceUrl"),
    sourcePlatform: formData.get("sourcePlatform"),
    originalName: formData.get("originalName"),
    translatedName: formData.get("translatedName"),
    sourceCost: formData.get("sourceCost"),
    sourceShippingFee: formData.get("sourceShippingFee"),
    imageUrl: formData.get("imageUrl"),
    optionsMemo: formData.get("optionsMemo"),
    estimatedWeight: formData.get("estimatedWeight"),
    estimatedVolume: formData.get("estimatedVolume"),
    sourcingMemo: formData.get("sourcingMemo")
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }

  const data = parsed.data;

  await prisma.product.update({
    where: { id: productId.data },
    data: {
      sourcingSessionId: data.sourcingSessionId || null,
      sourceUrl: data.sourceUrl || null,
      sourcePlatform: data.sourcePlatform || null,
      originalName: data.originalName,
      translatedName: data.translatedName || null,
      sourceCost: typeof data.sourceCost === "number" ? data.sourceCost : null,
      sourceShippingFee:
        typeof data.sourceShippingFee === "number" ? data.sourceShippingFee : null,
      imageUrl: data.imageUrl || null,
      optionsMemo: data.optionsMemo || null,
      estimatedWeight: data.estimatedWeight || null,
      estimatedVolume: data.estimatedVolume || null,
      sourcingMemo: data.sourcingMemo || null
    }
  });

  revalidatePath("/");
  return { ok: true, message: "후보 상품 정보를 수정했습니다." };
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
    riskCodes: formData.getAll("riskCodes"),
    sourcePrice: formData.get("sourcePrice"),
    sourceShippingFee: formData.get("sourceShippingFee"),
    exchangeRate: formData.get("exchangeRate"),
    exchangeRateBufferPercent: formData.get("exchangeRateBufferPercent"),
    paymentFeePercent: formData.get("paymentFeePercent"),
    estimatedInternationalShippingFee: formData.get("estimatedInternationalShippingFee"),
    domesticShippingFee: formData.get("domesticShippingFee"),
    marketplaceFeePercent: formData.get("marketplaceFeePercent"),
    returnLossRiskBuffer: formData.get("returnLossRiskBuffer"),
    targetMarginPercent: formData.get("targetMarginPercent"),
    expectedSellingPrice: formData.get("expectedSellingPrice"),
    priceCompetitivenessMemo: formData.get("priceCompetitivenessMemo"),
    reviewerNote: formData.get("reviewerNote")
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "선정 값을 확인해주세요." };
  }

  const data = parsed.data;
  const margin = calculateMargin(data);

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
        riskCodesJson: JSON.stringify(data.riskCodes),
        sourcePrice: data.sourcePrice ?? null,
        sourceShippingFee: data.sourceShippingFee ?? null,
        exchangeRate: data.exchangeRate ?? null,
        exchangeRateBufferPercent: data.exchangeRateBufferPercent ?? null,
        paymentFeePercent: data.paymentFeePercent ?? null,
        estimatedInternationalShippingFee: data.estimatedInternationalShippingFee ?? null,
        domesticShippingFee: data.domesticShippingFee ?? null,
        marketplaceFeePercent: data.marketplaceFeePercent ?? null,
        returnLossRiskBuffer: data.returnLossRiskBuffer ?? null,
        targetMarginPercent: data.targetMarginPercent ?? null,
        expectedSellingPrice: data.expectedSellingPrice ?? null,
        totalEstimatedCost: margin.totalEstimatedCost,
        breakEvenPrice: margin.breakEvenPrice,
        recommendedSellingPrice: margin.recommendedSellingPrice,
        estimatedNetProfit: margin.estimatedNetProfit,
        estimatedMarginRate: margin.estimatedMarginRate,
        priceCompetitivenessMemo: data.priceCompetitivenessMemo || null,
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

function calculateMargin(data: z.infer<typeof selectionSchema>) {
  const required = [
    data.sourcePrice,
    data.exchangeRate,
    data.exchangeRateBufferPercent,
    data.paymentFeePercent,
    data.estimatedInternationalShippingFee,
    data.domesticShippingFee,
    data.marketplaceFeePercent,
    data.returnLossRiskBuffer,
    data.targetMarginPercent
  ];

  if (required.some((value) => typeof value !== "number")) {
    return {
      totalEstimatedCost: null,
      breakEvenPrice: null,
      recommendedSellingPrice: null,
      estimatedNetProfit: null,
      estimatedMarginRate: null
    };
  }

  const sourceShippingFee = data.sourceShippingFee ?? 0;
  const bufferedExchangeRate = data.exchangeRate! * (1 + data.exchangeRateBufferPercent! / 100);
  const convertedSourceCost = (data.sourcePrice! + sourceShippingFee) * bufferedExchangeRate;
  const paymentFee = convertedSourceCost * (data.paymentFeePercent! / 100);
  const totalEstimatedCost =
    convertedSourceCost +
    paymentFee +
    data.estimatedInternationalShippingFee! +
    data.domesticShippingFee! +
    data.returnLossRiskBuffer!;
  const marketplaceFeeRate = data.marketplaceFeePercent! / 100;
  const targetMarginRate = data.targetMarginPercent! / 100;
  const breakEvenPrice = totalEstimatedCost / Math.max(0.01, 1 - marketplaceFeeRate);
  const recommendedSellingPrice = breakEvenPrice / Math.max(0.01, 1 - targetMarginRate);
  const sellingPrice = data.expectedSellingPrice ?? recommendedSellingPrice;
  const marketplaceFee = sellingPrice * marketplaceFeeRate;
  const estimatedNetProfit = sellingPrice - marketplaceFee - totalEstimatedCost;
  const estimatedMarginRate = sellingPrice > 0 ? (estimatedNetProfit / sellingPrice) * 100 : 0;

  return {
    totalEstimatedCost: roundCurrency(totalEstimatedCost),
    breakEvenPrice: roundCurrency(breakEvenPrice),
    recommendedSellingPrice: roundCurrency(recommendedSellingPrice),
    estimatedNetProfit: roundCurrency(estimatedNetProfit),
    estimatedMarginRate: Math.round(estimatedMarginRate * 10) / 10
  };
}

function roundCurrency(value: number) {
  return Math.round(value);
}
