# MySQL AI Triager

Turn MySQL telemetry into evidence-grounded DBA triage, safe recommendations, regression detection, and repeatable performance operations.

## Where We Are

- MySQL telemetry endpoints, history, signals, performance analysis, and AI triage workflows for performance, connections, and index advice exist.
- The implementation uses deterministic collectors/signals plus LLM prompts rather than an autonomous tool loop.
- Telemetry snapshots and prompt compatibility migrations exist, which is the right foundation for evidence-grounded triage.

## Where We Should Be

- Triage follow-ups are UI placeholders and there is no saved DBA investigation workspace.
- No full remediation planner for indexes, parameters, connection pools, replication, backup/restore, or RDS/Aurora-specific actions.
- No benchmark baseline, workload replay, SLO, or regression detection workflow tied to application releases.

## Files

- `current-state.md` explains source modules reviewed, current maturity, gaps, and target operating model.
- `capability-map.md` lists the service/domain coverage and feature-row counts.
- `epics.md` breaks delivery into implementation slices.
- `feature-backlog.csv` contains 1,617 implementation-ready feature rows with release phase, ship size, API contract, tests, rollout guardrail, and runbook scope.

## Build Order

1. Normalize resource/domain identity and evidence contracts.
2. Add deterministic rule packs for P0 pillars: cost, security, resilience.
3. Add scorecards, trend storage, and UI drilldowns.
4. Add evidence-grounded AI triage.
5. Add bounded agentic investigation with read-only tools first.
6. Add dry-run remediation, approvals, and audit history.
7. Add reports, export, notifications, and organization-level rollups.
