"use client";

import { useActionState } from "react";
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
  const [state, formAction, isPending] = useActionState(createSelectionReview, initialState);
  const selectedReasonCodes = new Set(parseJsonCodes(defaults?.reasonCodesJson));
  const selectedRiskCodes = new Set(parseJsonCodes(defaults?.riskCodesJson));

  return (
    <form action={formAction} className="selection-form">
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
            label="해외 상품가 (위안화)"
            name="sourcePrice"
            placeholder="예: 36"
            uid={productId}
          />
          <NumberField
            defaultValue={valueForInput(defaults?.sourceShippingFee ?? productSourceShippingFee)}
            label="현지 배송비 (위안화)"
            name="sourceShippingFee"
            placeholder="예: 6"
            uid={productId}
          />
          <NumberField
            defaultValue={valueForInput(defaults?.exchangeRate)}
            label="환율 (원화)"
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
            label="국제 배송비 (원)"
            name="estimatedInternationalShippingFee"
            placeholder="예: 5500"
            uid={productId}
          />
          <NumberField
            defaultValue={valueForInput(defaults?.domesticShippingFee)}
            label="국내 배송비 (원)"
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
            label="반품/분실 버퍼 (원)"
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
            label="예상 판매가 (원)"
            name="expectedSellingPrice"
            placeholder="선택 입력"
            uid={productId}
          />
        </div>
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
