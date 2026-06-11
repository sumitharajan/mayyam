# Implementation Sequencing

## Phase 0: Product Spine

- Create shared tables and APIs for resource identity, ownership, evidence, finding, recommendation, score, suppression, workflow, audit event, and report snapshot.
- Define provider/domain adapters for AWS, Kubernetes, MySQL, Kafka, Postgres, Azure, Google Cloud, and Linux hosts.
- Add a common scorecard UI component that can render all seven pillars.
- Add a common action model: inspect, diagnose, dry-run, approve, execute, rollback-note, audit, and verify.
- Add a common agentic investigation trace model for tool calls, hypotheses, uncertainty, approvals, and replay.

## Phase 1: Make Existing Coverage Coherent

- AWS: convert existing service inventory into pillar scorecards and deterministic rule packs.
- Kubernetes: connect existing resource APIs to unified health, security, capacity, and cost views.
- MySQL: promote telemetry signals into persisted findings, saved triage sessions, and DBA runbooks.
- Kafka: expose the backend's existing backup, restore, consumer group, and broker operations in the frontend.
- Cost: convert cost analytics into opportunity records with impact, confidence, effort, owner, risk, and verification state.

## Phase 2: Close Pending Product Areas

- Postgres: ship parity with MySQL telemetry and triage, then add Postgres-specific vacuum, WAL, replication, bloat, and restore workflows.
- Azure: ship tenant/subscription/resource-group inventory, Azure Monitor evidence, Advisor/Policy ingestion, and scorecards.
- Google Cloud: ship org/folder/project inventory, Cloud Asset Inventory, Cloud Operations evidence, Recommender/SCC ingestion, and scorecards.
- Linux Companion: ship host enrollment, lightweight collector, systemd service, procfs/sysfs metrics, journald logs, package inventory, service posture, and read-only diagnostics.

## Phase 3: Enterprise Differentiation

- Add dry-run remediation, approvals, RBAC, audit trails, rollback notes, and change windows.
- Add executive reporting by portfolio, workload, team, cost center, environment, and business service.
- Add SLOs, RTO/RPO targets, DR drill evidence, resilience experiments, and post-incident review automation.
- Add managed-service specific packs for RDS/Aurora, EKS, MSK, AKS, Azure Database for PostgreSQL, GKE, Cloud SQL, AlloyDB, and BigQuery.
- Add agentic investigation loops that can safely operate across cloud APIs, Kubernetes APIs, database diagnostics, Kafka Admin APIs, and Linux hosts.

## Phase 4: Datadog and Dynatrace Replacement Parity

- Alerting: rule packs, composite alerts, anomaly alerts, escalation, on-call, notification routing, suppression, maintenance windows, and alert quality.
- Logs and telemetry: log ingest, parsing, search, live tail, archive, rehydration, metrics, traces, profiles, events, retention, storage SLOs, and cost controls.
- User experience: RUM, mobile monitoring, session replay, frontend SLOs, synthetic comparison, and user-impact scoring.
- Network and edge: flow logs, DNS, TLS, load balancers, CDN, API gateways, service mesh, WAF, rate limits, and route health.
- Enterprise control plane: tenants, workspaces, RBAC, ABAC, SSO, SCIM, audit, quotas, data residency, billing, and governance reports.
- Developer platform: CLI, Terraform provider, CI policy gates, SDKs, scaffolds, OpenAPI docs, sandbox, test harness, and sample integrations.

## Backlog Counts

| Area | Rows |
| --- | --- |
| AWS Cloud | 5,544 |
| Kubernetes Dashboard | 2,009 |
| MySQL AI Triager | 1,617 |
| Kafka Dashboard and Management | 1,764 |
| Postgres | 1,862 |
| Azure Cloud | 3,654 |
| Google Cloud | 3,465 |
| Linux Companion | 3,675 |
| Universal Resource Graph | 1,715 |
| Service Catalog and Ownership | 1,372 |
| Incident Command Center | 1,372 |
| SLO and Error Budget | 1,127 |
| OpenTelemetry Ingestion | 1,274 |
| Workflow and Action Engine | 1,568 |
| IaC Drift and Change Intelligence | 1,323 |
| Security and Compliance Packs | 1,176 |
| FinOps and Unit Economics | 1,225 |
| Digital Experience and Synthetic Checks | 833 |
| Plugin and Action Marketplace | 1,078 |
| Evidence Store and Time Machine | 1,176 |
| Learning and Runbook System | 1,029 |
| Fleet Management Control Plane | 1,176 |
| Kubernetes Cost Allocation | 980 |
| Applications and Microservices APM | 1,127 |
| AI and LLM Observability | 1,078 |
| Alerting, Notification, and On-Call | 1,225 |
| Log Management and Analytics | 1,274 |
| Dashboard and Query Workbench | 1,127 |
| RUM, Mobile Monitoring, and Session Replay | 1,176 |
| Network Observability | 1,274 |
| Secrets, Certificates, and PKI | 1,029 |
| Backup, Restore, and DR Orchestrator | 1,225 |
| Chaos and Reliability Engineering | 1,078 |
| Data Pipeline Observability | 1,127 |
| Tenant, RBAC, and Governance | 1,176 |
| Edge, API, and Service Mesh | 1,127 |
| Developer Platform, SDK, and CLI | 1,078 |
| Telemetry Storage and Retention | 1,176 |
