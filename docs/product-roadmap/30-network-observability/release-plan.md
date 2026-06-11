# Network Observability: Release Plan

## Shipment Strategy

Ship this module in maturity order. Start with M1 inventory for identity and ownership, move to M2 observable for health and freshness, then M3 explainable for deterministic findings and AI triage. Only after those are reliable should the team ship M4 interactive workflows and M5 autonomous-assist investigation.

## Phase Counts

| Release Phase | Feature Rows |
| --- | --- |
| M1 inventory | 182 |
| M2 observable | 182 |
| M3 explainable | 364 |
| M4 interactive | 364 |
| M5 autonomous-assist | 182 |

## Priority Counts

| Priority | Feature Rows |
| --- | --- |
| P0 | 546 |
| P1 | 182 |
| P2 | 546 |

## Ship Size Counts

| Ship Size | Feature Rows |
| --- | --- |
| L | 182 |
| M | 728 |
| S | 364 |

## First P0 Vertical Slices

| Feature ID | Phase | Size | Service or Domain | Pillar | Workstream |
| --- | --- | --- | --- | --- | --- |
| 30-NETWORK-OBSERVABILITY-00001 | M1 inventory | S | network topology discovery | cost | inventory |
| 30-NETWORK-OBSERVABILITY-00050 | M1 inventory | S | VPC flow logs | cost | inventory |
| 30-NETWORK-OBSERVABILITY-00099 | M1 inventory | S | Kubernetes network flows | cost | inventory |
| 30-NETWORK-OBSERVABILITY-00029 | M1 inventory | S | network topology discovery | security | inventory |
| 30-NETWORK-OBSERVABILITY-00078 | M1 inventory | S | VPC flow logs | security | inventory |
| 30-NETWORK-OBSERVABILITY-00127 | M1 inventory | S | Kubernetes network flows | security | inventory |
| 30-NETWORK-OBSERVABILITY-00008 | M1 inventory | S | network topology discovery | resilience | inventory |
| 30-NETWORK-OBSERVABILITY-00057 | M1 inventory | S | VPC flow logs | resilience | inventory |
| 30-NETWORK-OBSERVABILITY-00106 | M1 inventory | S | Kubernetes network flows | resilience | inventory |
| 30-NETWORK-OBSERVABILITY-00149 | M2 observable | M | Linux conntrack | cost | health |
| 30-NETWORK-OBSERVABILITY-00198 | M2 observable | M | DNS telemetry | cost | health |
| 30-NETWORK-OBSERVABILITY-00247 | M2 observable | M | TLS telemetry | cost | health |

## Execution Rules

- Do not begin M5 autonomous-assist until deterministic evidence, RBAC, audit, and replay are implemented for the same service or domain.
- Every M4 action must support read-only preview or dry-run before mutation.
- Every cost-related P0 must include estimated impact, confidence, effort, risk, owner, and verification.
- Every security-related P0 must include permission scope, audit trail, suppression policy, and stale-data behavior.
- Every resilience or disaster-recovery P0 must include recovery evidence, drill path, RTO/RPO fields where relevant, and rollback or recovery notes.
