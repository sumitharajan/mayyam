# Alerting, Notification, and On-Call: Release Plan

## Shipment Strategy

Ship this module in maturity order. Start with M1 inventory for identity and ownership, move to M2 observable for health and freshness, then M3 explainable for deterministic findings and AI triage. Only after those are reliable should the team ship M4 interactive workflows and M5 autonomous-assist investigation.

## Phase Counts

| Release Phase | Feature Rows |
| --- | --- |
| M1 inventory | 175 |
| M2 observable | 175 |
| M3 explainable | 350 |
| M4 interactive | 350 |
| M5 autonomous-assist | 175 |

## Priority Counts

| Priority | Feature Rows |
| --- | --- |
| P0 | 525 |
| P1 | 175 |
| P2 | 525 |

## Ship Size Counts

| Ship Size | Feature Rows |
| --- | --- |
| L | 175 |
| M | 700 |
| S | 350 |

## First P0 Vertical Slices

| Feature ID | Phase | Size | Service or Domain | Pillar | Workstream |
| --- | --- | --- | --- | --- | --- |
| 26-ALERTING-NOTIFICATION-ONCALL-00001 | M1 inventory | S | alert rule model | cost | inventory |
| 26-ALERTING-NOTIFICATION-ONCALL-00050 | M1 inventory | S | metric threshold alert | cost | inventory |
| 26-ALERTING-NOTIFICATION-ONCALL-00099 | M1 inventory | S | log pattern alert | cost | inventory |
| 26-ALERTING-NOTIFICATION-ONCALL-00029 | M1 inventory | S | alert rule model | security | inventory |
| 26-ALERTING-NOTIFICATION-ONCALL-00078 | M1 inventory | S | metric threshold alert | security | inventory |
| 26-ALERTING-NOTIFICATION-ONCALL-00127 | M1 inventory | S | log pattern alert | security | inventory |
| 26-ALERTING-NOTIFICATION-ONCALL-00008 | M1 inventory | S | alert rule model | resilience | inventory |
| 26-ALERTING-NOTIFICATION-ONCALL-00057 | M1 inventory | S | metric threshold alert | resilience | inventory |
| 26-ALERTING-NOTIFICATION-ONCALL-00106 | M1 inventory | S | log pattern alert | resilience | inventory |
| 26-ALERTING-NOTIFICATION-ONCALL-00149 | M2 observable | M | anomaly alert | cost | health |
| 26-ALERTING-NOTIFICATION-ONCALL-00198 | M2 observable | M | composite alert | cost | health |
| 26-ALERTING-NOTIFICATION-ONCALL-00247 | M2 observable | M | burn rate alert | cost | health |

## Execution Rules

- Do not begin M5 autonomous-assist until deterministic evidence, RBAC, audit, and replay are implemented for the same service or domain.
- Every M4 action must support read-only preview or dry-run before mutation.
- Every cost-related P0 must include estimated impact, confidence, effort, risk, owner, and verification.
- Every security-related P0 must include permission scope, audit trail, suppression policy, and stale-data behavior.
- Every resilience or disaster-recovery P0 must include recovery evidence, drill path, RTO/RPO fields where relevant, and rollback or recovery notes.
