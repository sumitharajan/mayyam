# MySQL AI Triager: Release Plan

## Shipment Strategy

Ship this module in maturity order. Start with M1 inventory for identity and ownership, move to M2 observable for health and freshness, then M3 explainable for deterministic findings and AI triage. Only after those are reliable should the team ship M4 interactive workflows and M5 autonomous-assist investigation.

## Phase Counts

| Release Phase | Feature Rows |
| --- | --- |
| M1 inventory | 231 |
| M2 observable | 231 |
| M3 explainable | 462 |
| M4 interactive | 462 |
| M5 autonomous-assist | 231 |

## Priority Counts

| Priority | Feature Rows |
| --- | --- |
| P0 | 693 |
| P1 | 924 |

## Ship Size Counts

| Ship Size | Feature Rows |
| --- | --- |
| L | 231 |
| M | 924 |
| S | 462 |

## First P0 Vertical Slices

| Feature ID | Phase | Size | Service or Domain | Pillar | Workstream |
| --- | --- | --- | --- | --- | --- |
| 03-MYSQL-AI-TRIAGER-00001 | M1 inventory | S | Performance Schema | cost | inventory |
| 03-MYSQL-AI-TRIAGER-00050 | M1 inventory | S | sys schema | cost | inventory |
| 03-MYSQL-AI-TRIAGER-00099 | M1 inventory | S | slow query log | cost | inventory |
| 03-MYSQL-AI-TRIAGER-00029 | M1 inventory | S | Performance Schema | security | inventory |
| 03-MYSQL-AI-TRIAGER-00078 | M1 inventory | S | sys schema | security | inventory |
| 03-MYSQL-AI-TRIAGER-00127 | M1 inventory | S | slow query log | security | inventory |
| 03-MYSQL-AI-TRIAGER-00008 | M1 inventory | S | Performance Schema | resilience | inventory |
| 03-MYSQL-AI-TRIAGER-00057 | M1 inventory | S | sys schema | resilience | inventory |
| 03-MYSQL-AI-TRIAGER-00106 | M1 inventory | S | slow query log | resilience | inventory |
| 03-MYSQL-AI-TRIAGER-00149 | M2 observable | M | digest statistics | cost | health |
| 03-MYSQL-AI-TRIAGER-00198 | M2 observable | M | wait events | cost | health |
| 03-MYSQL-AI-TRIAGER-00247 | M2 observable | M | InnoDB buffer pool | cost | health |

## Execution Rules

- Do not begin M5 autonomous-assist until deterministic evidence, RBAC, audit, and replay are implemented for the same service or domain.
- Every M4 action must support read-only preview or dry-run before mutation.
- Every cost-related P0 must include estimated impact, confidence, effort, risk, owner, and verification.
- Every security-related P0 must include permission scope, audit trail, suppression policy, and stale-data behavior.
- Every resilience or disaster-recovery P0 must include recovery evidence, drill path, RTO/RPO fields where relevant, and rollback or recovery notes.
