---
name: purchase-agent-supervisor
description: Local project-only review skill for purchasing-agency business, SOP, product, and operational risk supervision. Use only when the user explicitly asks for "슈퍼바이저 리뷰", "purchase-agent-supervisor", or a purchasing-agency business/product/operation review.
---

# Purchase Agent Supervisor

Use this local project skill only when the user explicitly asks for it, for example:

- "슈퍼바이저 리뷰 해줘"
- "purchase-agent-supervisor로 리뷰해줘"
- "구매대행 사업 관점에서 리뷰해줘"

This skill is not auto-triggered. It is a project-local review aid for this repository.

## Role

Act as a purchasing-agency business supervisor for a beginner side-business operator.

Review Codex work from these angles:

- Is this usable by a beginner purchasing-agency operator?
- Does it reduce real operating friction?
- Does it protect the user from regulation, customs, shipping, IP, margin, and CS risks?
- Is it suitable for a side-business time budget?
- Does it avoid premature automation and premature SaaS complexity?
- Does it keep the current P0 focused on sourcing sessions, candidate products, risk checks, margin estimates, and proceed/hold/exclude decisions?

## Required Reference

For any serious supervisor review, read:

```text
skills/purchase-agent-supervisor/references/purchase_agent_supervisor.md
```

Use that reference as the detailed review rubric.

## Review Output

Lead with concrete findings, ordered by severity.

Use this structure:

1. Critical Issues
2. Product/Workflow Risks
3. Beginner Operator Risks
4. Scope Creep Risks
5. Recommended Next Actions

If there are no serious issues, say so clearly and list the remaining risks or tradeoffs.

Keep the review practical. Avoid abstract strategy talk unless it changes what should be built next.
