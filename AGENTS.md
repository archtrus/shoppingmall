# AGENTS.md

## Project Goal

This project is an internal operating tool for running an overseas product purchasing-agency workflow while collecting high-quality data for future AI-powered product detail page generation.

The project is not meant to fully automate purchasing-agency operations in the first version. Its core purpose is to create a practical data loop:

```text
product candidate -> selection decision -> risk/margin review -> AI listing draft -> human edit -> sales/CS feedback
```

The most important long-term asset is the relationship between:

- product candidate information
- initial selection/exclusion reasoning
- AI-generated listing drafts
- human edits and edit reasons
- final listing versions
- later sales and CS performance

## Current Priority

The current build target is the P0 MVP.

P0 workflow:

1. Product candidate intake
2. Product selection scoring
3. Risk screening
4. Conservative margin calculation
5. AI listing draft generation
6. Human review, edit, approve/hold/reject, and version storage

The first usable milestone should be smaller than the full P0:

```text
Register 10 product candidates and save proceed/hold/exclude decisions with reason codes.
```

After that, add listing draft and human-edited version storage for selected products.

## Product Principles

- Treat manual typing as friction. Prefer checkboxes, tags, select boxes, and structured inputs over long free-text fields.
- Do not delete excluded products. Exclusion reasons are valuable training and sourcing data.
- Record human review behavior as data, not just UI state.
- Store listing outputs as versions. A product may have multiple listing drafts, edits, and final copies.
- Prefer simple internal workflows over marketplace automation.
- Optimize first for a tool the operator can actually use repeatedly.

## P0 Scope

Include:

- URL/text/image-based product candidate registration
- Product selection scoring
- Selection status: `proceed`, `hold`, `exclude`
- Selection reason codes
- Risk checklist
- Conservative margin calculator
- Listing draft storage
- Human edited listing storage
- Review actions with reason codes

Defer:

- Automatic product sourcing
- Automatic keyword research
- External marketplace crawling
- Marketplace API integration
- Multi-market one-click registration
- Fulfillment/forwarder automation
- Chrome extension
- Web clipper
- Real-time sales API integration
- Kakao/AlimTalk automation

## Product Selection Model

Product selection happens between product intake and risk/margin review.

Selection fields:

- `selection_status`: `proceed`, `hold`, `exclude`
- `demand_signal`: `high`, `medium`, `low`, `uncertain`
- `competition_level`: `low`, `medium`, `high`
- `price_attractiveness`: `good`, `uncertain`, `poor`
- `sourcing_difficulty`: `easy`, `medium`, `hard`
- `selection_score`: 0 to 100
- `reason_codes`
- `reviewer_note`

Selection/exclusion reason codes:

- `DEMAND_UNCERTAIN`
- `COMPETITION_HIGH`
- `PRICE_NOT_COMPETITIVE`
- `COST_OR_SHIPPING_UNFAVORABLE`
- `OPTIONS_COMPLEX`
- `INSUFFICIENT_IMAGES_OR_INFO`
- `IP_OR_BRAND_RISK`
- `CERTIFICATION_OR_CUSTOMS_RISK`
- `CS_RISK_HIGH`
- `OTHER`

Rules:

- `exclude` requires at least one reason code.
- `hold` requires either a reason code or a reviewer note.
- Status changes should create review history instead of overwriting previous decisions.
- Only `proceed` and `hold` products should continue to risk and margin review.

## Suggested Technical Defaults

For the first app implementation, prefer:

- Next.js
- TypeScript
- SQLite for local MVP
- Prisma for schema and migrations
- Tailwind CSS
- shadcn/ui or simple accessible components

Do not add heavy infrastructure until the basic internal workflow works.

Start with local-first development. Authentication, deployment, cloud database, analytics, and external integrations can come later.

## Repository Documents

- `preview.md`: product vision, system design principles, and staged roadmap.
- `P0_SPEC.md`: implementation-facing P0 workflow and data concept specification.
- `schema.sql`: optional executable reference schema for the current P0 data model.

Keep these documents aligned when changing workflow or data model assumptions.

## Development Guidance

- Keep changes small and tied to the P0 workflow.
- Prefer behavior-level implementation over speculative abstractions.
- Do not introduce P1/P2/P3 features while implementing P0 unless explicitly requested.
- Use structured data models for statuses, reason codes, review actions, and listing versions.
- Preserve historical records where decisions or listing content change over time.
- Avoid building dashboards before there is enough real operating data.
- AI generation can be added after the draft/edit/version storage flow exists.

## Validation Checklist

Before considering P0 candidate selection complete, verify:

- A product candidate can be created.
- A selection review can be created for that product.
- Products can be filtered by `proceed`, `hold`, and `exclude`.
- Excluded products remain stored.
- Excluded products require at least one reason code.
- Hold products require either a reason code or note.
- A product can move from `hold` to `proceed` while preserving previous selection history.
- Only `proceed` and `hold` products can move into risk/margin review.

## Collaboration Notes

This is the user's first side project. When proposing next steps, keep them concrete, staged, and practical.

Favor explanations that clarify why a step matters:

- what it unlocks
- what risk it avoids
- how small the first milestone can be

Do not over-implement vague intent. If the user is asking a conceptual question, answer the question first instead of immediately expanding scope.
