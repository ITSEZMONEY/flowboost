# Maintainer Loop (cloud)

A self-running maintenance loop for ITSEZMONEY repos: wake on a trigger → triage
issues/PRs/CI → land low-risk work autonomously → escalate the rest → record
state in a ledger issue. Built on two committed skills and **Claude Code
Routines** (Anthropic's cloud automation), so it keeps running with no laptop
open.

- Playbook: [`.claude/skills/maintainer-orchestrator`](../.claude/skills/maintainer-orchestrator/SKILL.md)
- Triage: [`.claude/skills/github-project-triage`](../.claude/skills/github-project-triage/SKILL.md)

## How it maps to "wake every 5 min, direct work to threads"

| Your model | Cloud equivalent |
| --- | --- |
| Always-on driver | A **Routine** on Anthropic's cloud (no laptop). |
| Wake every N minutes | Routine **trigger** (schedule / GitHub event / API). |
| Triage + classify | `github-project-triage` skill. |
| Direct work to threads | Orchestrator fans out per-repo work with the `Agent` tool; mutations stay on one thread. |
| Some work lands autonomously | Routines run with **no permission prompts**; autonomy policy gates what merges. |
| Steer / report | The `🤖 Maintainer Loop — Ledger` issue (durable across runs). |

## ⚠️ Cadence reality check

Claude Code Routine **scheduled** triggers have a **one-hour minimum** — a true
"every 5 minutes" schedule is rejected. Pick a trigger based on how reactive you
need to be:

| Want | Use | Notes |
| --- | --- | --- |
| Steady backlog sweeps | **Scheduled** trigger | Hourly is the floor; daily/weeknightly is usually plenty and cheaper. |
| Real-time on PRs/releases | **GitHub event** trigger | Fires on `pull_request.*` / `release.*` — the closest thing to "instant". Subject to per-account hourly caps. |
| Literal 5-minute polling | **API** trigger + external pinger | Your own cron/codex driver POSTs to the routine's `/fire` endpoint every 5 min. This is where a 5-min cadence actually lives. |

You can attach **several triggers to one routine** — e.g. hourly sweep *plus*
react to every new PR *plus* an API endpoint your driver can poke.

## Setup (once per loop)

Routines can't be created from inside a web session or via API — create them in
the UI or with `/schedule` from a local CLI.

1. **Commit the skills.** They must live in the repo(s) the routine clones —
   that's what this PR does. The fan-out script (below) copies them to every
   ITSEZMONEY repo.
2. **Create the routine** at <https://claude.ai/code/routines> → **New routine**:
   - **Repositories:** select the repos to maintain. One routine can clone
     several, so a single org-maintainer routine can sweep them all in one run.
   - **Environment:** `Default` (Trusted network) is fine. Add `DATABASE_URL`,
     `ANTHROPIC_API_KEY`, etc. only if a run needs to actually build/run the app.
   - **Connectors:** keep **GitHub**; drop the rest unless a run needs them.
   - **Permissions:** enable **Allow unrestricted branch pushes** only if you
     want it to push to existing branches; PR-merge of low-risk items works
     without it.
   - **Prompt:** paste the kickoff prompt below.
   - **Trigger:** pick from the cadence table above.
3. **Run now** once to seed the ledger issue and confirm behavior, then let the
   trigger drive it.

> Identity note: a routine acts as **you** — commits, PRs, and merges carry your
> GitHub user, and it draws down your account's usage + daily routine-run cap.

### Kickoff prompt (paste into the routine)

```
Load the maintainer-orchestrator skill and run one maintenance pass over every
repository cloned for this run. Follow the skill's loop and autonomy policy
exactly: triage, read/update the "🤖 Maintainer Loop — Ledger" issue, AUTO-MERGE
only low-risk items (green CI; deps/docs/tests/lockfile/formatting; small diff;
no auth/payments/certs/schema/CI/secrets; trusted author), open DRAFT PRs and
label `needs-owner` for everything else, defer/close stale or duplicate items,
then summarize the run in the ledger. Do not make product, pricing, or
architecture decisions. When in doubt, escalate instead of merging.
```

## Autonomy policy (summary)

Authorized level: **auto-merge low-risk**. Full rules in the orchestrator skill.

- **Auto-merge** (squash) only when *all* hold: CI green · change is
  deps/docs/tests/lockfile/formatting/safe-config · small bounded diff · touches
  none of {auth, Stripe, `certificates/`, schema/migrations, CI/release, `.env*`,
  secrets} · trusted author or loop-authored · no unresolved change requests.
- **Draft PR + `needs-owner`** for anything else — bugs with real logic, features,
  protected surfaces, big diffs, untrusted authors, uncertain CI, any ambiguity.
- **Never** touch certs/keys/secrets, force-push protected branches, or close an
  item under active discussion.

## Fan out to all repos

```bash
# Copy the skills + this runbook into every ITSEZMONEY repo and open a PR each.
scripts/fanout-maintainer-skills.sh                 # all org repos (needs gh + perms)
scripts/fanout-maintainer-skills.sh repo-a repo-b   # just these
```

The script is idempotent — re-running it updates the skills on the branch and
refreshes the PR. After it runs, add each repo to your maintainer routine (or
give each its own routine).

## Alternative: GitHub Actions (true 5-min, BYO key)

If you'd rather not depend on Routines for sub-hour cadence, a scheduled Action
(`on: schedule: cron`, 5-min floor) can run the Claude Code GitHub Action with
the same kickoff prompt and an `ANTHROPIC_API_KEY` secret. It's more setup and
burns Action minutes + API spend per repo, so prefer Routines unless you need
the tighter cadence in CI. See <https://code.claude.com/docs/en/github-actions>.

## References

- Routines / scheduled tasks: <https://code.claude.com/docs/en/web-scheduled-tasks>
- Claude Code on the web: <https://code.claude.com/docs/en/claude-code-on-the-web>
- Skills: <https://code.claude.com/docs/en/skills>
