# AWS Cloud

Become the Well-Architected operating system for AWS: inventory, telemetry, cost, resilience, performance, scalability, security, DR, governance, and AI-assisted remediation.

## Where We Are

- AWS account management, resource sync, Cloud Resource browser, Cost Analytics, and many AWS control-plane list endpoints exist.
- Data-plane support exists for S3, DynamoDB, SQS, Kinesis, CloudWatch, RDS, Lambda, SNS, EC2, ElastiCache, and OpenSearch areas.
- CloudWatch metrics/logs, cost explorer pieces, Kinesis operations, and AWS analytics controller provide a base for evidence collection.

## Where We Should Be

- No single portfolio-level pillar score spanning cost, resilience, performance, scalability, security, DR, and operations.
- AWS service coverage is broad but uneven; several high-value managed services are planned-only or inventory-only.
- Remediation, approvals, policy exceptions, ownership, SLOs, evidence retention, and executive reporting need a common workflow model.

## Files

- `current-state.md` explains source modules reviewed, current maturity, gaps, and target operating model.
- `capability-map.md` lists the service/domain coverage and feature-row counts.
- `epics.md` breaks delivery into implementation slices.
- `release-plan.md` orders the backlog by maturity phase, priority, ship size, and first P0 vertical slices.
- `feature-backlog.csv` contains 5,544 implementation-ready feature rows with release phase, ship size, API contract, tests, rollout guardrail, and runbook scope.

## Build Order

1. Normalize resource/domain identity and evidence contracts.
2. Add deterministic rule packs for P0 pillars: cost, security, resilience.
3. Add scorecards, trend storage, and UI drilldowns.
4. Add evidence-grounded AI triage.
5. Add bounded agentic investigation with read-only tools first.
6. Add dry-run remediation, approvals, and audit history.
7. Add reports, export, notifications, and organization-level rollups.
