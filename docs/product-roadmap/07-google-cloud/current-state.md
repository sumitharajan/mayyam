# Google Cloud: Current State and Target State

## Product Mission

Add Google Cloud as a first-class provider with architecture-framework posture, Cloud Operations evidence, Recommender insights, and managed service coverage.

## Current Maturity

greenfield pending: no Google Cloud connector surface was found in active backend routes

## What Exists Now

- The generic cloud resource model can become the host for GCP inventory.
- No GCP-specific SDK modules, service routes, sync workers, or frontend filters were found in the active module map.
- Multi-cloud posture needs to be designed before adding another provider-specific island.

## Gaps to Close

- Need organization/project/folder inventory, Cloud Asset Inventory, Cloud Monitoring/Logging, Recommender, Security Command Center, Billing, and IAM analysis.
- Need coverage for GKE, Cloud Run, Cloud SQL, AlloyDB, BigQuery, Pub/Sub, Cloud Storage, VPC, Cloud Armor, and Vertex AI.
- Need provider-agnostic scorecards with GCP-native evidence and resource hierarchy.

## Source Modules Reviewed

- `backend/src/api/routes/cloud.rs`
- `backend/src/controllers/cloud.rs`
- `backend/src/models/cloud_resource.rs`
- `frontend/src/components/cloud/CloudResourceBrowser.js`

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

This folder contains 3,465 implementation-ready feature rows in `feature-backlog.csv`.
