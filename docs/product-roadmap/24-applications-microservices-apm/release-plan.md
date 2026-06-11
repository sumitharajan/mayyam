# Applications and Microservices APM: Release Plan

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
| 24-APPLICATIONS-MICROSERVICES-APM-00001 | M1 inventory | S | service auto-discovery | cost | inventory |
| 24-APPLICATIONS-MICROSERVICES-APM-00050 | M1 inventory | S | endpoint inventory | cost | inventory |
| 24-APPLICATIONS-MICROSERVICES-APM-00099 | M1 inventory | S | dependency map | cost | inventory |
| 24-APPLICATIONS-MICROSERVICES-APM-00029 | M1 inventory | S | service auto-discovery | security | inventory |
| 24-APPLICATIONS-MICROSERVICES-APM-00078 | M1 inventory | S | endpoint inventory | security | inventory |
| 24-APPLICATIONS-MICROSERVICES-APM-00127 | M1 inventory | S | dependency map | security | inventory |
| 24-APPLICATIONS-MICROSERVICES-APM-00008 | M1 inventory | S | service auto-discovery | resilience | inventory |
| 24-APPLICATIONS-MICROSERVICES-APM-00057 | M1 inventory | S | endpoint inventory | resilience | inventory |
| 24-APPLICATIONS-MICROSERVICES-APM-00106 | M1 inventory | S | dependency map | resilience | inventory |
| 24-APPLICATIONS-MICROSERVICES-APM-00149 | M2 observable | M | RED metrics | cost | health |
| 24-APPLICATIONS-MICROSERVICES-APM-00198 | M2 observable | M | USE metrics | cost | health |
| 24-APPLICATIONS-MICROSERVICES-APM-00247 | M2 observable | M | Apdex score | cost | health |

## Execution Rules

- Do not begin M5 autonomous-assist until deterministic evidence, RBAC, audit, and replay are implemented for the same service or domain.
- Every M4 action must support read-only preview or dry-run before mutation.
- Every cost-related P0 must include estimated impact, confidence, effort, risk, owner, and verification.
- Every security-related P0 must include permission scope, audit trail, suppression policy, and stale-data behavior.
- Every resilience or disaster-recovery P0 must include recovery evidence, drill path, RTO/RPO fields where relevant, and rollback or recovery notes.
