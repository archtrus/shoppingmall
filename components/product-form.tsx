"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { createProduct, updateProduct, type ActionState } from "@/app/actions";
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

export type ProductFormDefaults = {
  id: number;
  sourcingSessionId?: number | null;
  sourceUrl?: string | null;
  sourcePlatform?: string | null;
  originalName: string;
  translatedName?: string | null;
  sourceCost?: unknown;
  sourceShippingFee?: unknown;
  imageUrl?: string | null;
  optionsMemo?: string | null;
  estimatedWeight?: string | null;
  estimatedVolume?: string | null;
  sourcingMemo?: string | null;
};

export function ProductForm({
  editProduct,
  sourcingSessions,
  selectedSourcingSessionId
}: {
  editProduct?: ProductFormDefaults;
  sourcingSessions: SourcingSessionOption[];
  selectedSourcingSessionId?: number;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const isEditMode = Boolean(editProduct);
  const [state, formAction, isPending] = useActionState(
    isEditMode ? updateProduct : createProduct,
    initialState
  );

  useEffect(() => {
    if (state.ok && !isEditMode) {
      formRef.current?.reset();
    }
  }, [isEditMode, state.ok]);

  const resolvedSessionId = editProduct?.sourcingSessionId ?? selectedSourcingSessionId;
  const sessionValue = resolvedSessionId ? String(resolvedSessionId) : "";

  return (
    <form action={formAction} className="form-grid" ref={formRef}>
      {editProduct ? <input name="productId" type="hidden" value={editProduct.id} /> : null}
      {editProduct ? (
        <div className="edit-mode-note">
          <strong>후보 수정 중</strong>
          <Link href={`/?step=candidates&session=${sessionValue || "none"}`}>
            새 후보 등록으로 돌아가기
          </Link>
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="sourcingSessionId">소싱 세션</label>
        <select defaultValue={sessionValue} id="sourcingSessionId" name="sourcingSessionId">
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
        <input
          defaultValue={editProduct?.sourceUrl ?? ""}
          id="sourceUrl"
          name="sourceUrl"
          placeholder="https://..."
          type="url"
        />
      </div>
      <div className="field">
        <label htmlFor="sourcePlatform">소싱 플랫폼</label>
        <select
          defaultValue={editProduct?.sourcePlatform ?? ""}
          id="sourcePlatform"
          name="sourcePlatform"
        >
          {sourcingPlatforms.map((platform) => (
            <option key={platform.value} value={platform.value}>
              {platform.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="originalName">원본 상품명</label>
        <input
          defaultValue={editProduct?.originalName ?? ""}
          id="originalName"
          name="originalName"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="translatedName">번역 상품명</label>
        <input
          defaultValue={editProduct?.translatedName ?? ""}
          id="translatedName"
          name="translatedName"
        />
      </div>
      <div className="field">
        <label htmlFor="sourceCost">원가</label>
        <input
          defaultValue={valueForInput(editProduct?.sourceCost)}
          id="sourceCost"
          min="0"
          name="sourceCost"
          step="0.01"
          type="number"
        />
      </div>
      <div className="field">
        <label htmlFor="sourceShippingFee">현지 배송비</label>
        <input
          defaultValue={valueForInput(editProduct?.sourceShippingFee)}
          id="sourceShippingFee"
          min="0"
          name="sourceShippingFee"
          step="0.01"
          type="number"
        />
      </div>
      <div className="field">
        <label htmlFor="imageUrl">이미지 URL</label>
        <input
          defaultValue={editProduct?.imageUrl ?? ""}
          id="imageUrl"
          name="imageUrl"
          placeholder="https://..."
          type="url"
        />
      </div>
      <div className="field">
        <label htmlFor="optionsMemo">옵션 메모</label>
        <textarea
          defaultValue={editProduct?.optionsMemo ?? ""}
          id="optionsMemo"
          name="optionsMemo"
        />
      </div>
      <div className="selection-grid">
        <div className="field">
          <label htmlFor="estimatedWeight">예상 무게</label>
          <input
            defaultValue={editProduct?.estimatedWeight ?? ""}
            id="estimatedWeight"
            name="estimatedWeight"
            placeholder="예: 0.8kg"
          />
        </div>
        <div className="field">
          <label htmlFor="estimatedVolume">예상 부피</label>
          <input
            defaultValue={editProduct?.estimatedVolume ?? ""}
            id="estimatedVolume"
            name="estimatedVolume"
            placeholder="예: 30x20x10cm"
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="sourcingMemo">소싱 메모</label>
        <textarea
          defaultValue={editProduct?.sourcingMemo ?? ""}
          id="sourcingMemo"
          name="sourcingMemo"
        />
      </div>
      {state.message ? (
        <p className={`notice ${state.ok ? "success" : "error"}`}>{state.message}</p>
      ) : null}
      <button className="button" disabled={isPending} type="submit">
        {isPending ? "저장 중..." : isEditMode ? "후보 수정" : "후보 등록"}
      </button>
    </form>
  );
}

function valueForInput(value: unknown) {
  if (value === null || value === undefined) return undefined;
  return String(value);
}
