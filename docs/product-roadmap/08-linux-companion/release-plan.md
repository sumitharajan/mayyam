# Linux Companion: Release Plan

## Shipment Strategy

Ship this module in maturity order. Start with M1 inventory for identity and ownership, move to M2 observable for health and freshness, then M3 explainable for deterministic findings and AI triage. Only after those are reliable should the team ship M4 interactive workflows and M5 autonomous-assist investigation.

## Phase Counts

| Release Phase | Feature Rows |
| --- | --- |
| M1 inventory | 525 |
| M2 observable | 525 |
| M3 explainable | 1050 |
| M4 interactive | 1050 |
| M5 autonomous-assist | 525 |

## Priority Counts

| Priority | Feature Rows |
| --- | --- |
| P0 | 1575 |
| P1 | 525 |
| P2 | 1575 |

## Ship Size Counts

| Ship Size | Feature Rows |
| --- | --- |
| L | 525 |
| M | 2100 |
| S | 1050 |

## First P0 Vertical Slices

| Feature ID | Phase | Size | Service or Domain | Pillar | Workstream |
| --- | --- | --- | --- | --- | --- |
| 08-LINUX-COMPANION-00001 | M1 inventory | S | Machine inventory | cost | inventory |
| 08-LINUX-COMPANION-00050 | M1 inventory | S | OS distribution and kernel | cost | inventory |
| 08-LINUX-COMPANION-00099 | M1 inventory | S | Cloud and VPS metadata | cost | inventory |
| 08-LINUX-COMPANION-00029 | M1 inventory | S | Machine inventory | security | inventory |
| 08-LINUX-COMPANION-00078 | M1 inventory | S | OS distribution and kernel | security | inventory |
| 08-LINUX-COMPANION-00127 | M1 inventory | S | Cloud and VPS metadata | security | inventory |
| 08-LINUX-COMPANION-00008 | M1 inventory | S | Machine inventory | resilience | inventory |
| 08-LINUX-COMPANION-00057 | M1 inventory | S | OS distribution and kernel | resilience | inventory |
| 08-LINUX-COMPANION-00106 | M1 inventory | S | Cloud and VPS metadata | resilience | inventory |
| 08-LINUX-COMPANION-00149 | M2 observable | M | Hardware and virtualization | cost | health |
| 08-LINUX-COMPANION-00198 | M2 observable | M | CPU utilization | cost | health |
| 08-LINUX-COMPANION-00247 | M2 observable | M | CPU saturation | cost | health |

## Execution Rules

- Do not begin M5 autonomous-assist until deterministic evidence, RBAC, audit, and replay are implemented for the same service or domain.
- Every M4 action must support read-only preview or dry-run before mutation.
- Every cost-related P0 must include estimated impact, confidence, effort, risk, owner, and verification.
- Every security-related P0 must include permission scope, audit trail, suppression policy, and stale-data behavior.
- Every resilience or disaster-recovery P0 must include recovery evidence, drill path, RTO/RPO fields where relevant, and rollback or recovery notes.
