# Reviewer Matrix

This matrix maps file areas to approver groups.

| Path | Required reviewer team | Why |
|---|---|---|
| `policy/template-versioning-policy.md` | `@fabrice-org/process-owners` | Process-level template governance |
| `policy/domain-repo-policy.md` | `@fabrice-org/governance-owners` | Domain policy control |
| `rulesets/*` | `@fabrice-org/platform-admins` | Platform enforcement settings |
| `sync-manifests/*` | `@fabrice-org/governance-owners` and `@fabrice-org/platform-admins` | Cross-repo rollout control |
