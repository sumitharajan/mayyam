# Google Cloud: Release Plan

## Shipment Strategy

Ship this module in maturity order. Start with M1 inventory for identity and ownership, move to M2 observable for health and freshness, then M3 explainable for deterministic findings and AI triage. Only after those are reliable should the team ship M4 interactive workflows and M5 autonomous-assist investigation.

## Phase Counts

| Release Phase | Feature Rows |
| --- | --- |
| M1 inventory | 385 |
| M2 observable | 385 |
| M3 explainable | 770 |
| M4 interactive | 1540 |
| M5 autonomous-assist | 385 |

## Priority Counts

| Priority | Feature Rows |
| --- | --- |
| P0 | 1485 |
| P1 | 660 |
| P2 | 1320 |

## Ship Size Counts

| Ship Size | Feature Rows |
| --- | --- |
| L | 770 |
| M | 2310 |
| S | 385 |

## First P0 Vertical Slices

| Feature ID | Phase | Size | Service or Domain | Pillar | Workstream |
| --- | --- | --- | --- | --- | --- |
| 07-GOOGLE-CLOUD-00001 | M1 inventory | S | Compute Engine | cost | inventory |
| 07-GOOGLE-CLOUD-00064 | M1 inventory | S | Cloud Run | cost | inventory |
| 07-GOOGLE-CLOUD-00127 | M1 inventory | S | Cloud Functions | cost | inventory |
| 07-GOOGLE-CLOUD-00037 | M1 inventory | S | Compute Engine | security | inventory |
| 07-GOOGLE-CLOUD-00100 | M1 inventory | S | Cloud Run | security | inventory |
| 07-GOOGLE-CLOUD-00163 | M1 inventory | S | Cloud Functions | security | inventory |
| 07-GOOGLE-CLOUD-00010 | M1 inventory | S | Compute Engine | resilience | inventory |
| 07-GOOGLE-CLOUD-00073 | M1 inventory | S | Cloud Run | resilience | inventory |
| 07-GOOGLE-CLOUD-00136 | M1 inventory | S | Cloud Functions | resilience | inventory |
| 07-GOOGLE-CLOUD-00191 | M2 observable | M | App Engine | cost | telemetry |
| 07-GOOGLE-CLOUD-00254 | M2 observable | M | Batch | cost | telemetry |
| 07-GOOGLE-CLOUD-00317 | M2 observable | M | Google Kubernetes Engine | cost | telemetry |

## Execution Rules

- Do not begin M5 autonomous-assist until deterministic evidence, RBAC, audit, and replay are implemented for the same service or domain.
- Every M4 action must support read-only preview or dry-run before mutation.
- Every cost-related P0 must include estimated impact, confidence, effort, risk, owner, and verification.
- Every security-related P0 must include permission scope, audit trail, suppression policy, and stale-data behavior.
- Every resilience or disaster-recovery P0 must include recovery evidence, drill path, RTO/RPO fields where relevant, and rollback or recovery notes.
