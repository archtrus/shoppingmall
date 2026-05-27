# Task Log

## 2026-05-27

### Project Setup Context

- The project started from `preview.md`, a planning document for an internal overseas purchasing-agency operations tool.
- The core goal is not full automation. The goal is to collect operational data that can later improve AI-generated product detail pages.
- Important data loop:

```text
product candidate -> selection decision -> risk/margin review -> AI listing draft -> human edit -> later performance/CS feedback
```

### Planning Decisions

- Added a P0 product selection step between product intake and risk/margin review.
- Product selection is intentionally human-led in P0.
- P0 does not include automatic sourcing, external crawling, marketplace API integration, Chrome extension, or web clipper.
- The first usable milestone is:

```text
Register 10 product candidates and save proceed/hold/exclude decisions with reason codes.
```

### Documentation Added

- `AGENTS.md`
  - Project guidance for AI coding agents.
  - Defines P0 scope, deferred features, product principles, and collaboration notes.

- `P0_SPEC.md`
  - Implementation-facing P0 workflow specification.
  - Defines product intake, selection scoring, risk screening, margin review, listing generation, and human review.

- `schema.sql`
  - Executable reference schema for the P0 data model.
  - This is a reference artifact, not necessarily the final production DB source of truth.

### Git Setup

- Initialized Git in the project folder.
- Connected the repo to GitHub:

```text
https://github.com/archtrus/shoppingmall.git
```

- Initial commit pushed:

```text
b8d7726 docs: define P0 workflow and project guidance
```

### App Scaffold Implemented

Implemented a minimal Next.js app for the first recommended action:

```text
상품 후보 등록 + 목록 + 선정 상태 저장
```

Current stack:

- Next.js
- TypeScript
- React
- Prisma
- SQLite
- plain CSS

Key files added:

- `package.json`
- `app/page.tsx`
- `app/actions.ts`
- `app/layout.tsx`
- `app/globals.css`
- `components/product-form.tsx`
- `components/selection-review-form.tsx`
- `lib/prisma.ts`
- `lib/selection.ts`
- `prisma/schema.prisma`

### Implemented Features

- Product candidate creation form
  - source URL
  - source platform
  - original product name
  - translated product name
  - source cost
  - image URL
  - sourcing memo

- Product list
  - shows product title, translated title, source platform, cost, source link, memo, and latest selection review

- Product status filters
  - all
  - candidate
  - proceed
  - hold
  - exclude

- Selection review form per product
  - selection status: `proceed`, `hold`, `exclude`
  - demand signal
  - competition level
  - price attractiveness
  - sourcing difficulty
  - selection score
  - reason code checkboxes
  - reviewer note

- Validation rules in server action
  - `exclude` requires at least one reason code.
  - `hold` requires either a reason code or reviewer note.
  - Selection review is inserted as a new history record.
  - Product `currentStatus` is updated after selection review save.

### Verification Completed

Commands run successfully:

```text
npm run build
npm run lint
```

Browser verification completed on:

```text
http://localhost:3002
```

Verified:

- Product candidate can be created.
- Candidate appears in product list.
- Selection review can be saved.
- Product status updates to proceed.
- Proceed filter shows the product.

Note:

- Port `3000` was already in use, so Next.js used `3002`.

### Local Development Notes

- `.env` was created locally with:

```text
DATABASE_URL="file:./dev.db"
```

- `.env` is ignored by Git.
- `.env.example` is committed for setup reference.
- Local SQLite DB is ignored by Git.

### Prisma Notes

- `npm run prisma:generate` succeeded after network permission was available.
- `npm run db:push` initially failed with a blank schema engine error.
- A manual SQLite DB was briefly created to unblock local browser testing.
- A later `npm run db:push` synced the database successfully, but Prisma generate ended with an `EPERM` rename error while the dev server was holding the engine file.
- The app still built, linted, and worked locally.
- If continuing development, stop the dev server before rerunning:

```text
npm run db:push
npm run prisma:generate
```

### Dependency Notes

- `npm audit --omit=dev` reports 2 moderate vulnerabilities related to Next/PostCSS.
- `npm audit fix --force` would install a breaking Next version, so it was not run.
- Revisit after dependency versions stabilize or Next publishes a compatible fix.

