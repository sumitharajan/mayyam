# Edge, API, and Service Mesh: Release Plan

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
| 36-EDGE-API-SERVICE-MESH-00001 | M1 inventory | S | API gateway inventory | cost | inventory |
| 36-EDGE-API-SERVICE-MESH-00050 | M1 inventory | S | CDN inventory | cost | inventory |
| 36-EDGE-API-SERVICE-MESH-00099 | M1 inventory | S | DNS zone inventory | cost | inventory |
| 36-EDGE-API-SERVICE-MESH-00029 | M1 inventory | S | API gateway inventory | security | inventory |
| 36-EDGE-API-SERVICE-MESH-00078 | M1 inventory | S | CDN inventory | security | inventory |
| 36-EDGE-API-SERVICE-MESH-00127 | M1 inventory | S | DNS zone inventory | security | inventory |
| 36-EDGE-API-SERVICE-MESH-00008 | M1 inventory | S | API gateway inventory | resilience | inventory |
| 36-EDGE-API-SERVICE-MESH-00057 | M1 inventory | S | CDN inventory | resilience | inventory |
| 36-EDGE-API-SERVICE-MESH-00106 | M1 inventory | S | DNS zone inventory | resilience | inventory |
| 36-EDGE-API-SERVICE-MESH-00149 | M2 observable | M | service mesh inventory | cost | health |
| 36-EDGE-API-SERVICE-MESH-00198 | M2 observable | M | ingress controller | cost | health |
| 36-EDGE-API-SERVICE-MESH-00247 | M2 observable | M | egress gateway | cost | health |

## Execution Rules

- Do not begin M5 autonomous-assist until deterministic evidence, RBAC, audit, and replay are implemented for the same service or domain.
- Every M4 action must support read-only preview or dry-run before mutation.
- Every cost-related P0 must include estimated impact, confidence, effort, risk, owner, and verification.
- Every security-related P0 must include permission scope, audit trail, suppression policy, and stale-data behavior.
- Every resilience or disaster-recovery P0 must include recovery evidence, drill path, RTO/RPO fields where relevant, and rollback or recovery notes.
