# Deterministic and Agentic Operating Model

## Layer 1: Deterministic Evidence

This layer is trusted. It collects facts, computes rules, and emits reason-coded findings without LLM involvement.

- Collectors: cloud APIs, Kubernetes APIs, database system tables, Kafka Admin APIs, Linux procfs/sysfs/journald/systemd, OpenTelemetry, Prometheus, logs, and cost APIs.
- Evaluators: pure functions where possible, fixture-driven tests, stable thresholds, trend windows, and explainable reason codes.
- Outputs: evidence, score, finding, recommendation, severity, confidence, affected object, owner, and verification step.

## Layer 2: Evidence-Grounded AI Triage

This layer summarizes and prioritizes. It does not invent facts or execute actions.

- Inputs: deterministic evidence bundle, known missing data, resource metadata, recent changes, and historical incidents.
- Outputs: narrative explanation, likely causes, uncertainty, recommended diagnostics, and safe next steps.
- Guardrail: if evidence is missing, the model must say what to collect next.

## Layer 3: Bounded Agentic Investigation

This layer can use tools, but only inside a strict operating envelope.

- Default mode: read-only diagnostics.
- Tool registry: every tool declares scope, inputs, outputs, credential requirements, risk level, timeout, and audit shape.
- Budgets: token, time, API call, and shell command budgets.
- Traceability: every observation, hypothesis, tool call, and conclusion is replayable.
- Stop conditions: stale data, missing permission, high blast radius, ambiguous result, or repeated failure.
- Mutation rule: changes require explicit approval, dry-run output, blast-radius summary, and rollback or recovery notes.

## Layer 4: Approved Remediation

This layer changes resources safely.

- Preflight: validate credentials, freshness, dependency impact, maintenance window, and current desired state.
- Execution: idempotent where possible, rate-limited, audited, and cancellable.
- Verification: prove the finding changed state after execution.
- Learning: successful remediation can become a runbook; repeated incidents can become deterministic rules.