### Current Dev Server

- A Next.js dev server was started in the background during verification.
- Logs were written to `dev.log` and `dev.err.log`.
- These log files are ignored by Git.
- If file locks or Prisma engine rename errors occur, stop the running Node/Next dev process first.

### Recommended Next Step

Continue from the first milestone:

1. Commit and push the current app scaffold.
2. Add a small seed or test fixture flow for faster local verification.
3. Improve selection review UX so the latest values are prefilled instead of resetting to defaults.
4. Add an explicit candidate detail page if the list card becomes too dense.
5. After 10 real candidate products are entered, decide whether to add risk screening or margin calculator next.

## 2026-05-27 P0 SOP Pivot

### Direction Change

- P0 was reframed from an AI listing data loop into a beginner-friendly purchasing-agency SOP workflow.
- AI detail page generation remains a long-term future phase.
- Current P0 now starts from sourcing sessions instead of assuming candidate products already exist.

Updated P0 workflow:

```text
sourcing session -> candidate product -> risk checklist -> margin estimate -> proceed/hold/exclude decision
```

### Documents Updated

- `AGENTS.md`
  - Reframed current priority around purchasing-agency SOP.
  - Moved AI listing generation, prompt templates, listing versions, crawling, APIs, auth, deployment, and analytics out of P0 scope.

- `P0_SPEC.md`
  - Rewritten around sourcing sessions, product candidates, risk checklist, margin estimate, and review history.

### App Changes

- Added `SourcingSession` model.
- Linked `Product` optionally to `SourcingSession`.
- Extended `Product` with:
  - `sourceShippingFee`
  - `optionsMemo`
  - `estimatedWeight`
  - `estimatedVolume`

- Extended `SelectionReview` with:
  - `riskCodesJson`
  - margin assumption fields
  - calculated margin output fields
  - `priceCompetitivenessMemo`

- Added sourcing session creation UI.
- Added recent sourcing sessions list with linked candidate count.
- Updated product creation form to optionally select a sourcing session.
- Added risk checklist to the review form.
- Added conservative margin inputs and server-side calculation.
- Updated product cards to show:
  - linked sourcing session
  - source cost and local source shipping fee
  - checked risk flags
  - margin summary
  - latest decision
  - recent review history

- Updated reason codes to purchasing-agency SOP language.
- Added `npm run seed` with:
  - 2 sample sourcing sessions
  - 5 sample products
  - sample review histories, risk flags, and margin summaries

### Commands Run

Passed:

```text
npm run prisma:generate
npm run db:push
npm run seed
npm run build
npm run lint
```

### Browser Verification

Verified on:

```text
http://localhost:3000
```

Checked:

- Created a sourcing session.
- Confirmed the created session appears in the product form selector and recent sessions list.
- Created a candidate product linked to that sourcing session.
- Confirmed linked session title/keyword appears on the product card.
- Saved a `hold` review with risk checklist and margin assumptions.
- Confirmed risk flags and margin outputs appear on the product card.
- Confirmed `exclude` without a reason code is blocked with validation message.

### Notes

- Local seed data was written to the ignored SQLite DB only.
- `source/` contains GPT research/planning notes and was intentionally left untouched.
- Dev logs remain ignored by Git.

### Next Recommended Small Step

Improve review ergonomics:

1. Prefill each review form with the latest saved review values.
2. Make margin assumptions easier to reuse from product cost fields.
3. Add a small “reset local seed data” note or command explanation for the user.

## 2026-05-27 Guided Workflow Tabs

### UI Direction

- The main page felt more like a dense board than a step-by-step SOP.
- Added a guided tab workflow with free tab navigation plus `이전` / `다음` buttons.

Current tabs:

```text
1. 소싱 세션
2. 후보 상품
3. 리스크·마진
4. 결정 이력
```

### App Changes

- Added `components/workflow-tabs.tsx`.
- Reorganized `app/page.tsx` into step panels while reusing existing forms and product cards.
- Kept status filter links in the `결정 이력` tab.
- Added workflow tab, step header, panel, and navigation button styles.
- Did not change Prisma models or server actions for this UI-only step.

