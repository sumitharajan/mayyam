# Azure Cloud: Current State and Target State

## Product Mission

Add Azure as a first-class cloud provider with Azure Well-Architected posture, Azure Monitor evidence, Azure Advisor alignment, and managed service coverage.

## Current Maturity

greenfield pending: README says Azure is a goal, but no Azure connector surface was found in the active backend routes

## What Exists Now

- The product has a generic cloud resources browser and provider abstraction shape that can host Azure.
- README mentions Azure cloud management as a feature goal.
- No Azure-specific SDK modules, routes, repositories, sync workers, or frontend filters were found in the active module map.

## Gaps to Close

- Need identity model, subscription/tenant inventory, resource graph sync, Azure Monitor ingestion, Advisor recommendations, policy compliance, cost management, and remediation workflows.
- Need coverage for AKS, databases, storage, networking, security, integration, analytics, AI, hybrid, and governance services.
- Need provider-agnostic pillar model shared with AWS/GCP while preserving Azure-native terms like resource groups, subscriptions, tenants, and management groups.

## Source Modules Reviewed

- `backend/src/api/routes/cloud.rs`
- `backend/src/controllers/cloud.rs`
- `backend/src/models/cloud_resource.rs`
- `frontend/src/components/cloud/CloudResourceBrowser.js`

## Target Operating Model

- One normalized resource identity per cloud service, Kubernetes object, database domain, or Kafka domain.
- Deterministic collectors produce evidence before any LLM summary is generated.
- Findings are scored by pillar: cost, resilience, performance, scalability, security, disaster-recovery, operational-excellence.
- Each resource supports deterministic triage and bounded agentic investigation as separate workflows.
- Each resource can be inspected and, where safe, interacted with through dry-run, approval, execution, audit, and rollback-note flows.
- Cost is not only visible; cost opportunities must be quantified, prioritized, and verified.
- Recommendations link back to raw evidence, ownership, suppression state, and implementation history.
- Remediation is dry-run first, approval-gated, audited, reversible where possible, and tested.
- Executive reports aggregate posture by account, cluster, service, Linux host, team, environment, application, and business unit.

## Backlog Size

This folder contains 3,654 implementation-ready feature rows in `feature-backlog.csv`.
