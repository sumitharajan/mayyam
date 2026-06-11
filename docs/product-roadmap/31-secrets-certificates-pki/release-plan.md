# Secrets, Certificates, and PKI: Release Plan

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
| 31-SECRETS-CERTIFICATES-PKI-00001 | M1 inventory | S | secret inventory | cost | inventory |
| 31-SECRETS-CERTIFICATES-PKI-00050 | M1 inventory | S | certificate inventory | cost | inventory |
| 31-SECRETS-CERTIFICATES-PKI-00099 | M1 inventory | S | certificate expiry detection | cost | inventory |
| 31-SECRETS-CERTIFICATES-PKI-00029 | M1 inventory | S | secret inventory | security | inventory |
| 31-SECRETS-CERTIFICATES-PKI-00078 | M1 inventory | S | certificate inventory | security | inventory |
| 31-SECRETS-CERTIFICATES-PKI-00127 | M1 inventory | S | certificate expiry detection | security | inventory |
| 31-SECRETS-CERTIFICATES-PKI-00008 | M1 inventory | S | secret inventory | resilience | inventory |
| 31-SECRETS-CERTIFICATES-PKI-00057 | M1 inventory | S | certificate inventory | resilience | inventory |
| 31-SECRETS-CERTIFICATES-PKI-00106 | M1 inventory | S | certificate expiry detection | resilience | inventory |
| 31-SECRETS-CERTIFICATES-PKI-00149 | M2 observable | M | rotation policy | cost | health |
| 31-SECRETS-CERTIFICATES-PKI-00198 | M2 observable | M | stale secret detection | cost | health |
| 31-SECRETS-CERTIFICATES-PKI-00247 | M2 observable | M | secret exposure scan | cost | health |

## Execution Rules

- Do not begin M5 autonomous-assist until deterministic evidence, RBAC, audit, and replay are implemented for the same service or domain.
- Every M4 action must support read-only preview or dry-run before mutation.
- Every cost-related P0 must include estimated impact, confidence, effort, risk, owner, and verification.
- Every security-related P0 must include permission scope, audit trail, suppression policy, and stale-data behavior.
- Every resilience or disaster-recovery P0 must include recovery evidence, drill path, RTO/RPO fields where relevant, and rollback or recovery notes.
