# P0 MVP Workflow Specification

## 1. Purpose

P0 is a beginner-friendly internal SOP system for running the early stages of an overseas purchasing-agency side business.

The current P0 does not generate AI listing drafts. The long-term AI detail page generation idea remains a later phase after the operating workflow is proven.

The P0 workflow is:

```text
sourcing session -> candidate product -> risk checklist -> margin estimate -> proceed/hold/exclude decision
```

An in-app manual pre-sourcing guide helps the operator prepare before creating a sourcing session. External keyword and product research remain manual and out of scope for automation.

## 2. P0 Workflow

1. Sourcing session
   - Operator records a category, domestic keyword, related keywords, sourcing platforms, strategy, manual demand observation, manual competition observation, target candidate count, and memo.

2. Candidate product intake
   - Operator registers candidate products under a sourcing session when applicable.
   - A product may also exist without a session for quick capture.

3. Beginner risk checklist
   - Operator checks structured risk flags such as food/health supplement, cosmetics, medical, electrical/KC, battery, children product, quarantine, IP/brand, counterfeit suspicion, restricted shipping, heavy/bulky, fragile, complex options, insufficient information, and high CS risk.

4. Conservative margin estimate
   - Operator manually enters pricing assumptions.
   - The app calculates total estimated cost, break-even price, recommended selling price, estimated net profit, and estimated margin rate.

5. Selection decision
   - Operator saves `proceed`, `hold`, or `exclude`.
   - Each save creates a new review history record.
   - Excluded products stay stored.

## 3. Data Concepts

- `sourcing_sessions`
  - Sourcing context: title, category, domestic keyword, related keywords, platforms, strategy, demand/competition observations, target count, memo.

- `products`
  - Candidate product identity, source data, optional sourcing session, cost/shipping fields, options memo, weight/volume estimate, current workflow status.

- `selection_reviews`
  - Review history: selection decision, demand/competition/price/sourcing judgments, risk checklist JSON, reason code JSON, margin assumptions, margin outputs, notes, timestamp.

## 4. Selection Review Fields

- `selection_status`: `proceed`, `hold`, `exclude`
- `demand_signal`: `high`, `medium`, `low`, `uncertain`
- `competition_level`: `low`, `medium`, `high`
- `price_attractiveness`: `good`, `uncertain`, `poor`
- `sourcing_difficulty`: `easy`, `medium`, `hard`
- `selection_score`: 0 to 100
- `risk_codes`
- `reason_codes`
- margin assumption fields
- margin output fields
- `price_competitiveness_memo`
- `reviewer_note`
- `reviewed_at`

## 5. Validation Rules

- `exclude` requires at least one reason code.
- `hold` requires either a reason code or reviewer note.
- Products can be created with or without a sourcing session.
- Existing products without `sourcingSessionId` remain valid.
- Status changes create new review records instead of overwriting previous decisions.

## 6. Out of Scope

- AI detail page generation
- Listing version storage
- Prompt templates
- CSV performance import
- Marketplace API integration
- Taobao/1688/Naver crawling
- Chrome extension
- Web clipper
- Authentication
- Deployment
- Analytics dashboard

## 7. Acceptance Tests

- A sourcing session can be created with required title and domestic keyword.
- Recent sourcing sessions show keyword/category and linked candidate count.
- A product can be created with or without a sourcing session.
- Product cards show linked session, source data, risk flags, margin summary, latest decision, and recent history.
- A risk checklist can be saved during product review.
- Margin assumptions and calculated outputs are saved.
- `exclude` cannot be saved without a reason.
- `hold` cannot be saved without a reason or note.
- Status filters still work.
