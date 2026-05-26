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
