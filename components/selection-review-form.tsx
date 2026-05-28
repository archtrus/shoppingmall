"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createSelectionReview, type ActionState } from "@/app/actions";
import {
  competitionLevels,
  demandSignals,
  priceAttractiveness,
  riskChecklistCodes,
  selectionReasonCodes,
  selectionStatuses,
  sourcingDifficulties
} from "@/lib/selection";

const initialState: ActionState = {
  ok: false,
  message: ""
};

export type SelectionReviewDefaults = {
  selectionStatus?: string | null;
  demandSignal?: string | null;
  competitionLevel?: string | null;
  priceAttractiveness?: string | null;
  sourcingDifficulty?: string | null;
  selectionScore?: number | null;
  reasonCodesJson?: string | null;
  riskCodesJson?: string | null;
  sourcePrice?: unknown;
  sourceShippingFee?: unknown;
  exchangeRate?: unknown;
  exchangeRateBufferPercent?: unknown;
  paymentFeePercent?: unknown;
  estimatedInternationalShippingFee?: unknown;
  domesticShippingFee?: unknown;
  marketplaceFeePercent?: unknown;
  returnLossRiskBuffer?: unknown;
  targetMarginPercent?: unknown;
  expectedSellingPrice?: unknown;
  priceCompetitivenessMemo?: string | null;
  reviewerNote?: string | null;
};

type MarginPreview = {
  ready: boolean;
  breakEvenPrice?: number;
  recommendedSellingPrice?: number;
  estimatedNetProfit?: number;
  estimatedMarginRate?: number;
};

