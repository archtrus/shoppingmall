# AGENTS.md

## Project Goal

This project is a beginner-friendly internal SOP tool for running a small overseas purchasing-agency side business.

The long-term vision is to learn enough from real operation to later explore an AI product detail page generation service. That AI service is a future phase, not the current P0 priority.

Current P0 focuses on the operating workflow before listing generation:

```text
sourcing session -> candidate product -> risk checklist -> margin estimate -> proceed/hold/exclude decision
```

## Current Priority

P0 is the minimum internal operating system that lets a beginner operator:

1. Create sourcing sessions.
2. Define category, domestic keyword, related keywords, platform, and strategy.
3. Record manual demand and competition observations.
4. Add candidate products under a sourcing session.
5. Check beginner purchasing-agency risks.
6. Estimate conservative margin manually.
7. Decide `proceed`, `hold`, or `exclude`.
8. Preserve review history.

The first usable milestone is:

```text
Create sourcing sessions and review 10 candidate products with risk, margin, and structured decision reasons.
```

## Product Principles

- Treat manual typing as friction. Prefer checkboxes, selects, and structured fields.
- The app is an SOP support tool, not a marketplace automation tool.
- Do not delete excluded products. Exclusion reasons are important operating data.
- Preserve review history when a product moves from `hold` to `proceed`.
- Keep the main workflow simple enough to use during real product research.
- AI detail page generation should wait until sourcing, risk, and margin workflow is stable.

## P0 Scope

Include:

- Sourcing session creation
- Manual category/keyword/platform/strategy notes
- Product candidate registration
- Optional product-to-session linking
- Beginner risk checklist
- Conservative margin estimate
- Selection status: `proceed`, `hold`, `exclude`
- SOP-oriented reason codes
- Recent decision history

Defer:

- AI listing generation
- Listing version storage
- AI prompt templates
- CSV performance import
- Automatic sourcing
- External crawling
- Keyword research API integration
- Marketplace API integration
- SmartStore/Coupang integration
- Chrome extension
- Web clipper
- Fulfillment or forwarder automation
- Authentication
- Deployment
- Payment
- Kakao/AlimTalk automation
- Analytics dashboard

## Data Model Guidance

- Keep `SourcingSession` simple. Do not normalize keywords, categories, or platforms yet.
- `Product` may optionally belong to a `SourcingSession`; existing products without a session remain valid.
- Store checklist values as JSON text when that keeps the app simpler.
- Store risk flags, margin assumptions, margin outputs, reason codes, and reviewer notes on each review record.
- Every review save should create a new history record instead of overwriting earlier judgment.

## Reason Codes

Use beginner-readable operational reason codes:

- `DEMAND_UNCERTAIN`
- `COMPETITION_HIGH`
- `PRICE_NOT_COMPETITIVE`
- `MARGIN_TOO_LOW`
- `SHIPPING_COST_RISK`
- `HEAVY_OR_BULKY`
- `FRAGILE_RISK`
- `OPTIONS_COMPLEX`
- `INSUFFICIENT_IMAGES_OR_INFO`
- `IP_OR_BRAND_RISK`
- `CERTIFICATION_OR_CUSTOMS_RISK`
- `FOOD_COSMETICS_MEDICAL_RISK`
- `ELECTRICAL_OR_BATTERY_RISK`
- `CUSTOMS_OR_SHIPPING_RESTRICTED`
- `CS_RISK_HIGH`
- `OTHER`

Rules:

- `exclude` requires at least one reason code.
- `hold` requires either a reason code or reviewer note.
- `proceed`, `hold`, and `exclude` decisions must remain in history.

## Suggested Technical Defaults

- Next.js
- TypeScript
- SQLite for local MVP
- Prisma for schema and migrations
- Plain CSS or simple accessible components

Avoid adding heavy infrastructure until the local SOP workflow works.

## Repository Documents

- `preview.md`: early product vision and system design notes.
- `P0_SPEC.md`: implementation-facing P0 SOP specification.
- `task_log.md`: current implementation history and next-step context.
- `source/`: external planning and research notes from GPT.
- `skills/purchase-agent-supervisor/`: project-local supervisor review skill.

Keep `AGENTS.md`, `P0_SPEC.md`, and `task_log.md` aligned when the workflow changes.

## Local Review Skills

This project has a local, explicit-call-only review skill.

When the user says "슈퍼바이저 리뷰", "purchase-agent-supervisor로 리뷰", or asks for a purchasing-agency business/product/operation review, read and follow:

```text
skills/purchase-agent-supervisor/SKILL.md
```

For detailed review criteria, also read:

```text
skills/purchase-agent-supervisor/references/purchase_agent_supervisor.md
```

Do not treat this as an automatic trigger. Use it only when the user explicitly asks for that supervisor review mode.

## Collaboration Notes

This is the user's first side project. Keep next steps small, concrete, and practical.

When the user asks conceptual questions, answer the question first before expanding implementation scope.

## Human-in-the-Loop Next Actions

When proposing next actions, do not frame them only as software implementation tasks.

Every next-step recommendation should include both:

- what Codex or a developer should build or adjust
- what the user should manually test in the real purchasing-agency workflow

For this project, progress is validated by actual operator behavior, not only by passing builds.

Good next-action recommendations should answer:

- What should be implemented next?
- What should the user try with real or realistic product candidates?
- What observation will tell us whether the feature is useful?
- What friction should the user watch for?
- What decision does the test unlock?

Default format for next actions:

```text
Build:
- ...

Human test:
- ...

Observe:
- ...

Decision after test:
- ...
```

Avoid suggesting P1 features only because they are technically easy. Move beyond P0 only after the user has tested the P0 loop with real candidate products and has observed repeated friction or a clear next bottleneck.
