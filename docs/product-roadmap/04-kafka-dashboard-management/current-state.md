# Kafka Dashboard and Management: Current State and Target State

## Product Mission

Build a Kafka operations platform for self-managed and managed Kafka: topology, health, lag, governance, message workflows, backup/restore, and AI incident triage.

## Current Maturity

medium partial: cluster/topic/consumer/backup APIs exist, but observability, governance, schema, Connect, and managed Kafka support need depth

## What Exists Now

- Backend routes cover clusters, health, metrics, topics, produce/consume, consumer groups, offset reset, configs, partitions, brokers, backup, restore, migrate, and drain.
- Kafka service includes rdkafka Admin/Producer/Consumer flows, backup storage abstractions, compression, checksums, and Prometheus counters/gauges.
- Frontend currently exposes cluster and topic basics, while backend capabilities are much richer.

## Gaps to Close

- No first-class schema registry, Kafka Connect, Kafka Streams, ACL/SASL/TLS governance, or multi-vendor managed Kafka inventory.
- No deep lag forecasting, partition skew, broker disk/cpu/network saturation, ISR flapping, controller election, or replication risk triage.
- Backup/restore exists but needs enterprise workflows, retention policy, encryption, object storage, restore drills, and audit reporting.

## Source Modules Reviewed

- `backend/src/api/routes/kafka.rs`
- `backend/src/controllers/kafka.rs`
- `backend/src/services/kafka.rs`
- `backend/tests/integration/kafka/`
- `frontend/src/pages/Kafka.js`
- `_work/_done/milestone1/kafka/`

## Target Operating Model

- One normalized resource identity per cloud service, Kubernetes object, database domain, or Kafka domain.
- Each backlog row is a shippable vertical slice with release phase, size, API contract, telemetry, tests, rollout guardrail, and runbook documentation.
- Deterministic collectors produce evidence before any LLM summary is generated.
- Findings are scored by pillar: cost, resilience, performance, scalability, security, disaster-recovery, operational-excellence.
- Each resource supports deterministic triage and bounded agentic investigation as separate workflows.
- Each resource can be inspected and, where safe, interacted with through dry-run, approval, execution, audit, and rollback-note flows.
- Cost is not only visible; cost opportunities must be quantified, prioritized, and verified.
- Recommendations link back to raw evidence, ownership, suppression state, and implementation history.
- Remediation is dry-run first, approval-gated, audited, reversible where possible, and tested.
- Executive reports aggregate posture by account, cluster, service, Linux host, team, environment, application, and business unit.

## Backlog Size

This folder contains 1,764 implementation-ready feature rows in `feature-backlog.csv`.
