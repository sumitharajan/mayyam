# Kafka Dashboard and Management

Build a Kafka operations platform for self-managed and managed Kafka: topology, health, lag, governance, message workflows, backup/restore, and AI incident triage.

## Where We Are

- Backend routes cover clusters, health, metrics, topics, produce/consume, consumer groups, offset reset, configs, partitions, brokers, backup, restore, migrate, and drain.
- Kafka service includes rdkafka Admin/Producer/Consumer flows, backup storage abstractions, compression, checksums, and Prometheus counters/gauges.
- Frontend currently exposes cluster and topic basics, while backend capabilities are much richer.

## Where We Should Be

- No first-class schema registry, Kafka Connect, Kafka Streams, ACL/SASL/TLS governance, or multi-vendor managed Kafka inventory.
- No deep lag forecasting, partition skew, broker disk/cpu/network saturation, ISR flapping, controller election, or replication risk triage.
- Backup/restore exists but needs enterprise workflows, retention policy, encryption, object storage, restore drills, and audit reporting.

## Files

- `current-state.md` explains source modules reviewed, current maturity, gaps, and target operating model.
- `capability-map.md` lists the service/domain coverage and feature-row counts.
- `epics.md` breaks delivery into implementation slices.
- `release-plan.md` orders the backlog by maturity phase, priority, ship size, and first P0 vertical slices.
- `feature-backlog.csv` contains 1,764 implementation-ready feature rows with release phase, ship size, API contract, tests, rollout guardrail, and runbook scope.

## Build Order

1. Normalize resource/domain identity and evidence contracts.
2. Add deterministic rule packs for P0 pillars: cost, security, resilience.
3. Add scorecards, trend storage, and UI drilldowns.
4. Add evidence-grounded AI triage.
5. Add bounded agentic investigation with read-only tools first.
6. Add dry-run remediation, approvals, and audit history.
7. Add reports, export, notifications, and organization-level rollups.
