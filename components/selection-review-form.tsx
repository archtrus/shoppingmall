"use client";

import { useActionState, useEffect, useRef } from "react";
import { createSelectionReview, type ActionState } from "@/app/actions";
import {
  competitionLevels,
  demandSignals,
  priceAttractiveness,
  selectionReasonCodes,
  selectionStatuses,
  sourcingDifficulties
} from "@/lib/selection";

const initialState: ActionState = {
  ok: false,
  message: ""
};

export function SelectionReviewForm({ productId }: { productId: number }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createSelectionReview, initialState);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  return (
    <form action={formAction} className="selection-form" ref={formRef}>
      <input name="productId" type="hidden" value={productId} />
      <div className="selection-grid">
        <SelectField label="선정 상태" name="selectionStatus" options={selectionStatuses} />
        <SelectField label="수요 판단" name="demandSignal" options={demandSignals} />
        <SelectField label="경쟁 강도" name="competitionLevel" options={competitionLevels} />
        <SelectField label="가격 매력도" name="priceAttractiveness" options={priceAttractiveness} />
        <SelectField label="소싱 난이도" name="sourcingDifficulty" options={sourcingDifficulties} />
        <div className="field">
          <label htmlFor={`selectionScore-${productId}`}>선정 점수</label>
          <input
            defaultValue="50"
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
        <div className="label">선정/제외 사유</div>
        <div className="check-grid">
          {selectionReasonCodes.map((reason) => (
            <label className="check" key={reason.value}>
              <input name="reasonCodes" type="checkbox" value={reason.value} />
              {reason.label}
            </label>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor={`reviewerNote-${productId}`}>선택 메모</label>
        <textarea id={`reviewerNote-${productId}`} name="reviewerNote" />
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

function SelectField({
  label,
  name,
  options
}: {
  label: string;
  name: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <select id={name} name={name}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
