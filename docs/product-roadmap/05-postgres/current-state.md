# Postgres: Current State and Target State

## Product Mission

Reach parity with MySQL and then exceed it with Postgres-specific internals: pg_stat evidence, vacuum, WAL, replication, bloat, planner, security, backup, and managed-service posture.

## Current Maturity

early partial: backend analytics and prompt migration exist, but productized Postgres triage is pending

## What Exists Now

- Postgres analytics service exists with query stats, performance metrics, storage metrics, cost placeholders, and issue detection.
- Postgres triage prompts have a migration, and generic database connection/query/schema/analysis routes can call provider-specific analysis.
- The current product surface is less explicit than MySQL: no Postgres telemetry page, no Postgres triage component, and no Postgres-specific endpoint family.

## Gaps to Close

- No productized pg_stat dashboard, autovacuum/bloat workflow, WAL/replication view, or PITR restore drill support.
- No managed-service variants for RDS PostgreSQL, Aurora PostgreSQL, AlloyDB, Azure Database for PostgreSQL, or Cloud SQL for PostgreSQL.
- No Postgres-specific evidence contract for LLM triage with pg_stat_statements, pg_locks, pg_stat_io, and EXPLAIN artifacts.

## Source Modules Reviewed

- `backend/src/services/analytics/postgres_analytics/postgres_analytics_service.rs`
- `backend/migrations/017_postgres_triaging_prompts.sql`
- `_work/_done/milestone2/postgres-performance-analysis/postgres-performance-analysis.md`
- `frontend/src/pages/Databases.js`
- `frontend/src/components/database/`

## Target Operating Model

- One normalized resource identity per cloud service, Kubernetes object, database domain, or Kafka domain.
- Deterministic collectors produce evidence before any LLM summary is generated.
- Findings are scored by pillar: cost, resilience, performance, scalability, security, disaster-recovery, operational-excellence.
- Each resource supports deterministic triage and bounded agentic investigation as separate workflows.
- Each resource can be inspected and, where safe, interacted with through dry-run, approval, execution, audit, and rollback-note flows.
- Cost is not only visible; cost opportunities must be quantified, prioritized, and verified.
- Recommendations link back to raw evidence, ownership, suppression state, and implementation history.
- Remediation is dry-run first, approval-gated, audited, reversible where possible, and tested.
- Executive reports aggregate posture by account, cluster, service, Linux host, team, environment, application, and business unit.

## Backlog Size

This folder contains 1,862 implementation-ready feature rows in `feature-backlog.csv`.
