# Postgres: Release Plan

## Shipment Strategy

Ship this module in maturity order. Start with M1 inventory for identity and ownership, move to M2 observable for health and freshness, then M3 explainable for deterministic findings and AI triage. Only after those are reliable should the team ship M4 interactive workflows and M5 autonomous-assist investigation.

## Phase Counts

| Release Phase | Feature Rows |
| --- | --- |
| M1 inventory | 266 |
| M2 observable | 266 |
| M3 explainable | 532 |
| M4 interactive | 532 |
| M5 autonomous-assist | 266 |

## Priority Counts

| Priority | Feature Rows |
| --- | --- |
| P0 | 798 |
| P1 | 1064 |

## Ship Size Counts

| Ship Size | Feature Rows |
| --- | --- |
| L | 266 |
| M | 1064 |
| S | 532 |

## First P0 Vertical Slices

| Feature ID | Phase | Size | Service or Domain | Pillar | Workstream |
| --- | --- | --- | --- | --- | --- |
| 05-POSTGRES-00001 | M1 inventory | S | pg_stat_activity | cost | inventory |
| 05-POSTGRES-00050 | M1 inventory | S | pg_stat_statements | cost | inventory |
| 05-POSTGRES-00099 | M1 inventory | S | pg_stat_database | cost | inventory |
| 05-POSTGRES-00029 | M1 inventory | S | pg_stat_activity | security | inventory |
| 05-POSTGRES-00078 | M1 inventory | S | pg_stat_statements | security | inventory |
| 05-POSTGRES-00127 | M1 inventory | S | pg_stat_database | security | inventory |
| 05-POSTGRES-00008 | M1 inventory | S | pg_stat_activity | resilience | inventory |
| 05-POSTGRES-00057 | M1 inventory | S | pg_stat_statements | resilience | inventory |
| 05-POSTGRES-00106 | M1 inventory | S | pg_stat_database | resilience | inventory |
| 05-POSTGRES-00149 | M2 observable | M | pg_stat_io | cost | health |
| 05-POSTGRES-00198 | M2 observable | M | pg_stat_wal | cost | health |
| 05-POSTGRES-00247 | M2 observable | M | pg_locks | cost | health |

## Execution Rules

- Do not begin M5 autonomous-assist until deterministic evidence, RBAC, audit, and replay are implemented for the same service or domain.
- Every M4 action must support read-only preview or dry-run before mutation.
- Every cost-related P0 must include estimated impact, confidence, effort, risk, owner, and verification.
- Every security-related P0 must include permission scope, audit trail, suppression policy, and stale-data behavior.
- Every resilience or disaster-recovery P0 must include recovery evidence, drill path, RTO/RPO fields where relevant, and rollback or recovery notes.
