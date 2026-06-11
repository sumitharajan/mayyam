# Kubernetes Dashboard: Current State and Target State

## Product Mission

Build a multi-cluster Kubernetes control center that combines dashboard, ops workflows, security posture, capacity planning, cost allocation, and AI triage.

## Current Maturity

strong partial: many resource APIs and UI tabs exist, but advanced policy, capacity, cost, release safety, and multi-cluster workflows remain

## What Exists Now

- Cluster CRUD, namespaces, nodes, workloads, services, storage, pods, logs, events, config, RBAC, HPA, PDB, quotas, limits, and CRDs are represented in backend routes.
- Frontend dashboard tabs exist for workloads, pods, nodes, namespaces, metrics, logs, events, PVC/PV, and config/secrets.
- Cluster management is separate from runtime operations, which is useful but needs a unified user flow.

## Gaps to Close

- No full cluster security posture, policy admission simulation, image vulnerability rollup, or runtime risk scoring.
- No serious capacity/cost allocation, bin-packing, autoscaler recommendation, release safety, or disaster-recovery drill workflow.
- Some backend API surfaces are richer than the frontend tabs, so users cannot operate all available resources from the UI.

## Source Modules Reviewed

- `backend/src/api/routes/kubernetes.rs`
- `backend/src/services/kubernetes/`
- `backend/src/controllers/kubernetes.rs`
- `backend/src/controllers/rbac.rs`
- `frontend/src/pages/KubernetesDashboardPage.js`
- `frontend/src/components/kubernetes/`
- `frontend/src/services/kubernetesApiService.js`

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

This folder contains 2,009 implementation-ready feature rows in `feature-backlog.csv`.
