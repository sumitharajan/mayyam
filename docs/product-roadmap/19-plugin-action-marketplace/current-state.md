# Plugin and Action Marketplace: Current State and Target State

## Product Mission

Make Mayyam extensible through connector SDKs, action SDKs, rule packs, UI extensions, private registries, signed plugins, and action catalogs.

## Current Maturity

greenfield pending: platform primitive is not yet implemented as a first-class Mayyam module

## What Exists Now

- Related capabilities exist in separate product areas, but this platform primitive is not yet unified.
- The current roadmap foundation gives this module shared resource identity, evidence, findings, actions, and audit concepts to build on.
- This module should be implemented as reusable infrastructure for all resource families rather than a one-off page.

## Gaps to Close

- Need plugin manifest, permission declaration, compatibility, risk declaration, signing, install, update, rollback, and audit events.
- Need SDK templates for resource connectors, remediation actions, compliance packs, and UI extensions.
- Need private marketplace support so teams can ship internal integrations safely.

## Source Modules Reviewed

- `README.md`
- `backend/src/api/routes/mod.rs`
- `backend/src/controllers/mod.rs`
- `backend/src/services/mod.rs`
- `frontend/src/App.js`
- `frontend/src/components/layout/AppLayout.js`

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

This folder contains 1,078 implementation-ready feature rows in `feature-backlog.csv`.
