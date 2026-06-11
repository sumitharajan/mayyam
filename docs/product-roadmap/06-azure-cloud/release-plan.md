# Azure Cloud: Release Plan

## Shipment Strategy

Ship this module in maturity order. Start with M1 inventory for identity and ownership, move to M2 observable for health and freshness, then M3 explainable for deterministic findings and AI triage. Only after those are reliable should the team ship M4 interactive workflows and M5 autonomous-assist investigation.

## Phase Counts

| Release Phase | Feature Rows |
| --- | --- |
| M1 inventory | 406 |
| M2 observable | 406 |
| M3 explainable | 812 |
| M4 interactive | 1624 |
| M5 autonomous-assist | 406 |

## Priority Counts

| Priority | Feature Rows |
| --- | --- |
| P0 | 1566 |
| P1 | 696 |
| P2 | 1392 |

## Ship Size Counts

| Ship Size | Feature Rows |
| --- | --- |
| L | 812 |
| M | 2436 |
| S | 406 |

## First P0 Vertical Slices

| Feature ID | Phase | Size | Service or Domain | Pillar | Workstream |
| --- | --- | --- | --- | --- | --- |
| 06-AZURE-CLOUD-00001 | M1 inventory | S | Virtual Machines | cost | inventory |
| 06-AZURE-CLOUD-00064 | M1 inventory | S | Virtual Machine Scale Sets | cost | inventory |
| 06-AZURE-CLOUD-00127 | M1 inventory | S | Azure Functions | cost | inventory |
| 06-AZURE-CLOUD-00037 | M1 inventory | S | Virtual Machines | security | inventory |
| 06-AZURE-CLOUD-00100 | M1 inventory | S | Virtual Machine Scale Sets | security | inventory |
| 06-AZURE-CLOUD-00163 | M1 inventory | S | Azure Functions | security | inventory |
| 06-AZURE-CLOUD-00010 | M1 inventory | S | Virtual Machines | resilience | inventory |
| 06-AZURE-CLOUD-00073 | M1 inventory | S | Virtual Machine Scale Sets | resilience | inventory |
| 06-AZURE-CLOUD-00136 | M1 inventory | S | Azure Functions | resilience | inventory |
| 06-AZURE-CLOUD-00191 | M2 observable | M | Azure App Service | cost | telemetry |
| 06-AZURE-CLOUD-00254 | M2 observable | M | Azure Batch | cost | telemetry |
| 06-AZURE-CLOUD-00317 | M2 observable | M | Azure Kubernetes Service | cost | telemetry |

## Execution Rules

- Do not begin M5 autonomous-assist until deterministic evidence, RBAC, audit, and replay are implemented for the same service or domain.
- Every M4 action must support read-only preview or dry-run before mutation.
- Every cost-related P0 must include estimated impact, confidence, effort, risk, owner, and verification.
- Every security-related P0 must include permission scope, audit trail, suppression policy, and stale-data behavior.
- Every resilience or disaster-recovery P0 must include recovery evidence, drill path, RTO/RPO fields where relevant, and rollback or recovery notes.
