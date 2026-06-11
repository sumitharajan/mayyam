# MySQL AI Triager: Current State and Target State

## Product Mission

Turn MySQL telemetry into evidence-grounded DBA triage, safe recommendations, regression detection, and repeatable performance operations.

## Current Maturity

medium partial: real telemetry, deterministic signals, and LLM summary exist, but it is not yet a full DBA copilot

## What Exists Now

- MySQL telemetry endpoints, history, signals, performance analysis, and AI triage workflows for performance, connections, and index advice exist.
- The implementation uses deterministic collectors/signals plus LLM prompts rather than an autonomous tool loop.
- Telemetry snapshots and prompt compatibility migrations exist, which is the right foundation for evidence-grounded triage.

## Gaps to Close

- Triage follow-ups are UI placeholders and there is no saved DBA investigation workspace.
- No full remediation planner for indexes, parameters, connection pools, replication, backup/restore, or RDS/Aurora-specific actions.
- No benchmark baseline, workload replay, SLO, or regression detection workflow tied to application releases.

## Source Modules Reviewed

- `backend/src/services/analytics/mysql_analytics/mysql_analytics_service.rs`
- `backend/src/services/analytics/mysql_analytics/mysql_telemetry.rs`
- `backend/src/services/analytics/mysql_analytics/mysql_signals.rs`
- `backend/src/controllers/ai.rs`
- `backend/migrations/015_mysql_triaging_prompts.sql`
- `backend/migrations/021_mysql_telemetry_snapshots.sql`
- `frontend/src/components/database/MySqlTriage.js`
- `frontend/src/components/database/MySqlTelemetry.js`

## Target Operating Model

- One normalized resource identity per cloud service, Kubernetes object, database domain, or Kafka domain.
- Each backlog row is a shippable vertical slice with release phase, size, API contract, telemetry, tests, rollout guardrail, and runbook documentation.
- Deterministic collectors produce evidence before any LLM summary is generated.
- Findings are scored by pillar: cost, resilience, performance, scalability, security, disaster-recovery, operational-excellence.
- Each resource supports deterministic triage and bounded agentic investigation as separate workflows.
- Each resource can be inspected and, where safe, interacted with through dry-run, approval, execution, audit, and rollback-note flows.
- Cost is not only visible; cost opportunities must be quantified, prioritized, and verified.
- Recommendations link back to raw evidence, ownership, suppression state, and implementation history.
- Remediation is dry-run first, approval-gated, audited, reversible where possible, and tested.
- Executive reports aggregate posture by account, cluster, service, Linux host, team, environment, application, and business unit.

## Backlog Size

This folder contains 1,617 implementation-ready feature rows in `feature-backlog.csv`.
