"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

const steps = [
  {
    key: "sourcing",
    title: "소싱 세션",
    description: "카테고리와 국내 키워드를 정하고 어떤 기준으로 후보를 찾을지 기록합니다."
  },
  {
    key: "candidates",
    title: "후보 상품",
    description: "선택한 소싱 세션에서 발견한 상품을 등록하고 기본 원가와 옵션 정보를 남깁니다."
  },
  {
    key: "review",
    title: "리스크·마진",
    description: "상품 하나에 집중해서 초보자가 피해야 할 리스크와 보수적인 마진을 검토합니다."
  },
  {
    key: "history",
    title: "결정 이력",
    description: "진행, 보류, 제외 판단과 그 이유를 상태별로 확인합니다."
  }
] as const;

type StepKey = (typeof steps)[number]["key"];

export function WorkflowTabs({
  initialStep,
  sourcing,
  candidates,
  review,
  history
}: {
  initialStep?: string;
  sourcing: ReactNode;
  candidates: ReactNode;
  review: ReactNode;
  history: ReactNode;
}) {
  const initialIndex = stepIndexFor(initialStep);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeStep = steps[activeIndex];
  const panels = [sourcing, candidates, review, history];

  useEffect(() => {
    setActiveIndex(stepIndexFor(initialStep));
  }, [initialStep]);

  return (
    <section className="workflow-shell" aria-label="구매대행 SOP 단계">
      <nav className="workflow-tabs" aria-label="워크플로우 단계">
        {steps.map((step, index) => (
          <Link
            aria-current={activeIndex === index ? "step" : undefined}
            className={`workflow-tab ${activeIndex === index ? "active" : ""}`}
            href={hrefForStep(step.key)}
            key={step.key}
          >
            <span>{index + 1}</span>
            {step.title}
          </Link>
        ))}
      </nav>

      <div className="workflow-step-header">
        <p className="eyebrow">
          Step {activeIndex + 1} / {steps.length}
        </p>
        <h2>{activeStep.title}</h2>
        <p>{activeStep.description}</p>
      </div>

      <div className="workflow-panel">{panels[activeIndex]}</div>

      <div className="workflow-actions">
        <Link
          aria-disabled={activeIndex === 0}
          className={`button secondary ${activeIndex === 0 ? "disabled" : ""}`}
          href={hrefForStep(steps[Math.max(0, activeIndex - 1)].key)}
        >
          이전
        </Link>
        <Link
          aria-disabled={activeIndex === steps.length - 1}
          className={`button ${activeIndex === steps.length - 1 ? "disabled" : ""}`}
          href={hrefForStep(steps[Math.min(steps.length - 1, activeIndex + 1)].key)}
        >
          다음
        </Link>
      </div>
    </section>
  );
}

function hrefForStep(step: StepKey) {
  return step === "sourcing" ? "/" : `/?step=${step}`;
}

function stepIndexFor(step: string | undefined) {
  const index = steps.findIndex((candidate) => candidate.key === step);
  return index >= 0 ? index : 0;
}
