# Kubernetes Dashboard

Build a multi-cluster Kubernetes control center that combines dashboard, ops workflows, security posture, capacity planning, cost allocation, and AI triage.

## Where We Are

- Cluster CRUD, namespaces, nodes, workloads, services, storage, pods, logs, events, config, RBAC, HPA, PDB, quotas, limits, and CRDs are represented in backend routes.
- Frontend dashboard tabs exist for workloads, pods, nodes, namespaces, metrics, logs, events, PVC/PV, and config/secrets.
- Cluster management is separate from runtime operations, which is useful but needs a unified user flow.

## Where We Should Be

- No full cluster security posture, policy admission simulation, image vulnerability rollup, or runtime risk scoring.
- No serious capacity/cost allocation, bin-packing, autoscaler recommendation, release safety, or disaster-recovery drill workflow.
- Some backend API surfaces are richer than the frontend tabs, so users cannot operate all available resources from the UI.

## Files

- `current-state.md` explains source modules reviewed, current maturity, gaps, and target operating model.
- `capability-map.md` lists the service/domain coverage and feature-row counts.
- `epics.md` breaks delivery into implementation slices.
- `feature-backlog.csv` contains 2,009 implementation-ready feature rows.

## Build Order

1. Normalize resource/domain identity and evidence contracts.
2. Add deterministic rule packs for P0 pillars: cost, security, resilience.
3. Add scorecards, trend storage, and UI drilldowns.
4. Add evidence-grounded AI triage.
5. Add bounded agentic investigation with read-only tools first.
6. Add dry-run remediation, approvals, and audit history.
7. Add reports, export, notifications, and organization-level rollups.
