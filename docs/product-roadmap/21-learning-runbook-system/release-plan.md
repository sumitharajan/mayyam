# Learning and Runbook System: Release Plan

## Shipment Strategy

Ship this module in maturity order. Start with M1 inventory for identity and ownership, move to M2 observable for health and freshness, then M3 explainable for deterministic findings and AI triage. Only after those are reliable should the team ship M4 interactive workflows and M5 autonomous-assist investigation.

## Phase Counts

| Release Phase | Feature Rows |
| --- | --- |
| M1 inventory | 147 |
| M2 observable | 147 |
| M3 explainable | 294 |
| M4 interactive | 294 |
| M5 autonomous-assist | 147 |

## Priority Counts

| Priority | Feature Rows |
| --- | --- |
| P0 | 441 |
| P1 | 147 |
| P2 | 441 |

## Ship Size Counts

| Ship Size | Feature Rows |
| --- | --- |
| L | 147 |
| M | 588 |
| S | 294 |

## First P0 Vertical Slices

| Feature ID | Phase | Size | Service or Domain | Pillar | Workstream |
| --- | --- | --- | --- | --- | --- |
| 21-LEARNING-RUNBOOK-SYSTEM-00001 | M1 inventory | S | manual fix capture | cost | inventory |
| 21-LEARNING-RUNBOOK-SYSTEM-00050 | M1 inventory | S | incident learning capture | cost | inventory |
| 21-LEARNING-RUNBOOK-SYSTEM-00099 | M1 inventory | S | agent suggestion capture | cost | inventory |
| 21-LEARNING-RUNBOOK-SYSTEM-00029 | M1 inventory | S | manual fix capture | security | inventory |
| 21-LEARNING-RUNBOOK-SYSTEM-00078 | M1 inventory | S | incident learning capture | security | inventory |
| 21-LEARNING-RUNBOOK-SYSTEM-00127 | M1 inventory | S | agent suggestion capture | security | inventory |
| 21-LEARNING-RUNBOOK-SYSTEM-00008 | M1 inventory | S | manual fix capture | resilience | inventory |
| 21-LEARNING-RUNBOOK-SYSTEM-00057 | M1 inventory | S | incident learning capture | resilience | inventory |
| 21-LEARNING-RUNBOOK-SYSTEM-00106 | M1 inventory | S | agent suggestion capture | resilience | inventory |
| 21-LEARNING-RUNBOOK-SYSTEM-00149 | M2 observable | M | case to deterministic rule | cost | health |
| 21-LEARNING-RUNBOOK-SYSTEM-00198 | M2 observable | M | case to runbook | cost | health |
| 21-LEARNING-RUNBOOK-SYSTEM-00247 | M2 observable | M | case to workflow | cost | health |

## Execution Rules

- Do not begin M5 autonomous-assist until deterministic evidence, RBAC, audit, and replay are implemented for the same service or domain.
- Every M4 action must support read-only preview or dry-run before mutation.
- Every cost-related P0 must include estimated impact, confidence, effort, risk, owner, and verification.
- Every security-related P0 must include permission scope, audit trail, suppression policy, and stale-data behavior.
- Every resilience or disaster-recovery P0 must include recovery evidence, drill path, RTO/RPO fields where relevant, and rollback or recovery notes.
