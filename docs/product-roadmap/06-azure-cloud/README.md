# Azure Cloud

Add Azure as a first-class cloud provider with Azure Well-Architected posture, Azure Monitor evidence, Azure Advisor alignment, and managed service coverage.

## Where We Are

- The product has a generic cloud resources browser and provider abstraction shape that can host Azure.
- README mentions Azure cloud management as a feature goal.
- No Azure-specific SDK modules, routes, repositories, sync workers, or frontend filters were found in the active module map.

## Where We Should Be

- Need identity model, subscription/tenant inventory, resource graph sync, Azure Monitor ingestion, Advisor recommendations, policy compliance, cost management, and remediation workflows.
- Need coverage for AKS, databases, storage, networking, security, integration, analytics, AI, hybrid, and governance services.
- Need provider-agnostic pillar model shared with AWS/GCP while preserving Azure-native terms like resource groups, subscriptions, tenants, and management groups.

## Files

- `current-state.md` explains source modules reviewed, current maturity, gaps, and target operating model.
- `capability-map.md` lists the service/domain coverage and feature-row counts.
- `epics.md` breaks delivery into implementation slices.
- `feature-backlog.csv` contains 3,654 implementation-ready feature rows.

## Build Order

1. Normalize resource/domain identity and evidence contracts.
2. Add deterministic rule packs for P0 pillars: cost, security, resilience.
3. Add scorecards, trend storage, and UI drilldowns.
4. Add evidence-grounded AI triage.
5. Add bounded agentic investigation with read-only tools first.
6. Add dry-run remediation, approvals, and audit history.
7. Add reports, export, notifications, and organization-level rollups.
