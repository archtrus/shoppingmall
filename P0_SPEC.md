# P0 MVP Workflow Specification

## 1. Purpose

P0 is an internal operating workflow for collecting product candidate data, selection decisions, risk/margin judgments, AI listing drafts, and human review edits.

The goal is not full purchasing-agency automation. The goal is to create a low-friction data loop:

```text
candidate product -> selection review -> risk review -> margin review -> AI listing draft -> human edit -> final decision
```

## 2. P0 Workflow

1. Product intake
   - Operator registers a candidate product with source URL, source platform, original name, translated name, cost, options, images, estimated weight/volume, and sourcing memo.

2. Product selection scoring
   - Operator decides whether the candidate is worth deeper review.
   - Status must be one of `proceed`, `hold`, or `exclude`.
   - `proceed` and `hold` products can continue to risk/margin review.
   - `exclude` products remain stored and are not deleted.

3. Risk screening
   - Operator records risk score, recommendation, required notices, review-required items, and reason codes.

4. Margin calculation
   - Operator records conservative pricing assumptions and calculated margin outputs.

5. Listing generation
   - AI generates the first draft for product name, SEO keywords, option description, detail page body, purchasing-agency notices, shipping notices, return/exchange notices, customs/tax notices, and FAQ.

6. Human review
   - Operator compares AI draft and edited version.
   - Operator saves approve/hold/reject/edit actions with reason codes.
   - Final registration copy is saved as a listing version.

## 3. Product Selection Review

### 3.1 Fields

- `selection_status`: `proceed`, `hold`, `exclude`
- `demand_signal`: `high`, `medium`, `low`, `uncertain`
- `competition_level`: `low`, `medium`, `high`
- `price_attractiveness`: `good`, `uncertain`, `poor`
- `sourcing_difficulty`: `easy`, `medium`, `hard`
- `selection_score`: integer from 0 to 100
- `reason_codes`: zero or more selection/exclusion reason codes
- `reviewer_note`: optional free text
- `reviewed_at`: review timestamp

### 3.2 Reason Codes

- `DEMAND_UNCERTAIN`: 수요 불확실
- `COMPETITION_HIGH`: 경쟁 과다
- `PRICE_NOT_COMPETITIVE`: 가격 경쟁력 부족
- `COST_OR_SHIPPING_UNFAVORABLE`: 원가/배송비 불리
- `OPTIONS_COMPLEX`: 옵션 복잡
- `INSUFFICIENT_IMAGES_OR_INFO`: 이미지/상세정보 부족
- `IP_OR_BRAND_RISK`: 브랜드/IP 우려
- `CERTIFICATION_OR_CUSTOMS_RISK`: 인증/통관 우려
- `CS_RISK_HIGH`: CS 위험 높음
- `OTHER`: 기타

### 3.3 Validation Rules

- `exclude` requires at least one `reason_code`.
- `proceed` requires `selection_score` to be recorded.
- `hold` requires either a `reason_code` or `reviewer_note`.
- Status changes must create a new selection review record instead of overwriting the previous one.

## 4. Minimal Data Concepts

- `products`
  - Candidate product identity, source data, current workflow status, and timestamps.

- `selection_reviews`
  - Product selection score, proceed/hold/exclude decision, structured reason codes, notes, and review timestamp.

- `risk_reviews`
  - Risk score, recommendation, required notices, manual review items, and reason codes.

- `margin_reviews`
  - Cost assumptions, recommended price, estimated net profit, margin rate, break-even price, sensitivity notes, and registration availability.

- `listing_versions`
  - AI draft, edited version, final listing copy, prompt version, template version, generation input snapshot, and creation timestamp.

- `review_actions`
  - Human approve/hold/reject/edit actions, reason codes, before/after content references, and action timestamp.

## 5. Acceptance Tests

- A candidate product can be registered.
- A selection review can be saved after candidate registration.
- Products can be filtered by `proceed`, `hold`, and `exclude`.
- An excluded product requires at least one reason code and remains stored.
- Only `proceed` and `hold` products can continue to risk screening and margin calculation.
- A product can move from `hold` to `proceed` through a new selection review record while preserving previous history.
- AI draft and human edited version are saved as separate listing version data.
