---
name: github-project-triage
description: >-
  Triage GitHub issues and PRs into maintainer-facing item cards and sort them
  into autonomous / needs-owner / defer buckets. Use when asked to "triage" a
  repo or the backlog, or as the first step of the maintainer-orchestrator loop.
  Defaults to the current repo; only goes org-wide when explicitly told ("all",
  "broad", "org-wide").
---

# GitHub Project Triage

Turn an open queue into decisions. Triage produces **item cards** a maintainer
can act on, then sorts them so the orchestrator knows what to do.

## Scope

- If invoked inside a Git repo with a GitHub remote (or a Routine cloned a
  specific repo), triage **only that repo**.
- Only broaden to multiple repos / the whole `ITSEZMONEY` org when the prompt
  explicitly says `all`, `broad`, `org-wide`, or `everything`.

## Discover the queue

Use the **GitHub MCP connector** (preferred) or `gh`:
- Open PRs (with CI status, requested reviewers, draft state, mergeability).
- Open issues (with labels, age, last activity).
- For each, the last few comments and the CI job summary.

There is no `repobar` dependency — query GitHub directly. Batch reads where the
connector allows it; don't fetch full logs until an item needs them.

## Item card

For every open issue/PR, produce:

| Field | What to capture |
| --- | --- |
| **URL / #** | Direct link. |
| **What** | One line: what this issue/PR is. |
| **Why it matters** | Impact / who it affects. |
| **Author trust** | Org member · trusted bot (Dependabot/Renovate) · returning contributor · first-time / unknown. State the signal, not a vibe. |
| **Type** | bug · feature · dependency · security · docs · chore |
| **Fit** | good / mixed / poor + one-line reason (does it match the product?). |
| **Risk** | low / medium / high + blast radius (what breaks if wrong). |
| **Proof** | CI state · local repro · test coverage · manual/E2E validation. |
| **Blockers** | Missing repro, failing CI, needs decision, needs creds, merge conflict. |
| **Next action** | The single concrete next step. |

Trust informs **review depth, not correctness** — a trusted author still needs
green CI and a sane diff; an unknown author with a perfect, tested patch can
still land. Cite factual signals (account age, prior merged PRs, review history)
rather than impressions.

## Risk heuristics (ITSEZMONEY / gate-slip context)

Treat as **high risk** anything touching: auth/Passport/OAuth, payments/Stripe,
`certificates/` or any key/secret, DB schema or migrations (`shared/schema.ts`),
the parsing pipeline's output shape (`flightDataSchema`, the dual-AI parsers),
or CI/release/`.env` config. Treat docs, copy, tests, lockfile/dep bumps, and
formatting as **low risk**.

## Buckets

Sort every card into exactly one:

1. **Autonomous** — fixable without product input. Note a confidence level and
   why it's safe. (The orchestrator's autonomy policy decides land-vs-draft.)
2. **Needs owner** — blocked on a decision, direction, missing credentials, or
   high-risk surface. State the exact decision required and the options.
3. **Defer / close** — stale, duplicate, superseded, or out of scope. Give the
   reason and the canonical item if it's a duplicate.

## Output

Group the cards by bucket, most actionable first. Keep each card to a few lines.
End with a one-line tally (`N autonomous · M needs-owner · K defer`). When run as
the orchestrator's first step, hand this structured result back rather than
printing a wall of text.
