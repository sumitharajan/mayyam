# Universal Resource Graph: Release Plan

## Shipment Strategy

Ship this module in maturity order. Start with M1 inventory for identity and ownership, move to M2 observable for health and freshness, then M3 explainable for deterministic findings and AI triage. Only after those are reliable should the team ship M4 interactive workflows and M5 autonomous-assist investigation.

## Phase Counts

| Release Phase | Feature Rows |
| --- | --- |
| M1 inventory | 245 |
| M2 observable | 245 |
| M3 explainable | 490 |
| M4 interactive | 490 |
| M5 autonomous-assist | 245 |

## Priority Counts

| Priority | Feature Rows |
| --- | --- |
| P0 | 735 |
| P1 | 245 |
| P2 | 735 |

## Ship Size Counts

| Ship Size | Feature Rows |
| --- | --- |
| L | 245 |
| M | 980 |
| S | 490 |

## First P0 Vertical Slices

| Feature ID | Phase | Size | Service or Domain | Pillar | Workstream |
| --- | --- | --- | --- | --- | --- |
| 09-UNIVERSAL-RESOURCE-GRAPH-00001 | M1 inventory | S | global resource identity | cost | inventory |
| 09-UNIVERSAL-RESOURCE-GRAPH-00050 | M1 inventory | S | identity merge and split | cost | inventory |
| 09-UNIVERSAL-RESOURCE-GRAPH-00099 | M1 inventory | S | resource aliases | cost | inventory |
| 09-UNIVERSAL-RESOURCE-GRAPH-00029 | M1 inventory | S | global resource identity | security | inventory |
| 09-UNIVERSAL-RESOURCE-GRAPH-00078 | M1 inventory | S | identity merge and split | security | inventory |
| 09-UNIVERSAL-RESOURCE-GRAPH-00127 | M1 inventory | S | resource aliases | security | inventory |
| 09-UNIVERSAL-RESOURCE-GRAPH-00008 | M1 inventory | S | global resource identity | resilience | inventory |
| 09-UNIVERSAL-RESOURCE-GRAPH-00057 | M1 inventory | S | identity merge and split | resilience | inventory |
| 09-UNIVERSAL-RESOURCE-GRAPH-00106 | M1 inventory | S | resource aliases | resilience | inventory |
| 09-UNIVERSAL-RESOURCE-GRAPH-00149 | M2 observable | M | external identifiers | cost | health |
| 09-UNIVERSAL-RESOURCE-GRAPH-00198 | M2 observable | M | cloud resource nodes | cost | health |
| 09-UNIVERSAL-RESOURCE-GRAPH-00247 | M2 observable | M | Kubernetes object nodes | cost | health |

## Execution Rules

- Do not begin M5 autonomous-assist until deterministic evidence, RBAC, audit, and replay are implemented for the same service or domain.
- Every M4 action must support read-only preview or dry-run before mutation.
- Every cost-related P0 must include estimated impact, confidence, effort, risk, owner, and verification.
- Every security-related P0 must include permission scope, audit trail, suppression policy, and stale-data behavior.
- Every resilience or disaster-recovery P0 must include recovery evidence, drill path, RTO/RPO fields where relevant, and rollback or recovery notes.
