# Workflow and Action Engine: Release Plan

## Shipment Strategy

Ship this module in maturity order. Start with M1 inventory for identity and ownership, move to M2 observable for health and freshness, then M3 explainable for deterministic findings and AI triage. Only after those are reliable should the team ship M4 interactive workflows and M5 autonomous-assist investigation.

## Phase Counts

| Release Phase | Feature Rows |
| --- | --- |
| M1 inventory | 224 |
| M2 observable | 224 |
| M3 explainable | 448 |
| M4 interactive | 448 |
| M5 autonomous-assist | 224 |

## Priority Counts

| Priority | Feature Rows |
| --- | --- |
| P0 | 672 |
| P1 | 224 |
| P2 | 672 |

## Ship Size Counts

| Ship Size | Feature Rows |
| --- | --- |
| L | 224 |
| M | 896 |
| S | 448 |

## First P0 Vertical Slices

| Feature ID | Phase | Size | Service or Domain | Pillar | Workstream |
| --- | --- | --- | --- | --- | --- |
| 14-WORKFLOW-ACTION-ENGINE-00001 | M1 inventory | S | workflow definition | cost | inventory |
| 14-WORKFLOW-ACTION-ENGINE-00050 | M1 inventory | S | workflow versioning | cost | inventory |
| 14-WORKFLOW-ACTION-ENGINE-00099 | M1 inventory | S | workflow execution history | cost | inventory |
| 14-WORKFLOW-ACTION-ENGINE-00029 | M1 inventory | S | workflow definition | security | inventory |
| 14-WORKFLOW-ACTION-ENGINE-00078 | M1 inventory | S | workflow versioning | security | inventory |
| 14-WORKFLOW-ACTION-ENGINE-00127 | M1 inventory | S | workflow execution history | security | inventory |
| 14-WORKFLOW-ACTION-ENGINE-00008 | M1 inventory | S | workflow definition | resilience | inventory |
| 14-WORKFLOW-ACTION-ENGINE-00057 | M1 inventory | S | workflow versioning | resilience | inventory |
| 14-WORKFLOW-ACTION-ENGINE-00106 | M1 inventory | S | workflow execution history | resilience | inventory |
| 14-WORKFLOW-ACTION-ENGINE-00149 | M2 observable | M | workflow cancellation | cost | health |
| 14-WORKFLOW-ACTION-ENGINE-00198 | M2 observable | M | workflow replay | cost | health |
| 14-WORKFLOW-ACTION-ENGINE-00247 | M2 observable | M | manual trigger | cost | health |

## Execution Rules

- Do not begin M5 autonomous-assist until deterministic evidence, RBAC, audit, and replay are implemented for the same service or domain.
- Every M4 action must support read-only preview or dry-run before mutation.
- Every cost-related P0 must include estimated impact, confidence, effort, risk, owner, and verification.
- Every security-related P0 must include permission scope, audit trail, suppression policy, and stale-data behavior.
- Every resilience or disaster-recovery P0 must include recovery evidence, drill path, RTO/RPO fields where relevant, and rollback or recovery notes.
