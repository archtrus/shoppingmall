import Link from "next/link";

const goalItems = [
  "한 번에 카테고리 1개와 국내 키워드 1개만 고릅니다.",
  "처음 목표는 후보 2개 등록, 이후 10개 검토입니다.",
  "진행 상품은 1~2개만 나와도 충분합니다.",
  "초보자는 위험 카테고리를 먼저 피합니다."
];

const domesticChecks = [
  "국내 검색 결과가 너무 적지 않은가",
  "연관 키워드가 2~3개 보이는가",
  "국내 판매가 범위를 대략 봤는가",
  "경쟁 상품이 너무 많은지 확인했는가"
];

const domesticRecords = [
  "domesticKeyword",
  "relatedKeywords",
  "demandSignal",
  "competitionLevel",
  "memo"
];

const sourceChecks = [
  "원가와 현지 배송비",
  "옵션 구조",
  "이미지와 상세 정보 충분성",
  "무게, 파손, 배송 위험",
  "브랜드/IP 의심 여부"
];

const sourceRecords = [
  "sourceUrl",
  "sourcePlatform",
  "sourcePrice",
  "sourceShippingFee",
  "imageUrl",
  "optionsMemo",
  "sourcingMemo"
];

const avoidCategories = [
  "식품, 건강기능식품",
  "화장품, 의료기기, 의약품",
  "전기/KC 인증, 배터리 포함 상품",
  "아동용품, 날카롭거나 파손 위험이 큰 상품",
  "브랜드, 캐릭터, IP 의심 상품"
];

const candidateRules = [
  "국내에서 찾는 사람이 있어 보임",
  "원가와 국내 판매가 차이가 있음",
  "옵션을 이해할 수 있음",
  "이미지와 상세 정보가 부족하지 않음",
  "위험하면 등록보다 제외 이유 기록"
];

const readyChecks = [
  "초보자 위험 카테고리를 피했다.",
  "국내 키워드와 연관 키워드 2~3개를 적을 수 있다.",
  "국내 가격대와 경쟁 강도를 대략 봤다.",
  "해외 후보 상품 2개를 찾았다.",
  "각 후보의 원가, 배송비, 옵션, 위험 요소를 대략 확인했다."
];

export function SourcingGuide() {
  return (
    <section className="guide-shell" aria-label="운영 가이드">
      <div className="guide-card guide-card-emphasis">
        <div>
          <p className="eyebrow">오늘의 소싱 목표</p>
          <h3>작게 고르고 2개만 등록해봅니다</h3>
        </div>
        <ul className="guide-list">
          {goalItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="guide-grid">
        <GuideCard
          title="국내 키워드 확인"
          tools={["네이버", "아이템스카우트", "쇼핑 검색"]}
          checks={domesticChecks}
          records={domesticRecords}
        />
        <GuideCard
          title="해외 후보 찾기"
          tools={["1688", "Taobao", "AliExpress", "이미지 검색", "번역기"]}
          checks={sourceChecks}
          records={sourceRecords}
        />
      </div>

      <div className="guide-grid">
        <CompactList title="처음에는 피하기" tone="warning" items={avoidCategories} />
        <CompactList title="후보 등록 기준" tone="success" items={candidateRules} />
      </div>

      <article className="guide-card guide-ready">
        <div>
          <p className="eyebrow">세션 만들기 전 1분 확인</p>
          <h3>아래 5개만 확인되면 충분합니다</h3>
        </div>
        <ul className="guide-checklist">
          {readyChecks.map((item) => (
            <li key={item}>
              <span aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </article>

      <div className="guide-cta">
        <div>
          <h3>조사 결과가 모이면 세션을 만드세요</h3>
          <p>확인한 키워드, 수요, 경쟁, 메모를 소싱 세션에 기록합니다.</p>
        </div>
        <Link className="button" href="/?step=sourcing">
          소싱 세션 만들기
        </Link>
      </div>
    </section>
  );
}

function GuideCard({
  title,
  tools,
  checks,
  records
}: {
  title: string;
  tools: string[];
  checks: string[];
  records: string[];
}) {
  return (
    <article className="guide-card">
      <h3>{title}</h3>
      <GuideChips label="추천 툴" values={tools} />
      <div className="guide-columns">
        <div>
          <p className="label">확인할 것</p>
          <ul className="guide-list">
            {checks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="label">앱에 기록</p>
          <ul className="guide-list compact">
            {records.map((item) => (
              <li key={item}>
                <code>{item}</code>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

function CompactList({
  title,
  tone,
  items
}: {
  title: string;
  tone: "success" | "warning";
  items: string[];
}) {
  return (
    <article className={`guide-card ${tone}`}>
      <h3>{title}</h3>
      <ul className="guide-list compact">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function GuideChips({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="guide-chip-row" aria-label={label}>
      {values.map((value) => (
        <span className="guide-chip" key={value}>
          {value}
        </span>
      ))}
    </div>
  );
}
