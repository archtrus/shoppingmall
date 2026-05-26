"use client";

import { useActionState, useEffect, useRef } from "react";
import { createProduct, type ActionState } from "@/app/actions";

const initialState: ActionState = {
  ok: false,
  message: ""
};

export function ProductForm() {
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
        <label htmlFor="sourceUrl">원본 URL</label>
        <input id="sourceUrl" name="sourceUrl" placeholder="https://..." type="url" />
      </div>
      <div className="field">
        <label htmlFor="sourcePlatform">소싱 플랫폼</label>
        <input id="sourcePlatform" name="sourcePlatform" placeholder="1688, Taobao, Amazon..." />
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
        <label htmlFor="imageUrl">이미지 URL</label>
        <input id="imageUrl" name="imageUrl" placeholder="https://..." type="url" />
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
