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
  { value: "MARGIN_TOO_LOW", label: "마진 부족" },
  { value: "SHIPPING_COST_RISK", label: "배송비 리스크" },
  { value: "HEAVY_OR_BULKY", label: "크거나 무거움" },
  { value: "FRAGILE_RISK", label: "파손 위험" },
  { value: "OPTIONS_COMPLEX", label: "옵션 복잡" },
  { value: "INSUFFICIENT_IMAGES_OR_INFO", label: "이미지/상세 정보 부족" },
  { value: "IP_OR_BRAND_RISK", label: "브랜드/IP 우려" },
  { value: "CERTIFICATION_OR_CUSTOMS_RISK", label: "인증/통관 우려" },
  { value: "FOOD_COSMETICS_MEDICAL_RISK", label: "식품/화장품/의료 리스크" },
  { value: "ELECTRICAL_OR_BATTERY_RISK", label: "전기/KC/배터리 리스크" },
  { value: "CUSTOMS_OR_SHIPPING_RESTRICTED", label: "통관/배송 제한 가능성" },
  { value: "CS_RISK_HIGH", label: "CS 위험 높음" },
  { value: "OTHER", label: "기타" }
] as const;

export const riskChecklistCodes = [
  { value: "FOOD_HEALTH_SUPPLEMENT", label: "식품/건강기능식품 가능성" },
  { value: "COSMETICS", label: "화장품 가능성" },
  { value: "MEDICAL_OR_MEDICINE", label: "의료기기/의약품 가능성" },
  { value: "ELECTRICAL_KC", label: "전기/KC 인증 가능성" },
  { value: "BATTERY", label: "배터리 포함 가능성" },
  { value: "CHILDREN_PRODUCT", label: "아동용품 가능성" },
  { value: "QUARANTINE", label: "검역 대상 가능성" },
  { value: "IP_BRAND_CHARACTER_LOGO", label: "브랜드/캐릭터/로고 리스크" },
  { value: "COUNTERFEIT_SUSPICION", label: "가품 의심 요소" },
  { value: "RESTRICTED_SHIPPING", label: "액체/분말/칼날/자석 등 배송 제한" },
  { value: "HEAVY_OR_BULKY", label: "무겁거나 부피가 큼" },
  { value: "FRAGILE", label: "파손 위험" },
  { value: "COMPLEX_OPTIONS", label: "옵션 복잡" },
  { value: "INSUFFICIENT_INFO", label: "이미지/상세 정보 부족" },
  { value: "HIGH_CS_RISK", label: "CS 위험 높음" }
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

export function labelsForCodes(
  codes: string[],
  options: ReadonlyArray<{ value: string; label: string }>
) {
  return codes.map((code) => options.find((item) => item.value === code)?.label ?? code);
}
