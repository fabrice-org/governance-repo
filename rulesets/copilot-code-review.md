# Copilot Code Review Ruleset

Scope: `governance-repo` (the admin repository), default branch.

## Intent

- Automatically request a **GitHub Copilot code review** on every pull request
  that targets the default branch.
- Copilot's review is **advisory** — it posts inline comments and a summary. It
  does not block merges on its own; pair it with required reviews / status
  checks if you want a hard merge gate.

## Where it is enforced

Implemented as a Safe-Settings ruleset, so the policy lives in code and is
applied on sync:

- Config: `.github/safe-settings/organizations/fabrice-org/repos/governance-repo.yml`
- Ruleset name: `copilot-code-review`
- Rule type: `copilot_code_review`

## Behaviour notes

- Draft PRs are not reviewed until they are marked ready
  (`review_draft_pull_requests: false`).
- Only the initial pull request is reviewed, not each subsequent push
  (`review_on_push: false`), to keep Copilot premium-request usage predictable.
- Requires an active Copilot subscription with code review available to the PR
  author.
