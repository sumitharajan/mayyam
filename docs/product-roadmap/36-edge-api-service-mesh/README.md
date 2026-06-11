# Edge, API, and Service Mesh

Operate the request edge: API gateways, CDNs, DNS, ingress, egress, WAF, rate limits, auth, mTLS, canaries, traffic shifting, retries, timeouts, and DNS failover.

## Where We Are

- Related capabilities exist in separate product areas, but this platform primitive is not yet unified.
- The current roadmap foundation gives this module shared resource identity, evidence, findings, actions, and audit concepts to build on.
- This module should be implemented as reusable infrastructure for all resource families rather than a one-off page.

## Where We Should Be

- Need inventory for API gateways, CDN, DNS zones, service mesh, ingress controllers, and egress gateways.
- Need WAF, rate limit, auth, mTLS, route health, endpoint security, retry, timeout, circuit breaker, and canary posture.
- Need edge cache, DNS failover, API versioning, gateway cost, mesh latency, and traffic-shift workflows.

## Files

- `current-state.md` explains source modules reviewed, current maturity, gaps, and target operating model.
- `capability-map.md` lists the service/domain coverage and feature-row counts.
- `epics.md` breaks delivery into implementation slices.
- `release-plan.md` orders the backlog by maturity phase, priority, ship size, and first P0 vertical slices.
- `feature-backlog.csv` contains 1,127 implementation-ready feature rows with release phase, ship size, API contract, tests, rollout guardrail, and runbook scope.

## Build Order

1. Normalize resource/domain identity and evidence contracts.
2. Add deterministic rule packs for P0 pillars: cost, security, resilience.
3. Add scorecards, trend storage, and UI drilldowns.
4. Add evidence-grounded AI triage.
5. Add bounded agentic investigation with read-only tools first.
6. Add dry-run remediation, approvals, and audit history.
7. Add reports, export, notifications, and organization-level rollups.
