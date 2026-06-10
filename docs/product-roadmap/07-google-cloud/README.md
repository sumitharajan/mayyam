# Google Cloud

Add Google Cloud as a first-class provider with architecture-framework posture, Cloud Operations evidence, Recommender insights, and managed service coverage.

## Where We Are

- The generic cloud resource model can become the host for GCP inventory.
- No GCP-specific SDK modules, service routes, sync workers, or frontend filters were found in the active module map.
- Multi-cloud posture needs to be designed before adding another provider-specific island.

## Where We Should Be

- Need organization/project/folder inventory, Cloud Asset Inventory, Cloud Monitoring/Logging, Recommender, Security Command Center, Billing, and IAM analysis.
- Need coverage for GKE, Cloud Run, Cloud SQL, AlloyDB, BigQuery, Pub/Sub, Cloud Storage, VPC, Cloud Armor, and Vertex AI.
- Need provider-agnostic scorecards with GCP-native evidence and resource hierarchy.

## Files

- `current-state.md` explains source modules reviewed, current maturity, gaps, and target operating model.
- `capability-map.md` lists the service/domain coverage and feature-row counts.
- `epics.md` breaks delivery into implementation slices.
- `feature-backlog.csv` contains 3,465 implementation-ready feature rows.

## Build Order

1. Normalize resource/domain identity and evidence contracts.
2. Add deterministic rule packs for P0 pillars: cost, security, resilience.
3. Add scorecards, trend storage, and UI drilldowns.
4. Add evidence-grounded AI triage.
5. Add bounded agentic investigation with read-only tools first.
6. Add dry-run remediation, approvals, and audit history.
7. Add reports, export, notifications, and organization-level rollups.
