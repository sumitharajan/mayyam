# Kafka Dashboard and Management: Release Plan

## Shipment Strategy

Ship this module in maturity order. Start with M1 inventory for identity and ownership, move to M2 observable for health and freshness, then M3 explainable for deterministic findings and AI triage. Only after those are reliable should the team ship M4 interactive workflows and M5 autonomous-assist investigation.

## Phase Counts

| Release Phase | Feature Rows |
| --- | --- |
| M1 inventory | 252 |
| M2 observable | 252 |
| M3 explainable | 504 |
| M4 interactive | 504 |
| M5 autonomous-assist | 252 |

## Priority Counts

| Priority | Feature Rows |
| --- | --- |
| P0 | 756 |
| P1 | 1008 |

## Ship Size Counts

| Ship Size | Feature Rows |
| --- | --- |
| L | 252 |
| M | 1008 |
| S | 504 |

## First P0 Vertical Slices

| Feature ID | Phase | Size | Service or Domain | Pillar | Workstream |
| --- | --- | --- | --- | --- | --- |
| 04-KAFKA-DASHBOARD-MANAGEMENT-00001 | M1 inventory | S | Clusters | cost | inventory |
| 04-KAFKA-DASHBOARD-MANAGEMENT-00050 | M1 inventory | S | Brokers | cost | inventory |
| 04-KAFKA-DASHBOARD-MANAGEMENT-00099 | M1 inventory | S | Controller quorum | cost | inventory |
| 04-KAFKA-DASHBOARD-MANAGEMENT-00029 | M1 inventory | S | Clusters | security | inventory |
| 04-KAFKA-DASHBOARD-MANAGEMENT-00078 | M1 inventory | S | Brokers | security | inventory |
| 04-KAFKA-DASHBOARD-MANAGEMENT-00127 | M1 inventory | S | Controller quorum | security | inventory |
| 04-KAFKA-DASHBOARD-MANAGEMENT-00008 | M1 inventory | S | Clusters | resilience | inventory |
| 04-KAFKA-DASHBOARD-MANAGEMENT-00057 | M1 inventory | S | Brokers | resilience | inventory |
| 04-KAFKA-DASHBOARD-MANAGEMENT-00106 | M1 inventory | S | Controller quorum | resilience | inventory |
| 04-KAFKA-DASHBOARD-MANAGEMENT-00149 | M2 observable | M | Topics | cost | health |
| 04-KAFKA-DASHBOARD-MANAGEMENT-00198 | M2 observable | M | Partitions | cost | health |
| 04-KAFKA-DASHBOARD-MANAGEMENT-00247 | M2 observable | M | Replicas | cost | health |

## Execution Rules

- Do not begin M5 autonomous-assist until deterministic evidence, RBAC, audit, and replay are implemented for the same service or domain.
- Every M4 action must support read-only preview or dry-run before mutation.
- Every cost-related P0 must include estimated impact, confidence, effort, risk, owner, and verification.
- Every security-related P0 must include permission scope, audit trail, suppression policy, and stale-data behavior.
- Every resilience or disaster-recovery P0 must include recovery evidence, drill path, RTO/RPO fields where relevant, and rollback or recovery notes.
