# Kubernetes Cost Allocation: Release Plan

## Shipment Strategy

Ship this module in maturity order. Start with M1 inventory for identity and ownership, move to M2 observable for health and freshness, then M3 explainable for deterministic findings and AI triage. Only after those are reliable should the team ship M4 interactive workflows and M5 autonomous-assist investigation.

## Phase Counts

| Release Phase | Feature Rows |
| --- | --- |
| M1 inventory | 140 |
| M2 observable | 140 |
| M3 explainable | 280 |
| M4 interactive | 280 |
| M5 autonomous-assist | 140 |

## Priority Counts

| Priority | Feature Rows |
| --- | --- |
| P0 | 420 |
| P1 | 140 |
| P2 | 420 |

## Ship Size Counts

| Ship Size | Feature Rows |
| --- | --- |
| L | 140 |
| M | 560 |
| S | 280 |

## First P0 Vertical Slices

| Feature ID | Phase | Size | Service or Domain | Pillar | Workstream |
| --- | --- | --- | --- | --- | --- |
| 23-KUBERNETES-COST-ALLOCATION-00001 | M1 inventory | S | OpenCost integration | cost | inventory |
| 23-KUBERNETES-COST-ALLOCATION-00050 | M1 inventory | S | cloud bill integration | cost | inventory |
| 23-KUBERNETES-COST-ALLOCATION-00099 | M1 inventory | S | namespace cost | cost | inventory |
| 23-KUBERNETES-COST-ALLOCATION-00029 | M1 inventory | S | OpenCost integration | security | inventory |
| 23-KUBERNETES-COST-ALLOCATION-00078 | M1 inventory | S | cloud bill integration | security | inventory |
| 23-KUBERNETES-COST-ALLOCATION-00127 | M1 inventory | S | namespace cost | security | inventory |
| 23-KUBERNETES-COST-ALLOCATION-00008 | M1 inventory | S | OpenCost integration | resilience | inventory |
| 23-KUBERNETES-COST-ALLOCATION-00057 | M1 inventory | S | cloud bill integration | resilience | inventory |
| 23-KUBERNETES-COST-ALLOCATION-00106 | M1 inventory | S | namespace cost | resilience | inventory |
| 23-KUBERNETES-COST-ALLOCATION-00149 | M2 observable | M | workload cost | cost | health |
| 23-KUBERNETES-COST-ALLOCATION-00198 | M2 observable | M | pod cost | cost | health |
| 23-KUBERNETES-COST-ALLOCATION-00247 | M2 observable | M | node cost | cost | health |

## Execution Rules

- Do not begin M5 autonomous-assist until deterministic evidence, RBAC, audit, and replay are implemented for the same service or domain.
- Every M4 action must support read-only preview or dry-run before mutation.
- Every cost-related P0 must include estimated impact, confidence, effort, risk, owner, and verification.
- Every security-related P0 must include permission scope, audit trail, suppression policy, and stale-data behavior.
- Every resilience or disaster-recovery P0 must include recovery evidence, drill path, RTO/RPO fields where relevant, and rollback or recovery notes.
