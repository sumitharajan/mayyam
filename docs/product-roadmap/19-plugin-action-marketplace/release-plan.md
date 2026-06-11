# Plugin and Action Marketplace: Release Plan

## Shipment Strategy

Ship this module in maturity order. Start with M1 inventory for identity and ownership, move to M2 observable for health and freshness, then M3 explainable for deterministic findings and AI triage. Only after those are reliable should the team ship M4 interactive workflows and M5 autonomous-assist investigation.

## Phase Counts

| Release Phase | Feature Rows |
| --- | --- |
| M1 inventory | 154 |
| M2 observable | 154 |
| M3 explainable | 308 |
| M4 interactive | 308 |
| M5 autonomous-assist | 154 |

## Priority Counts

| Priority | Feature Rows |
| --- | --- |
| P0 | 462 |
| P1 | 154 |
| P2 | 462 |

## Ship Size Counts

| Ship Size | Feature Rows |
| --- | --- |
| L | 154 |
| M | 616 |
| S | 308 |

## First P0 Vertical Slices

| Feature ID | Phase | Size | Service or Domain | Pillar | Workstream |
| --- | --- | --- | --- | --- | --- |
| 19-PLUGIN-ACTION-MARKETPLACE-00001 | M1 inventory | S | connector SDK | cost | inventory |
| 19-PLUGIN-ACTION-MARKETPLACE-00050 | M1 inventory | S | action SDK | cost | inventory |
| 19-PLUGIN-ACTION-MARKETPLACE-00099 | M1 inventory | S | rule pack SDK | cost | inventory |
| 19-PLUGIN-ACTION-MARKETPLACE-00029 | M1 inventory | S | connector SDK | security | inventory |
| 19-PLUGIN-ACTION-MARKETPLACE-00078 | M1 inventory | S | action SDK | security | inventory |
| 19-PLUGIN-ACTION-MARKETPLACE-00127 | M1 inventory | S | rule pack SDK | security | inventory |
| 19-PLUGIN-ACTION-MARKETPLACE-00008 | M1 inventory | S | connector SDK | resilience | inventory |
| 19-PLUGIN-ACTION-MARKETPLACE-00057 | M1 inventory | S | action SDK | resilience | inventory |
| 19-PLUGIN-ACTION-MARKETPLACE-00106 | M1 inventory | S | rule pack SDK | resilience | inventory |
| 19-PLUGIN-ACTION-MARKETPLACE-00149 | M2 observable | M | UI extension SDK | cost | health |
| 19-PLUGIN-ACTION-MARKETPLACE-00198 | M2 observable | M | plugin manifest | cost | health |
| 19-PLUGIN-ACTION-MARKETPLACE-00247 | M2 observable | M | permission declaration | cost | health |

## Execution Rules

- Do not begin M5 autonomous-assist until deterministic evidence, RBAC, audit, and replay are implemented for the same service or domain.
- Every M4 action must support read-only preview or dry-run before mutation.
- Every cost-related P0 must include estimated impact, confidence, effort, risk, owner, and verification.
- Every security-related P0 must include permission scope, audit trail, suppression policy, and stale-data behavior.
- Every resilience or disaster-recovery P0 must include recovery evidence, drill path, RTO/RPO fields where relevant, and rollback or recovery notes.
