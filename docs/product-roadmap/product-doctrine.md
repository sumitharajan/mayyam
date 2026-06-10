# Product Doctrine

## Positioning

Mayyam is a resource operating platform for SREs, DBAs, platform engineers, FinOps, SecOps, and builders who run infrastructure directly. The goal is to replace passive monitoring-only workflows with a system that can observe, explain, govern, interact with, and improve every resource.

Datadog and Dynatrace are useful reference points for telemetry depth, but Mayyam's differentiator should be resource agency:

- See the resource.
- Understand its Well-Architected posture.
- Explain issues deterministically from collected evidence.
- Investigate uncertain issues through bounded agentic AI.
- Interact with the resource safely.
- Quantify cost opportunities and operational tradeoffs.
- Convert recurring fixes into runbooks and automation.

## Resource Promise

Every supported resource must answer these questions:

- What is it, who owns it, where does it run, and what depends on it?
- What is its current health and what changed recently?
- How does it score across cost, resilience, performance, scalability, security, disaster-recovery, operational-excellence?
- What deterministic findings are provable from evidence?
- What uncertain hypotheses should an agent investigate next?
- What actions can Mayyam safely take or propose?
- What is the cost impact of leaving it as-is or changing it?
- What evidence proves the issue is fixed?

## Product Surfaces

- Portfolio cockpit: scorecards, risks, cost opportunities, incidents, and ownership across all providers and hosts.
- Resource workbench: one page per resource with inventory, metrics, logs, events, dependency graph, posture, triage, actions, and history.
- Investigation workspace: deterministic findings, agent traces, tool calls, hypotheses, approvals, and notes.
- Remediation center: dry-run plans, approvals, execution state, rollback notes, audit logs, and verification checks.
- Linux companion: host-level collector and operator for servers outside managed cloud control planes.
- Runbook library: promote repeated investigations into deterministic checks and approved workflows.

## What Not To Build

- Do not build a generic charting tool without resource actions.
- Do not let LLM output replace deterministic evidence.
- Do not execute mutations without scope, approval, audit, and rollback or recovery guidance.
- Do not hide cost impact inside performance or reliability recommendations.
- Do not make cloud-only assumptions; unmanaged Linux servers are first-class.