### Commands Run

Passed:

```text
npm run build
npm run lint
```

### Browser Verification

Verified on:

```text
http://localhost:3000
```

Checked:

- Default view opens on `Step 1 / 4`.
- Direct tab click works.
- `다음` moves through all four steps.
- `이전` moves back from step 4 to step 3.
- `리스크·마진` tab shows the review form.
- `결정 이력` tab still shows status filters.

## 2026-05-27 SOP Flow Filter Fix

### Supervisor Review Follow-up

- Fixed the issue where status filtering could disrupt the guided SOP flow.
- Status filtering is now scoped to the `결정 이력` step.
- Candidate and risk/margin steps always show the full product list.

### App Changes

- `WorkflowTabs` now accepts `initialStep`.
- `?step=history` opens directly on the decision history step.
- Decision history filter links now use:

```text
/?step=history&status=selection_hold
```

- `app/page.tsx` now fetches:
  - `allProducts` for candidate and risk/margin steps
  - `historyProducts` for filtered decision history
- Product cards now show a short next-action hint:
  - 후보: 리스크·마진 검토 필요
  - 진행: 등록 준비 후보
  - 보류: 추가 확인 필요
  - 제외: 제외 사유 기록 완료
- Margin input labels now include clearer unit hints such as `(외화)`, `(원)`, and `%`.

### Commands Run

Passed:

```text
npm run build
npm run lint
```

### Browser Verification

Verified on:

```text
http://localhost:3000
```

Checked:

- Default URL opens on `Step 1 / 4`.
- `/?step=history&status=selection_hold` opens on `Step 4 / 4`.
- Hold-filtered decision history shows hold products and next-action hints.
- Candidate tab still shows products outside the selected status filter.
- Risk/margin tab still shows products outside the selected status filter.
- Margin fields show unit hints.

## 2026-05-27 Sourcing Session Usability Fix

### Human Test Preparation

- The user observed that recent sourcing sessions looked like static summary cards rather than a usable work list.
- Updated sourcing sessions so they can act as the starting point for candidate entry.

### App Changes

- Changed sourcing session category input to a dropdown.
- Added beginner-friendly category options such as:
  - 생활/수납
  - 주방/수납
  - 욕실/청소
  - 문구/사무
  - 취미/DIY
  - 반려동물/비식품
  - 차량용/비전기
  - 캠핑/소형소품
  - 패션잡화/저위험
  - 인테리어/소품
- Recent sourcing session cards now show status counts:
  - 진행
  - 보류
  - 제외
  - 후보
- Added `이 세션으로 후보 추가` link.
- Clicking the link opens the candidate product step and preselects that sourcing session in the product form.

### Commands Run

Passed:

```text
npm run build
npm run lint
```

### Browser Verification

Verified on:

```text
http://localhost:3000
```

Checked:

- Sourcing category is shown as a dropdown.
- Recent sourcing sessions show per-status counts.
- `이 세션으로 후보 추가` link navigates to `?step=candidates&session=...`.
- Candidate product form opens with the selected sourcing session preselected.

### Human Test Suggested

The user can now create a new sourcing session from the first tab, click `이 세션으로 후보 추가`, and add 2-3 realistic candidate products under that session to see whether the session card feels like a real work queue.

## 2026-05-27 Context Recovery and Review Prefill

### Context Recovery

- The previous chat history was lost from the active thread.
- Reconstructed the project state from `AGENTS.md`, `P0_SPEC.md`, `task_log.md`, and the current source files.
- Confirmed the current app is still the P0 SOP workflow:

```text
sourcing session -> candidate product -> risk checklist -> margin estimate -> proceed/hold/exclude decision
```

### App Change

- Improved review ergonomics by prefilling the risk/margin review form from the latest saved review.
- The review form now reuses latest status, judgment fields, score, checked risks/reasons, margin assumptions, and notes.
- If no review exists yet, the margin form starts from the product's source cost and local source shipping fee when available.
- The review form no longer clears immediately after a successful save, so the next server-rendered state remains useful for continued review.

### Commands Run

Passed:

