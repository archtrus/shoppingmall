"use client";

import { useActionState, useEffect, useRef } from "react";
import { createSourcingSession, type ActionState } from "@/app/actions";
import {
  sourcingCategories,
  sourcingCompetitionLevels,
  sourcingDemandSignals,
  sourcingPlatforms
} from "@/lib/sourcing";

const initialState: ActionState = {
  ok: false,
  message: ""
};

export function SourcingSessionForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createSourcingSession, initialState);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  return (
    <form action={formAction} className="form-grid" ref={formRef}>
      <div className="field">
        <label htmlFor="title">세션 제목</label>
        <input id="title" name="title" placeholder="정리 수납용품 탐색" required />
      </div>
      <SelectField label="대상 카테고리" name="targetCategory" options={sourcingCategories} />
      <div className="field">
        <label htmlFor="domesticKeyword">국내 검색 키워드</label>
        <input id="domesticKeyword" name="domesticKeyword" placeholder="정리 수납 선반" required />
      </div>
      <div className="field">
        <label htmlFor="relatedKeywords">관련 키워드</label>
        <input id="relatedKeywords" name="relatedKeywords" placeholder="무타공, 코너선반, 정리함" />
      </div>
      <SelectField label="소싱 플랫폼" name="sourcePlatforms" options={sourcingPlatforms} />
      <div className="field">
        <label htmlFor="sourcingStrategy">소싱 전략</label>
        <textarea
          id="sourcingStrategy"
          name="sourcingStrategy"
          placeholder="작고 가벼운 비전기 생활소품 위주로 확인"
        />
      </div>
      <div className="selection-grid">
        <SelectField label="수요 관찰" name="demandSignal" options={sourcingDemandSignals} />
        <SelectField label="경쟁 관찰" name="competitionLevel" options={sourcingCompetitionLevels} />
        <div className="field">
          <label htmlFor="targetCandidateCount">목표 후보 수</label>
          <input id="targetCandidateCount" min="1" name="targetCandidateCount" type="number" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="memo">세션 메모</label>
        <textarea id="memo" name="memo" />
      </div>
      {state.message ? (
        <p className={`notice ${state.ok ? "success" : "error"}`}>{state.message}</p>
      ) : null}
      <button className="button" disabled={isPending} type="submit">
        {isPending ? "생성 중..." : "소싱 세션 생성"}
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
