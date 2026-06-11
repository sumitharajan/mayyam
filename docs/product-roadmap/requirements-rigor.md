# Requirements Rigor Model

## Resource Definition of Done

Each cloud service, Kubernetes object, database domain, Kafka domain, and Linux host domain is not considered complete until it has:

1. Inventory: stable identity, provider/domain IDs, ownership, tags/labels, environment, region/zone/host, lifecycle state, and dependencies.
2. Telemetry: metrics, logs, events, freshness, sampling limits, collection failures, and retention policy.
3. Well-Architected score: cost, resilience, performance, scalability, security, disaster recovery, and operational excellence findings.
4. Deterministic triage: rule-based findings with reason codes, thresholds, raw evidence, severity, affected objects, and tests.
5. Agentic investigation: bounded tool registry, read-only default, token/time budgets, uncertainty labels, trace replay, and approval-gated mutations.
6. Resource interaction: inspect, compare, diagnose, dry-run, approve, execute, rollback-note, audit, and export.
7. Cost opportunity: monthly savings estimate, confidence, effort, risk, owner, verification step, and realized savings status.
8. Security controls: RBAC, credential scope, secret handling, audit trail, stale-data warnings, and suppressions.
9. DR and recovery: RTO/RPO fields where relevant, backup coverage, restore evidence, drill status, and recovery runbooks.
10. Reporting: API pagination, CSV/JSON export, saved views, ownership rollups, and executive summary.
11. Tests: unit evaluator tests, connector fixtures, API contract tests, UI workflow tests, and one negative path.
12. Operations: feature flag, collection health, backoff/rate-limit handling, retry policy, and support runbook.

## Maturity Levels

| Level | Meaning | Requirement |
| --- | --- | --- |
| M0 | Named | Resource exists only as a roadmap item. |
| M1 | Inventory | Resource can be discovered, stored, listed, and linked to owner/context. |
| M2 | Observable | Resource has metrics/logs/events with freshness and failure states. |
| M3 | Explainable | Resource has deterministic findings, scorecards, evidence, and tests. |
| M4 | Interactive | Resource has safe inspect/dry-run/action workflows with audit. |
| M5 | Autonomous-Assist | Resource supports bounded agentic investigation and approved remediation loops. |

## Acceptance Bar

For every backlog row, implementation should prove:

- Evidence exists and is visible.
- Deterministic logic runs without AI.
- AI output cites evidence and flags uncertainty.
- Mutations are impossible without approval unless explicitly configured otherwise.
- Cost impact is captured.
- The happy path and one failure path are tested.
- The user can export or share the result.

## Backlog Row Contract

Every generated CSV row is intended to be shippable. A row is not a vague capability label; it carries:

- Release phase: M1 inventory, M2 observable, M3 explainable, M4 interactive, or M5 autonomous-assist.
- Ship size: S, M, or L based on the operational risk and engineering scope.
- Vertical slice: data contract, collector or tool adapter, backend API, deterministic evaluator, UI, tests, docs, and runbook.
- API contract: authenticated endpoint behavior, pagination, freshness, audit IDs, error codes, and export support.
- Telemetry contract: collection health, freshness, evaluator counts, AI/tool counts, and action audit metrics.
- Test plan: unit, fixture, API contract, UI, and failure-path coverage.
- Rollout guardrail: feature flag, read-only mode first, permissions, rollback or disable instructions.
- Documentation/runbook: setup, permissions, limits, known failures, triage, approval path, and verification.

## Product Confirmation Questions

These are not blockers for the roadmap, but they should be confirmed before implementation:

- Should the Linux companion be installed as a systemd service, Docker container, single binary, or all three?
- Should Mayyam default to self-hosted/local-first control plane, SaaS, or hybrid?
- In v1, should agentic AI ever execute mutations automatically, or should every mutation require human approval?
- Which resource family should be the first flagship: AWS Well-Architected, Linux companion, MySQL/Postgres DBA copilot, Kubernetes operations, or Kafka operations?
- Should DigitalOcean/VPS support be a separate provider module or enter through the Linux companion first?
