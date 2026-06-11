# AWS Cloud: Release Plan

## Shipment Strategy

Ship this module in maturity order. Start with M1 inventory for identity and ownership, move to M2 observable for health and freshness, then M3 explainable for deterministic findings and AI triage. Only after those are reliable should the team ship M4 interactive workflows and M5 autonomous-assist investigation.

## Phase Counts

| Release Phase | Feature Rows |
| --- | --- |
| M1 inventory | 616 |
| M2 observable | 616 |
| M3 explainable | 1232 |
| M4 interactive | 2464 |
| M5 autonomous-assist | 616 |

## Priority Counts

| Priority | Feature Rows |
| --- | --- |
| P0 | 2964 |
| P1 | 1692 |
| P2 | 888 |

## Ship Size Counts

| Ship Size | Feature Rows |
| --- | --- |
| L | 1232 |
| M | 3696 |
| S | 616 |

## First P0 Vertical Slices

| Feature ID | Phase | Size | Service or Domain | Pillar | Workstream |
| --- | --- | --- | --- | --- | --- |
| 01-AWS-CLOUD-00001 | M1 inventory | S | EC2 | cost | inventory |
| 01-AWS-CLOUD-00064 | M1 inventory | S | Auto Scaling | cost | inventory |
| 01-AWS-CLOUD-00127 | M1 inventory | S | Lambda | cost | inventory |
| 01-AWS-CLOUD-00037 | M1 inventory | S | EC2 | security | inventory |
| 01-AWS-CLOUD-00100 | M1 inventory | S | Auto Scaling | security | inventory |
| 01-AWS-CLOUD-00163 | M1 inventory | S | Lambda | security | inventory |
| 01-AWS-CLOUD-00010 | M1 inventory | S | EC2 | resilience | inventory |
| 01-AWS-CLOUD-00073 | M1 inventory | S | Auto Scaling | resilience | inventory |
| 01-AWS-CLOUD-00136 | M1 inventory | S | Lambda | resilience | inventory |
| 01-AWS-CLOUD-00191 | M2 observable | M | ECS | cost | telemetry |
| 01-AWS-CLOUD-00254 | M2 observable | M | EKS | cost | telemetry |
| 01-AWS-CLOUD-00317 | M2 observable | M | Fargate | cost | telemetry |

## Execution Rules

- Do not begin M5 autonomous-assist until deterministic evidence, RBAC, audit, and replay are implemented for the same service or domain.
- Every M4 action must support read-only preview or dry-run before mutation.
- Every cost-related P0 must include estimated impact, confidence, effort, risk, owner, and verification.
- Every security-related P0 must include permission scope, audit trail, suppression policy, and stale-data behavior.
- Every resilience or disaster-recovery P0 must include recovery evidence, drill path, RTO/RPO fields where relevant, and rollback or recovery notes.
