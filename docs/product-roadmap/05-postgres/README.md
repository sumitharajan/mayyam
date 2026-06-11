# Postgres

Reach parity with MySQL and then exceed it with Postgres-specific internals: pg_stat evidence, vacuum, WAL, replication, bloat, planner, security, backup, and managed-service posture.

## Where We Are

- Postgres analytics service exists with query stats, performance metrics, storage metrics, cost placeholders, and issue detection.
- Postgres triage prompts have a migration, and generic database connection/query/schema/analysis routes can call provider-specific analysis.
- The current product surface is less explicit than MySQL: no Postgres telemetry page, no Postgres triage component, and no Postgres-specific endpoint family.

## Where We Should Be

- No productized pg_stat dashboard, autovacuum/bloat workflow, WAL/replication view, or PITR restore drill support.
- No managed-service variants for RDS PostgreSQL, Aurora PostgreSQL, AlloyDB, Azure Database for PostgreSQL, or Cloud SQL for PostgreSQL.
- No Postgres-specific evidence contract for LLM triage with pg_stat_statements, pg_locks, pg_stat_io, and EXPLAIN artifacts.

## Files

- `current-state.md` explains source modules reviewed, current maturity, gaps, and target operating model.
- `capability-map.md` lists the service/domain coverage and feature-row counts.
- `epics.md` breaks delivery into implementation slices.
- `release-plan.md` orders the backlog by maturity phase, priority, ship size, and first P0 vertical slices.
- `feature-backlog.csv` contains 1,862 implementation-ready feature rows with release phase, ship size, API contract, tests, rollout guardrail, and runbook scope.

## Build Order

1. Normalize resource/domain identity and evidence contracts.
2. Add deterministic rule packs for P0 pillars: cost, security, resilience.
3. Add scorecards, trend storage, and UI drilldowns.
4. Add evidence-grounded AI triage.
5. Add bounded agentic investigation with read-only tools first.
6. Add dry-run remediation, approvals, and audit history.
7. Add reports, export, notifications, and organization-level rollups.
