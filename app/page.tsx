import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  labelsForCodes,
  riskChecklistCodes,
  selectionReasonCodes,
  selectionStatuses,
  statusLabel
} from "@/lib/selection";
import { sourcingCompetitionLabel, sourcingDemandLabel } from "@/lib/sourcing";
import { ProductForm } from "@/components/product-form";
import { SelectionReviewForm } from "@/components/selection-review-form";
import { SourcingGuide } from "@/components/sourcing-guide";
import { SourcingSessionForm } from "@/components/sourcing-session-form";
import { WorkflowTabs } from "@/components/workflow-tabs";

type SearchParams = Promise<{
  product?: string;
  session?: string;
  status?: string;
  step?: string;
}>;

const filters = [
  { label: "전체", value: "all" },
  { label: "후보", value: "candidate" },
  { label: "진행", value: "selection_proceed" },
  { label: "보류", value: "selection_hold" },
  { label: "제외", value: "selection_exclude" }
];

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const { product, session = "all", status = "all", step } = await searchParams;
  const requestedSessionId = parsePositiveInt(session);
  const requestedProductId = parsePositiveInt(product);
  const productInclude = {
    sourcingSession: true,
    selectionReviews: {
      orderBy: [{ reviewedAt: "desc" as const }, { id: "desc" as const }],
      take: 3
    }
  };

  const [allProducts, counts, sourcingSessions] = await Promise.all([
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      include: productInclude
    }),
    prisma.product.groupBy({
      by: ["currentStatus"],
      _count: true
    }),
    prisma.sourcingSession.findMany({
      orderBy: { updatedAt: "desc" },
      take: 12,
      include: {
        products: {
          select: {
            currentStatus: true
          }
        },
        _count: {
          select: { products: true }
        }
      }
    })
  ]);

  const typedProducts = allProducts as ProductWithReview[];
  const countMap = new Map(counts.map((item) => [item.currentStatus, item._count]));
  const totalCount = counts.reduce((sum, item) => sum + item._count, 0);
  const sessionOptions = sourcingSessions.map((item) => ({
    id: item.id,
    title: item.title,
    domesticKeyword: item.domesticKeyword
  }));
  const defaultSessionId =
    sourcingSessions.find((item) => item._count.products > 0)?.id ?? sourcingSessions[0]?.id;
  const selectedSessionId = requestedSessionId ?? defaultSessionId;
  const candidateSessionKey = session === "none" ? "none" : String(selectedSessionId ?? "all");
  const candidateProducts = filterProductsBySession(typedProducts, candidateSessionKey);
  const selectedCandidateProduct = candidateProducts.find((item) => item.id === requestedProductId);
  const reviewSessionKey = session === "none" ? "none" : String(selectedSessionId ?? "all");
  const reviewSessionProducts = filterProductsBySession(typedProducts, reviewSessionKey);
  const selectedProduct =
    reviewSessionProducts.find((item) => item.id === requestedProductId) ??
    reviewSessionProducts[0];
  const reviewProducts = selectedProduct ? [selectedProduct] : [];
  const historySessionProducts = filterProductsBySession(typedProducts, session);
  const historyProducts = filterProductsByStatus(historySessionProducts, status);

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">P0 MVP</p>
          <h1>구매대행 SOP 워크플로우</h1>
          <p className="lead">
            소싱 세션을 만들고 후보 상품, 리스크, 마진, 진행 판단을 한 화면에서 기록합니다.
            첫 목표는 초보 운영자가 후보 10개를 안전하게 검토하는 것입니다.
          </p>
        </div>
        <div className="summary" aria-label="상품 상태 요약">
          <div className="metric">
            <span>전체</span>
            <strong>{totalCount}</strong>
          </div>
          <div className="metric">
            <span>진행</span>
            <strong>{countMap.get("selection_proceed") ?? 0}</strong>
          </div>
          <div className="metric">
            <span>보류</span>
            <strong>{countMap.get("selection_hold") ?? 0}</strong>
          </div>
          <div className="metric">
            <span>제외</span>
            <strong>{countMap.get("selection_exclude") ?? 0}</strong>
          </div>
        </div>
      </header>

      <WorkflowTabs
        guide={<SourcingGuide />}
        initialStep={step}
        sourcing={
          <div className="workflow-grid">
            <div className="panel">
              <h2>소싱 세션 생성</h2>
              <SourcingSessionForm />
            </div>
            <SessionList sourcingSessions={sourcingSessions} />
          </div>
        }
        candidates={
          <div className="workflow-grid">
            <div className="panel">
              <h2>{selectedCandidateProduct ? "상품 후보 수정" : "상품 후보 등록"}</h2>
              <ProductForm
                editProduct={selectedCandidateProduct}
                selectedSourcingSessionId={selectedSessionId}
                sourcingSessions={sessionOptions}
              />
            </div>
            <div className="stack">
              <SessionSelector
                selectedSessionKey={candidateSessionKey}
                sourcingSessions={sourcingSessions}
              />
              <ProductList mode="candidate" products={candidateProducts} />
            </div>
          </div>
        }
        review={
          <div className="stack">
            <ProductSelector
              products={reviewSessionProducts}
              selectedProductId={selectedProduct?.id}
              selectedSessionKey={reviewSessionKey}
              sourcingSessions={sourcingSessions}
            />
            <ProductList mode="review" products={reviewProducts} />
          </div>
        }
        history={
          <div className="stack">
            <HistorySessionSelector
              selectedSessionKey={session}
              selectedStatus={status}
              sourcingSessions={sourcingSessions}
            />
            <HistoryOverview products={historySessionProducts} />
            <nav className="filters" aria-label="상품 상태 필터">
              {filters.map((filter) => (
                <Link
                  className={`filter-link ${status === filter.value ? "active" : ""}`}
                  href={historyHref({ session, status: filter.value })}
                  key={filter.value}
                >
                  {filter.label}
                </Link>
              ))}
            </nav>
            <ProductList mode="history" products={historyProducts} />
          </div>
        }
      />

      <datalist id="selection-statuses">
        {selectionStatuses.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </datalist>
    </main>
  );
}

