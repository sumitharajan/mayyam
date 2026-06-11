# Kubernetes Dashboard: Release Plan

## Shipment Strategy

Ship this module in maturity order. Start with M1 inventory for identity and ownership, move to M2 observable for health and freshness, then M3 explainable for deterministic findings and AI triage. Only after those are reliable should the team ship M4 interactive workflows and M5 autonomous-assist investigation.

## Phase Counts

| Release Phase | Feature Rows |
| --- | --- |
| M1 inventory | 287 |
| M2 observable | 287 |
| M3 explainable | 574 |
| M4 interactive | 574 |
| M5 autonomous-assist | 287 |

## Priority Counts

| Priority | Feature Rows |
| --- | --- |
| P0 | 861 |
| P1 | 1148 |

## Ship Size Counts

| Ship Size | Feature Rows |
| --- | --- |
| L | 287 |
| M | 1148 |
| S | 574 |

## First P0 Vertical Slices

| Feature ID | Phase | Size | Service or Domain | Pillar | Workstream |
| --- | --- | --- | --- | --- | --- |
| 02-KUBERNETES-DASHBOARD-00001 | M1 inventory | S | Clusters | cost | inventory |
| 02-KUBERNETES-DASHBOARD-00050 | M1 inventory | S | Namespaces | cost | inventory |
| 02-KUBERNETES-DASHBOARD-00099 | M1 inventory | S | Nodes | cost | inventory |
| 02-KUBERNETES-DASHBOARD-00029 | M1 inventory | S | Clusters | security | inventory |
| 02-KUBERNETES-DASHBOARD-00078 | M1 inventory | S | Namespaces | security | inventory |
| 02-KUBERNETES-DASHBOARD-00127 | M1 inventory | S | Nodes | security | inventory |
| 02-KUBERNETES-DASHBOARD-00008 | M1 inventory | S | Clusters | resilience | inventory |
| 02-KUBERNETES-DASHBOARD-00057 | M1 inventory | S | Namespaces | resilience | inventory |
| 02-KUBERNETES-DASHBOARD-00106 | M1 inventory | S | Nodes | resilience | inventory |
| 02-KUBERNETES-DASHBOARD-00149 | M2 observable | M | Pods | cost | health |
| 02-KUBERNETES-DASHBOARD-00198 | M2 observable | M | Deployments | cost | health |
| 02-KUBERNETES-DASHBOARD-00247 | M2 observable | M | ReplicaSets | cost | health |

## Execution Rules

- Do not begin M5 autonomous-assist until deterministic evidence, RBAC, audit, and replay are implemented for the same service or domain.
- Every M4 action must support read-only preview or dry-run before mutation.
- Every cost-related P0 must include estimated impact, confidence, effort, risk, owner, and verification.
- Every security-related P0 must include permission scope, audit trail, suppression policy, and stale-data behavior.
- Every resilience or disaster-recovery P0 must include recovery evidence, drill path, RTO/RPO fields where relevant, and rollback or recovery notes.
