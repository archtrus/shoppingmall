"use client";

import { useActionState, useEffect, useRef } from "react";
import { createProduct, type ActionState } from "@/app/actions";
import { sourcingPlatforms } from "@/lib/sourcing";

const initialState: ActionState = {
  ok: false,
  message: ""
};

type SourcingSessionOption = {
  id: number;
  title: string;
  domesticKeyword: string;
};

export function ProductForm({
  sourcingSessions,
  selectedSourcingSessionId
}: {
  sourcingSessions: SourcingSessionOption[];
  selectedSourcingSessionId?: number;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createProduct, initialState);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  return (
    <form action={formAction} className="form-grid" ref={formRef}>
      <div className="field">
        <label htmlFor="sourcingSessionId">소싱 세션</label>
        <select
          defaultValue={selectedSourcingSessionId ? String(selectedSourcingSessionId) : ""}
          id="sourcingSessionId"
          name="sourcingSessionId"
        >
          <option value="">세션 없이 등록</option>
          {sourcingSessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.title} · {session.domesticKeyword}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="sourceUrl">원본 URL</label>
        <input id="sourceUrl" name="sourceUrl" placeholder="https://..." type="url" />
      </div>
      <div className="field">
        <label htmlFor="sourcePlatform">소싱 플랫폼</label>
        <select id="sourcePlatform" name="sourcePlatform">
          {sourcingPlatforms.map((platform) => (
            <option key={platform.value} value={platform.value}>
              {platform.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="originalName">원본 상품명</label>
        <input id="originalName" name="originalName" required />
      </div>
      <div className="field">
        <label htmlFor="translatedName">번역 상품명</label>
        <input id="translatedName" name="translatedName" />
      </div>
      <div className="field">
        <label htmlFor="sourceCost">원가</label>
        <input id="sourceCost" min="0" name="sourceCost" step="0.01" type="number" />
      </div>
      <div className="field">
        <label htmlFor="sourceShippingFee">현지 배송비</label>
        <input id="sourceShippingFee" min="0" name="sourceShippingFee" step="0.01" type="number" />
      </div>
      <div className="field">
        <label htmlFor="imageUrl">이미지 URL</label>
        <input id="imageUrl" name="imageUrl" placeholder="https://..." type="url" />
      </div>
      <div className="field">
        <label htmlFor="optionsMemo">옵션 메모</label>
        <textarea id="optionsMemo" name="optionsMemo" />
      </div>
      <div className="selection-grid">
        <div className="field">
          <label htmlFor="estimatedWeight">예상 무게</label>
          <input id="estimatedWeight" name="estimatedWeight" placeholder="예: 0.8kg" />
        </div>
        <div className="field">
          <label htmlFor="estimatedVolume">예상 부피</label>
          <input id="estimatedVolume" name="estimatedVolume" placeholder="예: 30x20x10cm" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="sourcingMemo">소싱 메모</label>
        <textarea id="sourcingMemo" name="sourcingMemo" />
      </div>
      {state.message ? (
        <p className={`notice ${state.ok ? "success" : "error"}`}>{state.message}</p>
      ) : null}
      <button className="button" disabled={isPending} type="submit">
        {isPending ? "등록 중..." : "후보 등록"}
      </button>
    </form>
  );
}
