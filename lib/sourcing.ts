export const sourcingDemandSignals = [
  { value: "unknown", label: "미확인" },
  { value: "weak", label: "약함" },
  { value: "normal", label: "보통" },
  { value: "strong", label: "강함" }
] as const;

export const sourcingCompetitionLevels = [
  { value: "unknown", label: "미확인" },
  { value: "low", label: "낮음" },
  { value: "normal", label: "보통" },
  { value: "high", label: "높음" }
] as const;

export const sourcingCategories = [
  { value: "", label: "선택 안 함" },
  { value: "생활/수납", label: "생활/수납" },
  { value: "주방/수납", label: "주방/수납" },
  { value: "욕실/청소", label: "욕실/청소" },
  { value: "문구/사무", label: "문구/사무" },
  { value: "취미/DIY", label: "취미/DIY" },
  { value: "반려동물/비식품", label: "반려동물/비식품" },
  { value: "차량용/비전기", label: "차량용/비전기" },
  { value: "캠핑/소형소품", label: "캠핑/소형소품" },
  { value: "패션잡화/저위험", label: "패션잡화/저위험" },
  { value: "인테리어/소품", label: "인테리어/소품" },
  { value: "기타", label: "기타" }
] as const;

export const sourcingPlatforms = [
  { value: "", label: "선택 안 함" },
  { value: "1688", label: "1688" },
  { value: "Taobao", label: "Taobao" },
  { value: "Tmall", label: "Tmall" },
  { value: "AliExpress", label: "AliExpress" },
  { value: "Amazon Japan", label: "Amazon Japan" },
  { value: "Rakuten Japan", label: "Rakuten Japan" },
  { value: "Yahoo Shopping Japan", label: "Yahoo Shopping Japan" },
  { value: "Mercari Japan", label: "Mercari Japan" },
  { value: "Qoo10 Japan", label: "Qoo10 Japan" },
  { value: "Naver SmartStore", label: "Naver SmartStore" },
  { value: "Coupang", label: "Coupang" },
  { value: "11st", label: "11번가" },
  { value: "Gmarket", label: "Gmarket" },
  { value: "Auction", label: "Auction" },
  { value: "Other", label: "기타" }
] as const;

export function sourcingDemandLabel(value: string | null | undefined) {
  if (!value) return "미확인";
  return sourcingDemandSignals.find((item) => item.value === value)?.label ?? value;
}

export function sourcingCompetitionLabel(value: string | null | undefined) {
  if (!value) return "미확인";
  return sourcingCompetitionLevels.find((item) => item.value === value)?.label ?? value;
}
