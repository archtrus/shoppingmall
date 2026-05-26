import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { selectionReasonCodes, selectionStatuses, statusLabel } from "@/lib/selection";
import { ProductForm } from "@/components/product-form";
import { SelectionReviewForm } from "@/components/selection-review-form";

type SearchParams = Promise<{
  status?: string;
}>;

const filters = [
  { label: "전체", value: "all" },
  { label: "후보", value: "candidate" },
  { label: "진행", value: "selection_proceed" },
  { label: "보류", value: "selection_hold" },
  { label: "제외", value: "selection_exclude" }
];

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const { status = "all" } = await searchParams;
  const where = status === "all" ? {} : { currentStatus: status };

  const [products, counts] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        selectionReviews: {
          orderBy: [{ reviewedAt: "desc" }, { id: "desc" }],
          take: 3
        }
      }
    }),
    prisma.product.groupBy({
      by: ["currentStatus"],
      _count: true
    })
  ]);

  const countMap = new Map(counts.map((item) => [item.currentStatus, item._count]));
  const totalCount = counts.reduce((sum, item) => sum + item._count, 0);

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">P0 MVP</p>
          <h1>상품 후보 선정 워크플로우</h1>
          <p className="lead">
            해외 구매대행 후보 상품을 등록하고 진행, 보류, 제외 판단과 이유를 기록합니다.
            첫 목표는 후보 10개의 판단 근거를 남기는 것입니다.
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

      <section className="layout">
        <div className="panel">
          <h2>상품 후보 등록</h2>
          <ProductForm />
        </div>

        <div>
          <nav className="filters" aria-label="상품 상태 필터">
            {filters.map((filter) => (
              <Link
                className={`filter-link ${status === filter.value ? "active" : ""}`}
                href={filter.value === "all" ? "/" : `/?status=${filter.value}`}
                key={filter.value}
              >
                {filter.label}
              </Link>
            ))}
          </nav>

          <section className="product-list" aria-label="상품 후보 목록">
            {products.length === 0 ? (
              <div className="empty">아직 등록된 상품 후보가 없습니다.</div>
            ) : (
              products.map((product) => {
                const latestReview = product.selectionReviews[0];
                const latestStatus = latestReview?.selectionStatus;
                const reasonCodes = latestReview
                  ? parseReasonCodes(latestReview.reasonCodesJson)
                  : [];

                return (
                  <article className="product-card" key={product.id}>
                    <div className="product-main">
                      <div>
                        <div className="product-title-row">
                          <div>
                            <h3 className="product-title">{product.originalName}</h3>
                            {product.translatedName ? <p>{product.translatedName}</p> : null}
                          </div>
                          <span className={`badge ${latestStatus ?? ""}`}>
                            {latestStatus ? statusLabel(latestStatus) : "후보"}
                          </span>
                        </div>
                        <div className="product-meta">
                          {product.sourcePlatform ? <span>{product.sourcePlatform}</span> : null}
                          {product.sourceCost ? <span>원가 {String(product.sourceCost)} </span> : null}
                          {product.sourceUrl ? (
                            <a href={product.sourceUrl} target="_blank" rel="noreferrer">
                              원본 보기
                            </a>
                          ) : null}
                        </div>
                        {product.sourcingMemo ? <p className="history">{product.sourcingMemo}</p> : null}
                        {latestReview ? (
                          <p className="history">
                            최근 선정: {statusLabel(latestReview.selectionStatus)} · 점수{" "}
                            {latestReview.selectionScore} · 사유{" "}
                            {reasonCodes.length > 0 ? reasonCodes.join(", ") : "없음"}
                          </p>
                        ) : (
                          <p className="history">아직 선정 리뷰가 없습니다.</p>
                        )}
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
                    <SelectionReviewForm productId={product.id} />
                  </article>
                );
              })
            )}
          </section>
        </div>
      </section>

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

function parseReasonCodes(value: string) {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((code) => {
      const match = selectionReasonCodes.find((item) => item.value === code);
      return match?.label ?? String(code);
    });
  } catch {
    return [];
  }
}
