# Linux Companion: Current State and Target State

## Product Mission

Revive the original Mayyam companion vision: lightweight Linux host presence for VPS, bare-metal, DigitalOcean, cloud VMs, and edge servers with observability, posture, triage, and safe interaction.

## Current Maturity

greenfield pending: no always-on Linux host companion or agent module was found in the active repository

## What Exists Now

- Mayyam has platform-level metrics and operational modules, but no host-resident Linux companion was found.
- The existing cloud, Kubernetes, database, Kafka, chaos, and AI surfaces provide patterns that the Linux companion can reuse.
- A Linux companion would close the gap between cloud resources and unmanaged servers, including DigitalOcean droplets, VPS hosts, bare-metal, and hybrid machines.

## Gaps to Close

- Need secure enrollment, host identity, lightweight collector, local policy, remote action model, update mechanism, and offline buffering.
- Need deterministic host health rules, security posture, package drift, service dependency analysis, cost/right-sizing, and incident runbooks.
- Need bounded agentic investigation that can inspect host state safely, propose commands, and require approvals before mutations.

## Source Modules Reviewed

- `README.md`
- `backend/src/api/routes/metrics.rs`
- `backend/src/api/routes/chaos.rs`
- `backend/src/api/routes/cloud.rs`
- `frontend/src/pages/Dashboard.js`

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

This folder contains 3,675 implementation-ready feature rows in `feature-backlog.csv`.
