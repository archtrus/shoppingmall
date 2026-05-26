export const selectionStatuses = [
  { value: "proceed", label: "진행" },
  { value: "hold", label: "보류" },
  { value: "exclude", label: "제외" }
] as const;

export const demandSignals = [
  { value: "high", label: "높음" },
  { value: "medium", label: "보통" },
  { value: "low", label: "낮음" },
  { value: "uncertain", label: "불확실" }
] as const;

export const competitionLevels = [
  { value: "low", label: "낮음" },
  { value: "medium", label: "보통" },
  { value: "high", label: "높음" }
] as const;

export const priceAttractiveness = [
  { value: "good", label: "좋음" },
  { value: "uncertain", label: "애매함" },
  { value: "poor", label: "낮음" }
] as const;

export const sourcingDifficulties = [
  { value: "easy", label: "쉬움" },
  { value: "medium", label: "보통" },
  { value: "hard", label: "어려움" }
] as const;

export const selectionReasonCodes = [
  { value: "DEMAND_UNCERTAIN", label: "수요 불확실" },
  { value: "COMPETITION_HIGH", label: "경쟁 과다" },
  { value: "PRICE_NOT_COMPETITIVE", label: "가격 경쟁력 부족" },
  { value: "COST_OR_SHIPPING_UNFAVORABLE", label: "원가/배송비 불리" },
  { value: "OPTIONS_COMPLEX", label: "옵션 복잡" },
  { value: "INSUFFICIENT_IMAGES_OR_INFO", label: "이미지/상세정보 부족" },
  { value: "IP_OR_BRAND_RISK", label: "브랜드/IP 우려" },
  { value: "CERTIFICATION_OR_CUSTOMS_RISK", label: "인증/통관 우려" },
  { value: "CS_RISK_HIGH", label: "CS 위험 높음" },
  { value: "OTHER", label: "기타" }
] as const;

export function statusLabel(status: string) {
  return selectionStatuses.find((item) => item.value === status)?.label ?? status;
}

export function currentStatusForSelection(status: string) {
  if (status === "proceed") return "selection_proceed";
  if (status === "hold") return "selection_hold";
  if (status === "exclude") return "selection_exclude";
  return "candidate";
}
