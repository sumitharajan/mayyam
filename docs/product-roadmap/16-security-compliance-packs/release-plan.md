# Security and Compliance Packs: Release Plan

## Shipment Strategy

Ship this module in maturity order. Start with M1 inventory for identity and ownership, move to M2 observable for health and freshness, then M3 explainable for deterministic findings and AI triage. Only after those are reliable should the team ship M4 interactive workflows and M5 autonomous-assist investigation.

## Phase Counts

| Release Phase | Feature Rows |
| --- | --- |
| M1 inventory | 168 |
| M2 observable | 168 |
| M3 explainable | 336 |
| M4 interactive | 336 |
| M5 autonomous-assist | 168 |

## Priority Counts

| Priority | Feature Rows |
| --- | --- |
| P0 | 504 |
| P1 | 168 |
| P2 | 504 |

## Ship Size Counts

| Ship Size | Feature Rows |
| --- | --- |
| L | 168 |
| M | 672 |
| S | 336 |

## First P0 Vertical Slices

| Feature ID | Phase | Size | Service or Domain | Pillar | Workstream |
| --- | --- | --- | --- | --- | --- |
| 16-SECURITY-COMPLIANCE-PACKS-00001 | M1 inventory | S | CIS AWS Benchmark | cost | inventory |
| 16-SECURITY-COMPLIANCE-PACKS-00050 | M1 inventory | S | CIS Kubernetes Benchmark | cost | inventory |
| 16-SECURITY-COMPLIANCE-PACKS-00099 | M1 inventory | S | CIS Linux Benchmark | cost | inventory |
| 16-SECURITY-COMPLIANCE-PACKS-00029 | M1 inventory | S | CIS AWS Benchmark | security | inventory |
| 16-SECURITY-COMPLIANCE-PACKS-00078 | M1 inventory | S | CIS Kubernetes Benchmark | security | inventory |
| 16-SECURITY-COMPLIANCE-PACKS-00127 | M1 inventory | S | CIS Linux Benchmark | security | inventory |
| 16-SECURITY-COMPLIANCE-PACKS-00008 | M1 inventory | S | CIS AWS Benchmark | resilience | inventory |
| 16-SECURITY-COMPLIANCE-PACKS-00057 | M1 inventory | S | CIS Kubernetes Benchmark | resilience | inventory |
| 16-SECURITY-COMPLIANCE-PACKS-00106 | M1 inventory | S | CIS Linux Benchmark | resilience | inventory |
| 16-SECURITY-COMPLIANCE-PACKS-00149 | M2 observable | M | NIST control mapping | cost | health |
| 16-SECURITY-COMPLIANCE-PACKS-00198 | M2 observable | M | SOC2 control mapping | cost | health |
| 16-SECURITY-COMPLIANCE-PACKS-00247 | M2 observable | M | HIPAA control mapping | cost | health |

## Execution Rules

- Do not begin M5 autonomous-assist until deterministic evidence, RBAC, audit, and replay are implemented for the same service or domain.
- Every M4 action must support read-only preview or dry-run before mutation.
- Every cost-related P0 must include estimated impact, confidence, effort, risk, owner, and verification.
- Every security-related P0 must include permission scope, audit trail, suppression policy, and stale-data behavior.
- Every resilience or disaster-recovery P0 must include recovery evidence, drill path, RTO/RPO fields where relevant, and rollback or recovery notes.