type ProductWithReview = {
  id: number;
  sourcingSessionId: number | null;
  sourceUrl: string | null;
  sourcePlatform: string | null;
  originalName: string;
  translatedName: string | null;
  sourceCost: unknown;
  sourceShippingFee: unknown;
  imageUrl: string | null;
  optionsMemo: string | null;
  estimatedWeight: string | null;
  estimatedVolume: string | null;
  sourcingMemo: string | null;
  currentStatus: string;
  sourcingSession: {
    title: string;
    domesticKeyword: string;
  } | null;
  selectionReviews: Array<{
    id: number;
    selectionStatus: string;
    demandSignal: string;
    competitionLevel: string;
    priceAttractiveness: string;
    sourcingDifficulty: string;
    selectionScore: number;
    reasonCodesJson: string;
    riskCodesJson: string;
    sourcePrice: unknown;
    sourceShippingFee: unknown;
    exchangeRate: unknown;
    exchangeRateBufferPercent: unknown;
    paymentFeePercent: unknown;
    estimatedInternationalShippingFee: unknown;
    domesticShippingFee: unknown;
    marketplaceFeePercent: unknown;
    returnLossRiskBuffer: unknown;
    targetMarginPercent: unknown;
    expectedSellingPrice: unknown;
    recommendedSellingPrice: unknown;
    breakEvenPrice: unknown;
    estimatedNetProfit: unknown;
    estimatedMarginRate: unknown;
    priceCompetitivenessMemo: string | null;
    reviewerNote: string | null;
    reviewedAt: Date;
  }>;
};

type SourcingSessionWithCount = {
  id: number;
  title: string;
  targetCategory: string | null;
  domesticKeyword: string;
  demandSignal: string | null;
  competitionLevel: string | null;
  targetCandidateCount: number | null;
  memo: string | null;
  _count: {
    products: number;
  };
  products: Array<{
    currentStatus: string;
  }>;
};