```text
npm run build
npm run lint
```

### Browser Verification

- Attempted to verify with the Codex in-app browser.
- Localhost and 127.0.0.1 requests were blocked by the browser surface with `ERR_BLOCKED_BY_CLIENT`.
- No browser UI regression test was completed in this turn.

### Next Human Test

Build:
- Keep this change as the next small P0 ergonomics improvement.

Human test:
- Open the risk/margin step for a product that already has a saved review.
- Confirm the old selections, checked risks/reasons, margin inputs, and notes are already filled.
- Change only one or two fields and save another review.

Observe:
- Whether reviewing a held product again feels faster than retyping from scratch.
- Whether old notes being prefilled is helpful or whether it causes accidental copy-forward.

Decision after test:
- If prefill helps, keep it and add a small "copy latest assumptions" affordance later only if needed.
- If prefilled notes cause mistakes, keep numeric/checklist prefill but clear free-text notes by default.

## 2026-05-27 Session-Scoped Workflow UX

### User Test Feedback

- In the sourcing session tab, `이 세션으로 후보 추가` and `결정 이력 보기` sometimes moved tabs and sometimes did not.
- The candidate product tab was noisy because it listed every product instead of focusing on one sourcing session.
- The risk/margin tab was too dense because it showed every product review form at once.
- The sourcing platform field should be a dropdown and include Korean and Japanese platforms.

### App Changes

- Changed workflow tab navigation to URL-based links instead of local-only button state.
- Added sourcing platform dropdown options including:
  - 1688, Taobao, Tmall, AliExpress
  - Amazon Japan, Rakuten Japan, Yahoo Shopping Japan, Mercari Japan, Qoo10 Japan
  - Naver SmartStore, Coupang, 11st, Gmarket, Auction
- Changed sourcing session creation form to use a platform dropdown.
- Changed product candidate form to use a platform dropdown.
- Candidate tab now shows only products for the selected sourcing session.
- Candidate tab includes a session selector.
- Risk/margin tab now shows only one selected product.
- Risk/margin tab includes a product selector.

### Commands Run

Passed:

```text
npm run build
npm run lint
```

### Browser Verification

- The currently running local dev server on `localhost:3100` showed a stale Next.js runtime chunk error from `.next`.
- Code-level verification passed, but the local dev server should be restarted before human testing.

### Next Human Test

Build:
- Restart the dev server cleanly and test the session-scoped workflow.

Human test:
- In `소싱 세션`, click `이 세션으로 후보 추가`.
- Confirm the app opens `후보 상품` with that session selected.
- Register or inspect products and confirm only that session's products are visible.
- In `리스크·마진`, select one product and confirm only that product's review form is shown.

Observe:
- Whether moving from session to candidate feels predictable.
- Whether one-product review reduces visual clutter.
- Whether the platform dropdown has enough choices for realistic sourcing.

Decision after test:
- If this feels natural, keep the scoped views.
- If switching products is still slow, add quick previous/next product controls inside the risk/margin tab.

## 2026-05-27 Session-Scoped History and Review Selectors

### User Test Feedback

- In the sourcing session tab, `결정 이력 보기` should show the decision history for products in that session.
- Decision history also needs a sourcing-session dropdown, not only status filters.
- The risk/margin product dropdown will become too long as candidates grow.
- Product selection in risk/margin should first narrow by sourcing session, then choose a product.

### Review Judgment

- This is a valid P0 change because it reduces review friction before the user reaches the 10-candidate milestone.
- It does not add out-of-scope automation or marketplace integration.
- It preserves products without a sourcing session by keeping a `세션 없음` option.

### App Changes

- `결정 이력 보기` on each sourcing session now opens:

```text
/?step=history&session={sessionId}
```

- Decision history now has a sourcing-session dropdown with:
  - 전체 세션
  - 세션 없음
  - each sourcing session
- Existing status filters now preserve the selected history session.
- Risk/margin now has two dropdowns:
  - sourcing session
  - product within that selected session
- Risk/margin falls back to the first product in the selected session if an old product id no longer matches that session.

### Commands Run

Passed:

```text
npm run build
npm run lint
```

### Next Human Test

