# AWS Cloud: Current State and Target State

## Product Mission

Become the Well-Architected operating system for AWS: inventory, telemetry, cost, resilience, performance, scalability, security, DR, governance, and AI-assisted remediation.

## Current Maturity

strong partial: broad AWS inventory and data-plane foundations exist, but pillar scoring and governance are not yet unified

## What Exists Now

- AWS account management, resource sync, Cloud Resource browser, Cost Analytics, and many AWS control-plane list endpoints exist.
- Data-plane support exists for S3, DynamoDB, SQS, Kinesis, CloudWatch, RDS, Lambda, SNS, EC2, ElastiCache, and OpenSearch areas.
- CloudWatch metrics/logs, cost explorer pieces, Kinesis operations, and AWS analytics controller provide a base for evidence collection.

## Gaps to Close

- No single portfolio-level pillar score spanning cost, resilience, performance, scalability, security, DR, and operations.
- AWS service coverage is broad but uneven; several high-value managed services are planned-only or inventory-only.
- Remediation, approvals, policy exceptions, ownership, SLOs, evidence retention, and executive reporting need a common workflow model.

## Source Modules Reviewed

- `backend/src/api/routes/cloud.rs`
- `backend/src/services/aws/aws_control_plane/`
- `backend/src/services/aws/aws_data_plane/`
- `backend/src/controllers/cloud.rs`
- `backend/src/controllers/aws_analytics.rs`
- `backend/src/services/aws_cost_analytics.rs`
- `frontend/src/pages/CloudResources.js`
- `frontend/src/pages/CostAnalytics.js`
- `frontend/src/components/cloud/`

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

This folder contains 5,544 implementation-ready feature rows in `feature-backlog.csv`.