function SessionList({ sourcingSessions }: { sourcingSessions: SourcingSessionWithCount[] }) {
  return (
    <section className="session-list" aria-label="최근 소싱 세션">
      <h2>최근 소싱 세션</h2>
      {sourcingSessions.length === 0 ? (
        <div className="empty">아직 소싱 세션이 없습니다.</div>
      ) : (
        <div className="session-grid">
          {sourcingSessions.map((item) => (
            <article className="session-card" key={item.id}>
              <div className="product-title-row">
                <h3>{item.title}</h3>
                <span className="badge">{item._count.products}개 후보</span>
              </div>
              <p className="history">
                {item.targetCategory ? `${item.targetCategory} · ` : ""}
                {item.domesticKeyword}
              </p>
              <div className="product-meta">
                <span>수요 {sourcingDemandLabel(item.demandSignal)}</span>
                <span>경쟁 {sourcingCompetitionLabel(item.competitionLevel)}</span>
                {item.targetCandidateCount ? <span>목표 {item.targetCandidateCount}개</span> : null}
              </div>
              <div className="session-status-row" aria-label={`${item.title} 상태 요약`}>
                <span>진행 {countByStatus(item.products, "selection_proceed")}</span>
                <span>보류 {countByStatus(item.products, "selection_hold")}</span>
                <span>제외 {countByStatus(item.products, "selection_exclude")}</span>
                <span>후보 {countByStatus(item.products, "candidate")}</span>
              </div>
              {item.memo ? <p className="history">{item.memo}</p> : null}
              <div className="session-actions">
                <Link className="inline-action" href={`/?step=candidates&session=${item.id}`}>
                  이 세션으로 후보 추가
                </Link>
                <Link className="inline-action secondary" href={`/?step=history&session=${item.id}`}>
                  결정 이력 보기
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function SessionSelector({
  selectedSessionKey,
  sourcingSessions
}: {
  selectedSessionKey: string;
  sourcingSessions: SourcingSessionWithCount[];
}) {
  if (sourcingSessions.length === 0) {
    return <div className="empty">먼저 소싱 세션을 생성하면 세션별 후보 목록을 볼 수 있습니다.</div>;
  }

  return (
    <form action="/" className="selector-bar" method="get">
      <input name="step" type="hidden" value="candidates" />
      <div className="field">
        <label htmlFor="candidate-session">표시할 소싱 세션</label>
        <SessionOptions
          selectedSessionKey={selectedSessionKey}
          selectId="candidate-session"
          sourcingSessions={sourcingSessions}
        />
      </div>
      <button className="button secondary" type="submit">
        세션 보기
      </button>
    </form>
  );
}

function HistorySessionSelector({
  selectedSessionKey,
  selectedStatus,
  sourcingSessions
}: {
  selectedSessionKey: string;
  selectedStatus: string;
  sourcingSessions: SourcingSessionWithCount[];
}) {
  return (
    <form action="/" className="selector-bar" method="get">
      <input name="step" type="hidden" value="history" />
      <input name="status" type="hidden" value={selectedStatus} />
      <div className="field">
        <label htmlFor="history-session">결정 이력 소싱 세션</label>
        <SessionOptions
          includeAll
          selectedSessionKey={selectedSessionKey}
          selectId="history-session"
          sourcingSessions={sourcingSessions}
        />
      </div>
      <button className="button secondary" type="submit">
        이력 보기
      </button>
    </form>
  );
}

function ProductSelector({
  products,
  selectedProductId,
  selectedSessionKey,
  sourcingSessions
}: {
  products: ProductWithReview[];
  selectedProductId: number | undefined;
  selectedSessionKey: string;
  sourcingSessions: SourcingSessionWithCount[];
}) {
  return (
    <form action="/" className="selector-bar two-selectors" method="get">
      <input name="step" type="hidden" value="review" />
      <div className="field">
        <label htmlFor="review-session">리스크/마진 소싱 세션</label>
        <SessionOptions
          selectedSessionKey={selectedSessionKey}
          selectId="review-session"
          sourcingSessions={sourcingSessions}
        />
      </div>
      <div className="field">
        <label htmlFor="review-product">검토할 상품</label>
        <select defaultValue={selectedProductId} id="review-product" name="product">
          {products.length === 0 ? (
            <option value="">선택한 세션에 상품 없음</option>
          ) : (
            products.map((item) => (
              <option key={item.id} value={item.id}>
                {item.originalName}
              </option>
            ))
          )}
        </select>
      </div>
      <button className="button secondary" type="submit">
        상품 보기
      </button>
    </form>
  );
}

function SessionOptions({
  includeAll = false,
  selectedSessionKey,
  selectId,
  sourcingSessions
}: {
  includeAll?: boolean;
  selectedSessionKey: string;
  selectId: string;
  sourcingSessions: SourcingSessionWithCount[];
}) {
  return (
    <select defaultValue={selectedSessionKey} id={selectId} name="session">
      {includeAll ? <option value="all">전체 세션</option> : null}
      <option value="none">세션 없음</option>
      {sourcingSessions.map((item) => (
        <option key={item.id} value={item.id}>
          {item.title} · {item.domesticKeyword} ({item._count.products}개)
        </option>
      ))}
    </select>
  );
}

function HistoryOverview({ products }: { products: ProductWithReview[] }) {
  const summary = [
    { label: "전체", value: products.length },
    { label: "진행", value: products.filter((item) => item.currentStatus === "selection_proceed").length },
    { label: "보류", value: products.filter((item) => item.currentStatus === "selection_hold").length },
    { label: "제외", value: products.filter((item) => item.currentStatus === "selection_exclude").length },
    { label: "검토 전", value: products.filter((item) => item.currentStatus === "candidate").length }
  ];

  return (
    <section className="history-overview" aria-label="결정 이력 요약">
      {summary.map((item) => (
        <div key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </section>
  );
}

function ProductList({
  products,
  mode
}: {
  products: ProductWithReview[];
  mode: "candidate" | "review" | "history";
}) {
  return (
    <section className="product-list" aria-label="상품 후보 목록">
      {products.length === 0 ? (
        <div className="empty">이 조건에 해당하는 상품 후보가 없습니다.</div>
      ) : (
        products.map((product) => <ProductCard key={product.id} mode={mode} product={product} />)
      )}
    </section>
  );
}

function ProductCard({
  product,
  mode
}: {
  product: ProductWithReview;
  mode: "candidate" | "review" | "history";
}) {
  const latestReview = product.selectionReviews[0];
  const latestStatus = latestReview?.selectionStatus;
  const reasonCodes = latestReview ? parseCodes(latestReview.reasonCodesJson, selectionReasonCodes) : [];
  const riskCodes = latestReview ? parseCodes(latestReview.riskCodesJson, riskChecklistCodes) : [];
  const nextAction = nextActionFor(product, latestStatus);
  const missingItems = missingInfoFor(product, latestReview, riskCodes, reasonCodes);
  const editHref = candidateHref(product);
  const reviewHref = reviewHrefFor(product);

  return (
    <article className="product-card">
      <div className="product-main">
        <div>
          <div className="product-title-row">
            <div>
              <h3 className="product-title">
                {mode === "candidate" ? (
                  <Link href={editHref}>{product.originalName}</Link>
                ) : (
                  product.originalName
                )}
              </h3>
              {product.translatedName ? <p>{product.translatedName}</p> : null}
            </div>
            <span className={`badge ${latestStatus ?? ""}`}>
              {latestStatus ? statusLabel(latestStatus) : "후보"}
            </span>
          </div>
          <div className="product-meta">
            {product.sourcingSession ? (
              <span>
                세션 {product.sourcingSession.title} · {product.sourcingSession.domesticKeyword}
              </span>
            ) : (
              <span>세션 없음</span>
            )}
            {product.sourcePlatform ? <span>{product.sourcePlatform}</span> : null}
            {product.sourceCost ? <span>원가 {String(product.sourceCost)}</span> : null}
            {product.sourceShippingFee ? <span>현지배송 {String(product.sourceShippingFee)}</span> : null}
            {product.sourceUrl ? (
              <a href={product.sourceUrl} target="_blank" rel="noreferrer">
                원본 보기
              </a>
            ) : null}
          </div>
          {product.optionsMemo ? <p className="history">옵션: {product.optionsMemo}</p> : null}
          {product.sourcingMemo ? <p className="history">{product.sourcingMemo}</p> : null}
          <Link className={`next-action ${nextAction.tone}`} href={nextAction.href}>
            다음 행동: {nextAction.label}
          </Link>
          {mode === "history" && missingItems.length > 0 ? (
            <div className="missing-info" aria-label="부족한 정보">
              <span>부족한 정보</span>
              {missingItems.map((item) => (
                <em key={item}>{item}</em>
              ))}
            </div>
          ) : null}
          {mode === "history" ? (
            <div className="session-actions">
              <Link className="inline-action secondary" href={editHref}>
                후보 수정
              </Link>
              <Link className="inline-action" href={reviewHref}>
                다시 검토
              </Link>
            </div>
          ) : null}
          {mode !== "candidate" ? (
            <ReviewSummary
              latestReview={latestReview}
              reasonCodes={reasonCodes}
              riskCodes={riskCodes}
              reviews={product.selectionReviews}
            />
          ) : null}
        </div>
        <div>
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={`${product.originalName} 이미지`}
              src={product.imageUrl}
              style={{
                width: "100%",
                aspectRatio: "4 / 3",
                objectFit: "cover",
                borderRadius: 8,
                border: "1px solid var(--line)"
              }}
            />
          ) : null}
        </div>
      </div>
      {mode === "review" ? (
        <SelectionReviewForm
          defaults={latestReview}
          productId={product.id}
          productSourceCost={product.sourceCost}
          productSourceShippingFee={product.sourceShippingFee}
        />
      ) : null}
    </article>
  );
}

function ReviewSummary({
  latestReview,
  reasonCodes,
  riskCodes,
  reviews
}: {
  latestReview: ProductWithReview["selectionReviews"][number] | undefined;
  reasonCodes: string[];
  riskCodes: string[];
  reviews: ProductWithReview["selectionReviews"];
}) {
  if (!latestReview) {
    return <p className="history">아직 선정 이력이 없습니다.</p>;
  }

  return (
    <div className="history">
      <p>
        최근 결정: {statusLabel(latestReview.selectionStatus)} · 점수 {latestReview.selectionScore} · 사유{" "}
        {reasonCodes.length > 0 ? reasonCodes.join(", ") : "없음"}
      </p>
      {riskCodes.length > 0 ? <p>리스크: {riskCodes.join(", ")}</p> : null}
      {latestReview.recommendedSellingPrice ? (
        <p>
          마진: 권장가 {String(latestReview.recommendedSellingPrice)} · 손익분기{" "}
          {String(latestReview.breakEvenPrice)} · 예상이익 {String(latestReview.estimatedNetProfit)} · 마진율{" "}
          {String(latestReview.estimatedMarginRate)}%
        </p>
      ) : null}
      {reviews.length > 1 ? (
        <ol className="review-history">
          {reviews.map((review) => (
            <li key={review.id}>
              {statusLabel(review.selectionStatus)} · 점수 {review.selectionScore} ·{" "}
              {review.reviewedAt.toLocaleDateString("ko-KR")}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

function nextActionFor(product: ProductWithReview, status: string | undefined) {
  if (status === "proceed") {
    return {
      href: historyHref({ session: productSessionKey(product), status: "selection_proceed" }),
      label: "결정 이력 확인",
      tone: "proceed"
    };
  }
  if (status === "hold") {
    return { href: reviewHrefFor(product), label: "추가 확인 후 재검토", tone: "hold" };
  }
  if (status === "exclude") {
    return {
      href: historyHref({ session: productSessionKey(product), status: "selection_exclude" }),
      label: "제외 사유 확인",
      tone: "exclude"
    };
  }
  return { href: reviewHrefFor(product), label: "리스크/마진 검토", tone: "candidate" };
}

function candidateHref(product: ProductWithReview) {
  return `/?step=candidates&session=${productSessionKey(product)}&product=${product.id}`;
}

function reviewHrefFor(product: ProductWithReview) {
  return `/?step=review&session=${productSessionKey(product)}&product=${product.id}`;
}

function productSessionKey(product: ProductWithReview) {
  return product.sourcingSessionId ? String(product.sourcingSessionId) : "none";
}

function missingInfoFor(
  product: ProductWithReview,
  latestReview: ProductWithReview["selectionReviews"][number] | undefined,
  riskCodes: string[],
  reasonCodes: string[]
) {
  const missing = [];
  if (!product.sourceUrl || !product.sourceCost || !product.imageUrl) missing.push("후보 정보 부족");
  if (!latestReview) return [...missing, "검토 없음"];
  if (!latestReview.recommendedSellingPrice) missing.push("마진 미계산");
  if (riskCodes.length === 0) missing.push("리스크 체크 없음");
  if (latestReview.selectionStatus === "hold" && !latestReview.reviewerNote && reasonCodes.length === 0) {
    missing.push("보류 사유 부족");
  } else if (latestReview.selectionStatus === "hold" && !latestReview.reviewerNote) {
    missing.push("보류 메모 부족");
  }
  return missing;
}

function countByStatus(products: Array<{ currentStatus: string }>, status: string) {
  return products.filter((product) => product.currentStatus === status).length;
}

function filterProductsBySession(products: ProductWithReview[], sessionKey: string) {
  if (sessionKey === "all") return products;
  if (sessionKey === "none") return products.filter((item) => item.sourcingSessionId === null);
  const sessionId = parsePositiveInt(sessionKey);
  if (!sessionId) return products;
  return products.filter((item) => item.sourcingSessionId === sessionId);
}

function filterProductsByStatus(products: ProductWithReview[], status: string) {
  if (status === "all") return products;
  return products.filter((item) => item.currentStatus === status);
}

function historyHref({ session, status }: { session: string; status: string }) {
  const params = new URLSearchParams({ step: "history" });
  if (session !== "all") params.set("session", session);
  if (status !== "all") params.set("status", status);
  return `/?${params.toString()}`;
}

function parsePositiveInt(value: string | undefined) {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function parseCodes(
  value: string,
  options: ReadonlyArray<{ value: string; label: string }>
) {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return labelsForCodes(parsed.map(String), options);
  } catch {
    return [];
  }
}