export function SelectionReviewForm({
  productId,
  defaults,
  productSourceCost,
  productSourceShippingFee
}: {
  productId: number;
  defaults?: SelectionReviewDefaults;
  productSourceCost?: unknown;
  productSourceShippingFee?: unknown;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createSelectionReview, initialState);
  const selectedReasonCodes = new Set(parseJsonCodes(defaults?.reasonCodesJson));
  const selectedRiskCodes = new Set(parseJsonCodes(defaults?.riskCodesJson));
  const [marginPreview, setMarginPreview] = useState<MarginPreview>(() =>
    calculateMarginPreview({
      sourcePrice: defaults?.sourcePrice ?? productSourceCost,
      sourceShippingFee: defaults?.sourceShippingFee ?? productSourceShippingFee,
      exchangeRate: defaults?.exchangeRate,
      exchangeRateBufferPercent: defaults?.exchangeRateBufferPercent,
      paymentFeePercent: defaults?.paymentFeePercent,
      estimatedInternationalShippingFee: defaults?.estimatedInternationalShippingFee,
      domesticShippingFee: defaults?.domesticShippingFee,
      marketplaceFeePercent: defaults?.marketplaceFeePercent,
      returnLossRiskBuffer: defaults?.returnLossRiskBuffer,
      targetMarginPercent: defaults?.targetMarginPercent,
      expectedSellingPrice: defaults?.expectedSellingPrice
    })
  );

  useEffect(() => {
    if (formRef.current) {
      setMarginPreview(calculateMarginPreview(new FormData(formRef.current)));
    }
  }, [defaults, productSourceCost, productSourceShippingFee]);

  return (
    <form
      action={formAction}
      className="selection-form"
      onInput={(event) => setMarginPreview(calculateMarginPreview(new FormData(event.currentTarget)))}
      ref={formRef}
    >
      <input name="productId" type="hidden" value={productId} />
      <div className="selection-grid">
        <SelectField
          defaultValue={defaults?.selectionStatus ?? undefined}
          label="선정 상태"
          name="selectionStatus"
          options={selectionStatuses}
          uid={productId}
        />
        <SelectField
          defaultValue={defaults?.demandSignal ?? undefined}
          label="수요 판단"
          name="demandSignal"
          options={demandSignals}
          uid={productId}
        />
        <SelectField
          defaultValue={defaults?.competitionLevel ?? undefined}
          label="경쟁 강도"
          name="competitionLevel"
          options={competitionLevels}
          uid={productId}
        />
        <SelectField
          defaultValue={defaults?.priceAttractiveness ?? undefined}
          label="가격 매력도"
          name="priceAttractiveness"
          options={priceAttractiveness}
          uid={productId}
        />
        <SelectField
          defaultValue={defaults?.sourcingDifficulty ?? undefined}
          label="소싱 난이도"
          name="sourcingDifficulty"
          options={sourcingDifficulties}
          uid={productId}
        />
        <div className="field">
          <label htmlFor={`selectionScore-${productId}`}>선정 점수</label>
          <input
            defaultValue={defaults?.selectionScore ?? 50}
            id={`selectionScore-${productId}`}
            max="100"
            min="0"
            name="selectionScore"
            required
            type="number"
          />
        </div>
      </div>

      <div>
        <div className="label">초보 구매대행 리스크 체크</div>
        <div className="check-grid">
          {riskChecklistCodes.map((risk) => (
            <label className="check" key={risk.value}>
              <input
                defaultChecked={selectedRiskCodes.has(risk.value)}
                name="riskCodes"
                type="checkbox"
                value={risk.value}
              />
              {risk.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="label">선정/보류/제외 사유</div>
        <div className="check-grid">
          {selectionReasonCodes.map((reason) => (
            <label className="check" key={reason.value}>
              <input
                defaultChecked={selectedReasonCodes.has(reason.value)}
                name="reasonCodes"
                type="checkbox"
                value={reason.value}
              />
              {reason.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="label">보수적 마진 계산</div>
        <div className="selection-grid">
          <NumberField
            defaultValue={valueForInput(defaults?.sourcePrice ?? productSourceCost)}
            label="해외 상품가"
            name="sourcePrice"
            placeholder="예: 36"
            uid={productId}
          />
          <NumberField
            defaultValue={valueForInput(defaults?.sourceShippingFee ?? productSourceShippingFee)}
            label="현지 배송비"
            name="sourceShippingFee"
            placeholder="예: 6"
            uid={productId}
          />
          <NumberField
            defaultValue={valueForInput(defaults?.exchangeRate)}
            label="환율"
            name="exchangeRate"
            placeholder="예: 185"
            uid={productId}
          />
          <NumberField
            defaultValue={valueForInput(defaults?.exchangeRateBufferPercent)}
            label="환율 버퍼 %"
            name="exchangeRateBufferPercent"
            placeholder="5"
            uid={productId}
          />
          <NumberField
            defaultValue={valueForInput(defaults?.paymentFeePercent)}
            label="결제 수수료 %"
            name="paymentFeePercent"
            placeholder="3"
            uid={productId}
          />
          <NumberField
            defaultValue={valueForInput(defaults?.estimatedInternationalShippingFee)}
            label="국제 배송비"
            name="estimatedInternationalShippingFee"
            placeholder="예: 5500"
            uid={productId}
          />
          <NumberField
            defaultValue={valueForInput(defaults?.domesticShippingFee)}
            label="국내 배송비"
            name="domesticShippingFee"
            placeholder="예: 3500"
            uid={productId}
          />
          <NumberField
            defaultValue={valueForInput(defaults?.marketplaceFeePercent)}
            label="마켓 수수료 %"
            name="marketplaceFeePercent"
            placeholder="12"
            uid={productId}
          />
          <NumberField
            defaultValue={valueForInput(defaults?.returnLossRiskBuffer)}
            label="반품/분실 버퍼"
            name="returnLossRiskBuffer"
            placeholder="예: 1500"
            uid={productId}
          />
          <NumberField
            defaultValue={valueForInput(defaults?.targetMarginPercent)}
            label="목표 마진 %"
            name="targetMarginPercent"
            placeholder="20"
            uid={productId}
          />
          <NumberField
            defaultValue={valueForInput(defaults?.expectedSellingPrice)}
            label="예상 판매가"
            name="expectedSellingPrice"
            placeholder="선택 입력"
            uid={productId}
          />
        </div>
        <MarginPreviewPanel preview={marginPreview} />
      </div>

      <div className="field">
        <label htmlFor={`priceCompetitivenessMemo-${productId}`}>가격 경쟁력 메모</label>
        <textarea
          defaultValue={defaults?.priceCompetitivenessMemo ?? ""}
          id={`priceCompetitivenessMemo-${productId}`}
          name="priceCompetitivenessMemo"
        />
      </div>

      <div className="field">
        <label htmlFor={`reviewerNote-${productId}`}>선택 메모</label>
        <textarea
          defaultValue={defaults?.reviewerNote ?? ""}
          id={`reviewerNote-${productId}`}
          name="reviewerNote"
        />
      </div>

      {state.message ? (
        <p className={`notice ${state.ok ? "success" : "error"}`}>{state.message}</p>
      ) : null}

      <button className="button" disabled={isPending} type="submit">
        {isPending ? "저장 중..." : "선정 리뷰 저장"}
      </button>
    </form>
  );
}

function MarginPreviewPanel({ preview }: { preview: MarginPreview }) {
  if (!preview.ready) {
    return (
      <div className="margin-preview muted-preview">
        계산에 필요한 값이 부족합니다. 원가, 환율, 수수료, 배송비, 버퍼, 목표 마진을 입력하면 판매가가 표시됩니다.
      </div>
    );
  }

  return (
    <div className="margin-preview" aria-label="판매가 계산 미리보기">
      <div>
        <span>권장 판매가</span>
        <strong>{formatWon(preview.recommendedSellingPrice)}</strong>
      </div>
      <div>
        <span>손익분기점</span>
        <strong>{formatWon(preview.breakEvenPrice)}</strong>
      </div>
      <div>
        <span>예상 순이익</span>
        <strong>{formatWon(preview.estimatedNetProfit)}</strong>
      </div>
      <div>
        <span>마진율</span>
        <strong>{preview.estimatedMarginRate}%</strong>
      </div>
    </div>
  );
}

function NumberField({
  defaultValue,
  label,
  name,
  placeholder,
  uid
}: {
  defaultValue?: string;
  label: string;
  name: string;
  placeholder?: string;
  uid: number;
}) {
  const id = `${name}-${uid}`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        defaultValue={defaultValue}
        id={id}
        min="0"
        name={name}
        placeholder={placeholder}
        step="0.01"
        type="number"
      />
    </div>
  );
}

function SelectField({
  defaultValue,
  label,
  name,
  options,
  uid
}: {
  defaultValue?: string;
  label: string;
  name: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  uid: number;
}) {
  const id = `${name}-${uid}`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select defaultValue={defaultValue} id={id} name={name}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function calculateMarginPreview(source: FormData | Record<string, unknown>): MarginPreview {
  const data = {
    sourcePrice: numberFrom(source, "sourcePrice"),
    sourceShippingFee: numberFrom(source, "sourceShippingFee") ?? 0,
    exchangeRate: numberFrom(source, "exchangeRate"),
    exchangeRateBufferPercent: numberFrom(source, "exchangeRateBufferPercent"),
    paymentFeePercent: numberFrom(source, "paymentFeePercent"),
    estimatedInternationalShippingFee: numberFrom(source, "estimatedInternationalShippingFee"),
    domesticShippingFee: numberFrom(source, "domesticShippingFee"),
    marketplaceFeePercent: numberFrom(source, "marketplaceFeePercent"),
    returnLossRiskBuffer: numberFrom(source, "returnLossRiskBuffer"),
    targetMarginPercent: numberFrom(source, "targetMarginPercent"),
    expectedSellingPrice: numberFrom(source, "expectedSellingPrice")
  };

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
    return { ready: false };
  }

  const bufferedExchangeRate = data.exchangeRate! * (1 + data.exchangeRateBufferPercent! / 100);
  const convertedSourceCost = (data.sourcePrice! + data.sourceShippingFee) * bufferedExchangeRate;
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
    ready: true,
    breakEvenPrice: roundCurrency(breakEvenPrice),
    recommendedSellingPrice: roundCurrency(recommendedSellingPrice),
    estimatedNetProfit: roundCurrency(estimatedNetProfit),
    estimatedMarginRate: Math.round(estimatedMarginRate * 10) / 10
  };
}

function numberFrom(source: FormData | Record<string, unknown>, name: string) {
  const value = source instanceof FormData ? source.get(name) : source[name];
  if (value === null || value === undefined || value === "") return undefined;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function parseJsonCodes(value: string | null | undefined) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function valueForInput(value: unknown) {
  if (value === null || value === undefined) return undefined;
  return String(value);
}

function roundCurrency(value: number) {
  return Math.round(value);
}

function formatWon(value: number | undefined) {
  if (typeof value !== "number") return "-";
  return `${value.toLocaleString("ko-KR")}원`;
}
