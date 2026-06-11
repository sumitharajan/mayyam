# Developer Platform, SDK, and CLI: Release Plan

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
| 37-DEVELOPER-PLATFORM-SDK-CLI-00001 | M1 inventory | S | Mayyam CLI | cost | inventory |
| 37-DEVELOPER-PLATFORM-SDK-CLI-00050 | M1 inventory | S | Terraform provider | cost | inventory |
| 37-DEVELOPER-PLATFORM-SDK-CLI-00099 | M1 inventory | S | GitHub Action | cost | inventory |
| 37-DEVELOPER-PLATFORM-SDK-CLI-00029 | M1 inventory | S | Mayyam CLI | security | inventory |
| 37-DEVELOPER-PLATFORM-SDK-CLI-00078 | M1 inventory | S | Terraform provider | security | inventory |
| 37-DEVELOPER-PLATFORM-SDK-CLI-00127 | M1 inventory | S | GitHub Action | security | inventory |
| 37-DEVELOPER-PLATFORM-SDK-CLI-00008 | M1 inventory | S | Mayyam CLI | resilience | inventory |
| 37-DEVELOPER-PLATFORM-SDK-CLI-00057 | M1 inventory | S | Terraform provider | resilience | inventory |
| 37-DEVELOPER-PLATFORM-SDK-CLI-00106 | M1 inventory | S | GitHub Action | resilience | inventory |
| 37-DEVELOPER-PLATFORM-SDK-CLI-00149 | M2 observable | M | CI policy gate | cost | health |
| 37-DEVELOPER-PLATFORM-SDK-CLI-00198 | M2 observable | M | local dev fixture | cost | health |
| 37-DEVELOPER-PLATFORM-SDK-CLI-00247 | M2 observable | M | connector scaffold | cost | health |

## Execution Rules

- Do not begin M5 autonomous-assist until deterministic evidence, RBAC, audit, and replay are implemented for the same service or domain.
- Every M4 action must support read-only preview or dry-run before mutation.
- Every cost-related P0 must include estimated impact, confidence, effort, risk, owner, and verification.
- Every security-related P0 must include permission scope, audit trail, suppression policy, and stale-data behavior.
- Every resilience or disaster-recovery P0 must include recovery evidence, drill path, RTO/RPO fields where relevant, and rollback or recovery notes.
