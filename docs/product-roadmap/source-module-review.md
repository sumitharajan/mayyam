# Source Module Review

## Backend Product Surface

- `backend/src/api/routes/cloud.rs`: AWS account/resource routes, many AWS service inventory endpoints, CloudWatch metrics/logs, AWS cost, and AWS data-plane operations.
- `backend/src/services/aws/aws_control_plane/`: broad AWS control-plane service modules including EC2, S3, RDS, DynamoDB, IAM, CloudWatch, Config, KMS, ECS, EKS, Lambda, Redshift, EMR, Athena, Glue, Backup, WAF, Global Accelerator, AppSync, and more.
- `backend/src/services/aws/aws_data_plane/`: data-plane modules for CloudWatch, Cost Explorer, S3, SQS, DynamoDB, ElastiCache, EC2, Kinesis, RDS, SNS, Lambda, and OpenSearch.
- `backend/src/api/routes/kubernetes.rs`: broad Kubernetes routes for clusters, namespaces, nodes, workloads, services, storage, pods, logs, events, configmaps, secrets, jobs, cronjobs, ingress, endpoints, network policies, HPA, PDB, quotas, limits, service accounts, RBAC, node ops, replica sets, storage classes, CRDs, and custom resources.
- `backend/src/api/routes/kafka.rs`: Kafka routes for clusters, health, metrics, produce/consume, topics, consumer groups, offset reset, topic config, partitions, brokers, backup, restore, migrate, and drain.
- `backend/src/api/routes/database.rs`: generic database connection/query/schema/analyze routes plus MySQL telemetry, telemetry history, and signal endpoints.
- `backend/src/services/analytics/mysql_analytics/`: MySQL analytics, telemetry collection, and deterministic signals.
- `backend/src/services/analytics/postgres_analytics/postgres_analytics_service.rs`: early Postgres analytics exists but is not productized to the same level as MySQL.
- `backend/src/api/routes/chaos.rs`: chaos templates, experiments, runs, audit logs, and metrics. This should be tied into resilience and DR roadmaps.
- `backend/src/api/routes/cost_analytics.rs` and `backend/src/api/routes/budget.rs`: cost data, monthly aggregates, top services, anomalies, insights, budgets, alerts, and resource costs.
- No always-on Linux companion, host agent, host enrollment, package inventory, systemd/journald collector, or safe remote command module was found.

## Frontend Product Surface

- `frontend/src/components/layout/AppLayout.js`: navigation includes dashboard, sync runs, cloud resources, databases, Kafka, Kinesis, Kubernetes, cost analytics, Aurora, slow queries, query fingerprints, explain plans, AI analysis, chaos, chat, and settings.
- `frontend/src/pages/CloudResources.js` and `frontend/src/components/cloud/`: generic cloud resource browser and AWS resource details.
- `frontend/src/pages/KubernetesDashboardPage.js` and `frontend/src/components/kubernetes/`: Kubernetes dashboard tabs for workloads, storage, nodes, namespaces, pods, logs, metrics, events, config, and secrets.
- `frontend/src/pages/Databases.js` and `frontend/src/components/database/`: connection management, query tool, schema explorer, monitoring, MySQL triage, and MySQL telemetry.
- `frontend/src/pages/Kafka.js`: Kafka cluster/topic UI exists, but backend functionality is much deeper than frontend coverage.
- `frontend/src/pages/CostAnalytics.js`, `frontend/src/pages/SlowQueryDashboard.js`, `frontend/src/pages/AuroraClusters.js`, and `frontend/src/pages/ExplainPlans.js`: database and cost surfaces should become part of a unified operations cockpit.

## Main Architectural Gaps

- The project has many resource collectors and pages, but no single shared posture model for all pillars.
- AWS coverage is much stronger than Azure and Google Cloud, which appear pending.
- Kubernetes API coverage is broad, but the UI does not yet feel like a complete operations console.
- MySQL triage has the strongest evidence-grounded AI foundation; Postgres should reuse that shape.
- Kafka backend has management depth, but frontend, governance, schema, Connect, managed Kafka, and deep health analytics need expansion.
- Cost, chaos, security, and AI analysis are separate modules; the roadmap should converge them into each resource's scorecard and workflow.
- Linux hosts, VPS servers, and DigitalOcean-style unmanaged infrastructure are not yet first-class resources.
- AI triage exists in places, but true bounded agentic investigation with replayable tool calls and approval-gated mutation is not yet a platform primitive.
