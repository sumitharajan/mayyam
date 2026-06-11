# Fleet Management Control Plane

Manage the Linux companion fleet with enrollment, heartbeat, policy bundles, updates, offline buffering, secure diagnostics, and approved host actions.

## Where We Are

- Related capabilities exist in separate product areas, but this platform primitive is not yet unified.
- The current roadmap foundation gives this module shared resource identity, evidence, findings, actions, and audit concepts to build on.
- This module should be implemented as reusable infrastructure for all resource families rather than a one-off page.

## Where We Should Be

- Need secure host enrollment, grouping, identity proof, air-gapped support, and revocation.
- Need agent heartbeat, self-diagnostics, policy bundles, update rollout, rollback, proxy support, and mTLS rotation.
- Need approved remote diagnostics, file collection, package patching, and fleet dashboards.

## Files

- `current-state.md` explains source modules reviewed, current maturity, gaps, and target operating model.
- `capability-map.md` lists the service/domain coverage and feature-row counts.
- `epics.md` breaks delivery into implementation slices.
- `feature-backlog.csv` contains 1,176 implementation-ready feature rows with release phase, ship size, API contract, tests, rollout guardrail, and runbook scope.

## Build Order

1. Normalize resource/domain identity and evidence contracts.
2. Add deterministic rule packs for P0 pillars: cost, security, resilience.
3. Add scorecards, trend storage, and UI drilldowns.
4. Add evidence-grounded AI triage.
5. Add bounded agentic investigation with read-only tools first.
6. Add dry-run remediation, approvals, and audit history.
7. Add reports, export, notifications, and organization-level rollups.
