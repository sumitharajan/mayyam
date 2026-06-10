# Linux Companion

Revive the original Mayyam companion vision: lightweight Linux host presence for VPS, bare-metal, DigitalOcean, cloud VMs, and edge servers with observability, posture, triage, and safe interaction.

## Where We Are

- Mayyam has platform-level metrics and operational modules, but no host-resident Linux companion was found.
- The existing cloud, Kubernetes, database, Kafka, chaos, and AI surfaces provide patterns that the Linux companion can reuse.
- A Linux companion would close the gap between cloud resources and unmanaged servers, including DigitalOcean droplets, VPS hosts, bare-metal, and hybrid machines.

## Where We Should Be

- Need secure enrollment, host identity, lightweight collector, local policy, remote action model, update mechanism, and offline buffering.
- Need deterministic host health rules, security posture, package drift, service dependency analysis, cost/right-sizing, and incident runbooks.
- Need bounded agentic investigation that can inspect host state safely, propose commands, and require approvals before mutations.

## Files

- `current-state.md` explains source modules reviewed, current maturity, gaps, and target operating model.
- `capability-map.md` lists the service/domain coverage and feature-row counts.
- `epics.md` breaks delivery into implementation slices.
- `feature-backlog.csv` contains 3,675 implementation-ready feature rows.

## Build Order

1. Normalize resource/domain identity and evidence contracts.
2. Add deterministic rule packs for P0 pillars: cost, security, resilience.
3. Add scorecards, trend storage, and UI drilldowns.
4. Add evidence-grounded AI triage.
5. Add bounded agentic investigation with read-only tools first.
6. Add dry-run remediation, approvals, and audit history.
7. Add reports, export, notifications, and organization-level rollups.
