# Dashboard and Query Workbench: Release Plan

## Shipment Strategy

Ship this module in maturity order. Start with M1 inventory for identity and ownership, move to M2 observable for health and freshness, then M3 explainable for deterministic findings and AI triage. Only after those are reliable should the team ship M4 interactive workflows and M5 autonomous-assist investigation.

## Phase Counts

| Release Phase | Feature Rows |
| --- | --- |
| M1 inventory | 161 |
| M2 observable | 161 |
| M3 explainable | 322 |
| M4 interactive | 322 |
| M5 autonomous-assist | 161 |

## Priority Counts

| Priority | Feature Rows |
| --- | --- |
| P0 | 483 |
| P1 | 161 |
| P2 | 483 |

## Ship Size Counts

| Ship Size | Feature Rows |
| --- | --- |
| L | 161 |
| M | 644 |
| S | 322 |

## First P0 Vertical Slices

| Feature ID | Phase | Size | Service or Domain | Pillar | Workstream |
| --- | --- | --- | --- | --- | --- |
| 28-DASHBOARD-QUERY-WORKBENCH-00001 | M1 inventory | S | widget library | cost | inventory |
| 28-DASHBOARD-QUERY-WORKBENCH-00050 | M1 inventory | S | metric query builder | cost | inventory |
| 28-DASHBOARD-QUERY-WORKBENCH-00099 | M1 inventory | S | log query builder | cost | inventory |
| 28-DASHBOARD-QUERY-WORKBENCH-00029 | M1 inventory | S | widget library | security | inventory |
| 28-DASHBOARD-QUERY-WORKBENCH-00078 | M1 inventory | S | metric query builder | security | inventory |
| 28-DASHBOARD-QUERY-WORKBENCH-00127 | M1 inventory | S | log query builder | security | inventory |
| 28-DASHBOARD-QUERY-WORKBENCH-00008 | M1 inventory | S | widget library | resilience | inventory |
| 28-DASHBOARD-QUERY-WORKBENCH-00057 | M1 inventory | S | metric query builder | resilience | inventory |
| 28-DASHBOARD-QUERY-WORKBENCH-00106 | M1 inventory | S | log query builder | resilience | inventory |
| 28-DASHBOARD-QUERY-WORKBENCH-00149 | M2 observable | M | trace query builder | cost | health |
| 28-DASHBOARD-QUERY-WORKBENCH-00198 | M2 observable | M | topology widget | cost | health |
| 28-DASHBOARD-QUERY-WORKBENCH-00247 | M2 observable | M | cost widget | cost | health |

## Execution Rules

- Do not begin M5 autonomous-assist until deterministic evidence, RBAC, audit, and replay are implemented for the same service or domain.
- Every M4 action must support read-only preview or dry-run before mutation.
- Every cost-related P0 must include estimated impact, confidence, effort, risk, owner, and verification.
- Every security-related P0 must include permission scope, audit trail, suppression policy, and stale-data behavior.
- Every resilience or disaster-recovery P0 must include recovery evidence, drill path, RTO/RPO fields where relevant, and rollback or recovery notes.
