# IaC Drift and Change Intelligence: Release Plan

## Shipment Strategy

Ship this module in maturity order. Start with M1 inventory for identity and ownership, move to M2 observable for health and freshness, then M3 explainable for deterministic findings and AI triage. Only after those are reliable should the team ship M4 interactive workflows and M5 autonomous-assist investigation.

## Phase Counts

| Release Phase | Feature Rows |
| --- | --- |
| M1 inventory | 189 |
| M2 observable | 189 |
| M3 explainable | 378 |
| M4 interactive | 378 |
| M5 autonomous-assist | 189 |

## Priority Counts

| Priority | Feature Rows |
| --- | --- |
| P0 | 567 |
| P1 | 189 |
| P2 | 567 |

## Ship Size Counts

| Ship Size | Feature Rows |
| --- | --- |
| L | 189 |
| M | 756 |
| S | 378 |

## First P0 Vertical Slices

| Feature ID | Phase | Size | Service or Domain | Pillar | Workstream |
| --- | --- | --- | --- | --- | --- |
| 15-IAC-DRIFT-CHANGE-INTELLIGENCE-00001 | M1 inventory | S | Terraform state | cost | inventory |
| 15-IAC-DRIFT-CHANGE-INTELLIGENCE-00050 | M1 inventory | S | Terraform plan | cost | inventory |
| 15-IAC-DRIFT-CHANGE-INTELLIGENCE-00099 | M1 inventory | S | CloudFormation stack | cost | inventory |
| 15-IAC-DRIFT-CHANGE-INTELLIGENCE-00029 | M1 inventory | S | Terraform state | security | inventory |
| 15-IAC-DRIFT-CHANGE-INTELLIGENCE-00078 | M1 inventory | S | Terraform plan | security | inventory |
| 15-IAC-DRIFT-CHANGE-INTELLIGENCE-00127 | M1 inventory | S | CloudFormation stack | security | inventory |
| 15-IAC-DRIFT-CHANGE-INTELLIGENCE-00008 | M1 inventory | S | Terraform state | resilience | inventory |
| 15-IAC-DRIFT-CHANGE-INTELLIGENCE-00057 | M1 inventory | S | Terraform plan | resilience | inventory |
| 15-IAC-DRIFT-CHANGE-INTELLIGENCE-00106 | M1 inventory | S | CloudFormation stack | resilience | inventory |
| 15-IAC-DRIFT-CHANGE-INTELLIGENCE-00149 | M2 observable | M | Pulumi stack | cost | health |
| 15-IAC-DRIFT-CHANGE-INTELLIGENCE-00198 | M2 observable | M | Helm release | cost | health |
| 15-IAC-DRIFT-CHANGE-INTELLIGENCE-00247 | M2 observable | M | Kustomize overlay | cost | health |

## Execution Rules

- Do not begin M5 autonomous-assist until deterministic evidence, RBAC, audit, and replay are implemented for the same service or domain.
- Every M4 action must support read-only preview or dry-run before mutation.
- Every cost-related P0 must include estimated impact, confidence, effort, risk, owner, and verification.
- Every security-related P0 must include permission scope, audit trail, suppression policy, and stale-data behavior.
- Every resilience or disaster-recovery P0 must include recovery evidence, drill path, RTO/RPO fields where relevant, and rollback or recovery notes.