Build:
- Keep the session-scoped history and two-step product selection.

Human test:
- Click `결정 이력 보기` from a sourcing session card.
- Confirm only that session's products appear in decision history.
- Change status filters and confirm the session filter stays applied.
- In `리스크·마진`, select a session first, then select a product in that session.

Observe:
- Whether the history page now answers "what happened in this sourcing session?"
- Whether two dropdowns feel faster than one long product dropdown.

Decision after test:
- If this works, keep it until product count makes dropdowns insufficient.
- If dropdowns become slow after real use, replace product selection with searchable list or compact table.

## 2026-05-28 Supervisor Review and Next Plan

### Supervisor Review Summary

- No critical blocker was found for committing the current P0 workflow.
- The current direction is aligned with P0 because it supports a human-led purchasing-agency SOP instead of premature automation.
- Session-scoped candidate, review, and history views are valid because they reduce friction before the 10-candidate milestone.
- The main remaining operating risk is that `hold` products may not carry enough "what to check next" context when revisited later.
- Margin review is useful but may still feel difficult for a beginner because it asks for exchange rate, payment fee, international shipping, domestic shipping, marketplace fee, and buffer assumptions.
- Some repository documents and logs have visible Korean encoding corruption from prior terminal output. This does not block the app, but it should be cleaned up in a later documentation pass.

### Recommended Next Plan for GPT Review

Build:
- Add a small `hold` follow-up field or structured checklist so a held product clearly says what must be checked next.
- Add margin assumption defaults or a "reuse latest assumptions" flow so the operator does not retype common values every product.
- Keep the current P0 scope. Do not add automatic sourcing, crawling, marketplace APIs, AI detail page generation, auth, deployment, or analytics yet.
- Later, clean up Korean text corruption in `AGENTS.md`, `P0_SPEC.md`, and `task_log.md` if it becomes hard to use as project memory.

Human test:
- Create or reuse 2 sourcing sessions.
- Register 10 realistic candidate products across those sessions.
- Save decisions for all 10 products: proceed, hold, or exclude.
- Intentionally create at least 3 hold products, then revisit them the next day.

Observe:
- How many minutes it takes to review one product.
- Which margin fields cause hesitation or repeated lookup.
- Whether a held product clearly tells the operator what to verify next.
- Whether session-scoped decision history helps answer "what happened in this sourcing session?"
- Whether the two-step risk/margin selector still feels easy when product count grows.

Decision after test:
- If the 10-product loop feels usable, improve hold follow-up and margin defaults next.
- If input friction is too high, reduce required fields and make more fields optional or prefilled.
- If history review feels weak, add a compact session review summary before adding any new P1 feature.
- Do not move to AI listing/detail page generation until the sourcing, risk, margin, and decision loop has been tested with real candidates.

Prompt for GPT tomorrow:

```text
We are building a beginner-friendly internal SOP tool for an overseas purchasing-agency side business.

Current P0 workflow:
sourcing session -> candidate product -> risk checklist -> conservative margin estimate -> proceed/hold/exclude decision -> decision history

Current implemented state:
- Sourcing sessions can be created with category, domestic keyword, related keywords, platform, strategy, demand/competition observations, target candidate count, and memo.
- Products can optionally belong to a sourcing session.
- Candidate tab is scoped by sourcing session.
- Risk/margin tab uses two selectors: sourcing session first, then product.
- Decision history can be filtered by sourcing session and decision status.
- Every review save creates history.
- Exclude requires at least one reason code.
- Hold requires either a reason code or reviewer note.
- Risk checklist and conservative margin assumptions are saved on each review.

Supervisor review conclusion:
- Current direction is valid P0 and should be committed.
- Next likely improvement should focus on hold follow-up context and margin assumption reuse, not automation or AI listing generation.

Please review this plan:
1. Add structured "next check needed" fields for hold products.
2. Add reusable/default margin assumptions.
3. Test with 10 realistic products across 2 sourcing sessions.
4. Decide whether the next bottleneck is hold follow-up, margin input friction, or decision history summary.

Evaluate whether this is the right next step for a beginner purchasing-agency operator, and suggest the smallest useful implementation slice.
```
