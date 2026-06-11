# Service Catalog and Ownership: Release Plan

## Shipment Strategy

Ship this module in maturity order. Start with M1 inventory for identity and ownership, move to M2 observable for health and freshness, then M3 explainable for deterministic findings and AI triage. Only after those are reliable should the team ship M4 interactive workflows and M5 autonomous-assist investigation.

## Phase Counts

| Release Phase | Feature Rows |
| --- | --- |
| M1 inventory | 196 |
| M2 observable | 196 |
| M3 explainable | 392 |
| M4 interactive | 392 |
| M5 autonomous-assist | 196 |

## Priority Counts

| Priority | Feature Rows |
| --- | --- |
| P0 | 588 |
| P1 | 196 |
| P2 | 588 |

## Ship Size Counts

| Ship Size | Feature Rows |
| --- | --- |
| L | 196 |
| M | 784 |
| S | 392 |

## First P0 Vertical Slices

| Feature ID | Phase | Size | Service or Domain | Pillar | Workstream |
| --- | --- | --- | --- | --- | --- |
| 10-SERVICE-CATALOG-OWNERSHIP-00001 | M1 inventory | S | service profile | cost | inventory |
| 10-SERVICE-CATALOG-OWNERSHIP-00050 | M1 inventory | S | environment model | cost | inventory |
| 10-SERVICE-CATALOG-OWNERSHIP-00099 | M1 inventory | S | lifecycle status | cost | inventory |
| 10-SERVICE-CATALOG-OWNERSHIP-00029 | M1 inventory | S | service profile | security | inventory |
| 10-SERVICE-CATALOG-OWNERSHIP-00078 | M1 inventory | S | environment model | security | inventory |
| 10-SERVICE-CATALOG-OWNERSHIP-00127 | M1 inventory | S | lifecycle status | security | inventory |
| 10-SERVICE-CATALOG-OWNERSHIP-00008 | M1 inventory | S | service profile | resilience | inventory |
| 10-SERVICE-CATALOG-OWNERSHIP-00057 | M1 inventory | S | environment model | resilience | inventory |
| 10-SERVICE-CATALOG-OWNERSHIP-00106 | M1 inventory | S | lifecycle status | resilience | inventory |
| 10-SERVICE-CATALOG-OWNERSHIP-00149 | M2 observable | M | team ownership | cost | health |
| 10-SERVICE-CATALOG-OWNERSHIP-00198 | M2 observable | M | on-call mapping | cost | health |
| 10-SERVICE-CATALOG-OWNERSHIP-00247 | M2 observable | M | secondary owner | cost | health |

## Execution Rules

- Do not begin M5 autonomous-assist until deterministic evidence, RBAC, audit, and replay are implemented for the same service or domain.
- Every M4 action must support read-only preview or dry-run before mutation.
- Every cost-related P0 must include estimated impact, confidence, effort, risk, owner, and verification.
- Every security-related P0 must include permission scope, audit trail, suppression policy, and stale-data behavior.
- Every resilience or disaster-recovery P0 must include recovery evidence, drill path, RTO/RPO fields where relevant, and rollback or recovery notes.
