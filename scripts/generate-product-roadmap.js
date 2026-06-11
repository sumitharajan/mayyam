const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "docs", "product-roadmap");

const pillars = [
  "cost",
  "resilience",
  "performance",
  "scalability",
  "security",
  "disaster-recovery",
  "operational-excellence",
];

const references = [
  ["AWS Well-Architected pillars", "https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html"],
  ["AWS services by category", "https://docs.aws.amazon.com/whitepapers/latest/aws-overview/amazon-web-services-cloud-platform.html"],
  ["AWS DR objectives", "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/disaster-recovery-dr-objectives.html"],
  ["Azure Well-Architected pillars", "https://learn.microsoft.com/en-us/azure/well-architected/pillars"],
  ["Azure products", "https://azure.microsoft.com/en-us/products/"],
  ["Google Cloud architecture framework", "https://cloud.google.com/architecture/framework"],
  ["Google Cloud products", "https://cloud.google.com/products"],
  ["Kubernetes components and resource concepts", "https://kubernetes.io/docs/concepts/overview/components/"],
  ["Apache Kafka introduction", "https://kafka.apache.org/intro/"],
  ["PostgreSQL monitoring", "https://www.postgresql.org/docs/current/monitoring.html"],
  ["Linux proc filesystem", "https://docs.kernel.org/filesystems/proc.html"],
  ["systemd service manager", "https://www.freedesktop.org/wiki/Software/systemd/"],
];

function slug(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function csv(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function write(filePath, body) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, body);
}

function table(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function plannedItems(entries) {
  return entries.map(([category, name]) => ({ category, name, status: "planned" }));
}

const cloudTemplates = [
  {
    workstream: "inventory",
    title: "Authoritative inventory collector",
    detail: (service, pillar) => `Collect ${service.name} configuration, tags, ownership, region, lifecycle state, and dependencies needed to score the ${pillar} pillar.`,
    backend: (service) => `Add or extend ${service.provider || "cloud"} connector, repository persistence, sync-run evidence, and normalized resource model for ${service.name}.`,
    frontend: (service) => `Expose ${service.name} in cloud resource browser with filters, resource detail, drift badges, and exportable evidence.`,
  },
  {
    workstream: "telemetry",
    title: "Metric and event coverage",
    detail: (service, pillar) => `Ingest metrics, logs, events, quotas, limits, and health signals that explain ${service.name} ${pillar} behavior.`,
    backend: (service) => `Implement poller/scraper jobs, rate-limit protection, metric normalization, and freshness tracking for ${service.name}.`,
    frontend: (service) => `Add charts, anomaly markers, freshness status, and drill-down links for ${service.name} signals.`,
  },
  {
    workstream: "posture",
    title: "Pillar posture rules",
    detail: (service, pillar) => `Evaluate ${service.name} against concrete ${pillar} checks with deterministic evidence before LLM summarization.`,
    backend: (service) => `Add rule pack, severity model, evidence serializer, suppressions, and regression tests for ${service.name}.`,
    frontend: (service) => `Show pass/fail posture, reason codes, affected resources, and suppress/assign actions for ${service.name}.`,
  },
  {
    workstream: "ai-triage",
    title: "Evidence-grounded AI triage",
    detail: (service, pillar) => `Generate ${service.name} ${pillar} triage that cites collected evidence, separates facts from hypotheses, and asks for missing data when context is incomplete.`,
    backend: (service) => `Create prompt template, context contract, guardrails, token budget, and provider routing for ${service.name}.`,
    frontend: (service) => `Add triage panel with explainability, follow-up questions, copy-to-runbook, and feedback capture for ${service.name}.`,
  },
  {
    workstream: "agentic-investigation",
    title: "Bounded agentic investigation",
    detail: (service, pillar) => `Let an agent investigate ${service.name} ${pillar} issues through approved read-only tools first, then propose mutation plans with evidence, uncertainty, blast radius, and stop conditions.`,
    backend: (service) => `Add tool registry, planner, execution trace, read-only default policy, budget limits, rollback plan schema, and approval gates for ${service.name}.`,
    frontend: (service) => `Add investigation timeline, tool-call evidence, confidence labels, approval prompts, replay, and promote-to-runbook actions for ${service.name}.`,
  },
  {
    workstream: "remediation",
    title: "Safe remediation workflow",
    detail: (service, pillar) => `Turn ${service.name} ${pillar} findings into dry-run, approval-gated remediation plans with rollback notes.`,
    backend: (service) => `Add workflow definitions, validation, RBAC checks, audit log, and idempotent execution adapters for ${service.name}.`,
    frontend: (service) => `Add remediation wizard, blast-radius summary, approvals, audit trail, and rollback status for ${service.name}.`,
  },
  {
    workstream: "slo-policy",
    title: "SLO and policy tracking",
    detail: (service, pillar) => `Track ${service.name} ${pillar} objectives over time with account, team, environment, and application ownership.`,
    backend: (service) => `Persist objective snapshots, policy state, trend deltas, and notification targets for ${service.name}.`,
    frontend: (service) => `Add objective cards, trend deltas, owner filters, and status history for ${service.name}.`,
  },
  {
    workstream: "forecasting",
    title: "Forecast and capacity model",
    detail: (service, pillar) => `Forecast ${service.name} ${pillar} risk, spend, capacity, or recovery exposure using recent history and limits.`,
    backend: (service) => `Add forecast jobs, baseline windows, confidence intervals, and backtesting fixtures for ${service.name}.`,
    frontend: (service) => `Add forecast bands, threshold controls, and what-if inputs for ${service.name}.`,
  },
  {
    workstream: "reporting",
    title: "Executive and engineering reports",
    detail: (service, pillar) => `Roll ${service.name} ${pillar} posture into portfolio, workload, and incident-review reports.`,
    backend: (service) => `Add report materialization, CSV/JSON export, API pagination, and scheduled delivery for ${service.name}.`,
    frontend: (service) => `Add report builder, saved views, download actions, and shareable links for ${service.name}.`,
  },
];

const platformTemplates = [
  {
    workstream: "inventory",
    title: "Inventory and dependency graph",
    detail: (item, pillar) => `Discover ${item.name}, relationships, ownership, labels, versions, and runtime dependencies for the ${pillar} pillar.`,
    backend: (item) => `Add collector, normalized model, repository methods, and freshness tracking for ${item.name}.`,
    frontend: (item) => `Add list/detail views, dependency graph, filters, and export for ${item.name}.`,
  },
  {
    workstream: "health",
    title: "Health and anomaly detection",
    detail: (item, pillar) => `Detect ${item.name} symptoms, thresholds, anomalies, and correlated events that affect ${pillar}.`,
    backend: (item) => `Add deterministic evaluators, metrics ingestion, and explainable findings for ${item.name}.`,
    frontend: (item) => `Add health badges, charts, timelines, and affected-object drilldowns for ${item.name}.`,
  },
  {
    workstream: "operations",
    title: "Operator workflow",
    detail: (item, pillar) => `Support read, validate, mutate, rollback, and audit workflows for ${item.name} with ${pillar} guardrails.`,
    backend: (item) => `Add validated commands, dry-run support, RBAC checks, and audit records for ${item.name}.`,
    frontend: (item) => `Add action menu, confirmations, diff previews, and result status for ${item.name}.`,
  },
  {
    workstream: "ai-triage",
    title: "AI assisted triage",
    detail: (item, pillar) => `Summarize ${item.name} evidence, likely causes, confidence, uncertainty, and next diagnostic commands for ${pillar} issues.`,
    backend: (item) => `Add context builder, prompt template, evidence citations, and LLM safety constraints for ${item.name}.`,
    frontend: (item) => `Add triage panel, follow-up prompts, saved notes, and feedback loop for ${item.name}.`,
  },
  {
    workstream: "agentic-investigation",
    title: "Bounded agentic investigation",
    detail: (item, pillar) => `Let an agent investigate ${item.name} ${pillar} issues with bounded tool use, read-only diagnostics first, explicit uncertainty, and approval-gated mutations.`,
    backend: (item) => `Add tool registry, planner, execution trace, read-only default policy, token/time budgets, rollback plan schema, and stop conditions for ${item.name}.`,
    frontend: (item) => `Add investigation timeline, tool-call evidence, confidence labels, approval prompts, replay, and promote-to-runbook actions for ${item.name}.`,
  },
  {
    workstream: "automation",
    title: "Automation and runbooks",
    detail: (item, pillar) => `Create repeatable runbooks and scheduled checks for ${item.name} ${pillar} posture.`,
    backend: (item) => `Add runbook schema, scheduler hooks, history, and notification events for ${item.name}.`,
    frontend: (item) => `Add runbook editor, schedule controls, history table, and owner assignment for ${item.name}.`,
  },
  {
    workstream: "tests",
    title: "Regression coverage",
    detail: (item, pillar) => `Protect ${item.name} ${pillar} behavior with unit, integration, fixture, and UI tests.`,
    backend: (item) => `Add fixtures, fake clients, unit tests, and API contract tests for ${item.name}.`,
    frontend: (item) => `Add component and e2e tests for ${item.name} critical flows.`,
  },
];

const awsServices = [
  ["Compute", "EC2", "existing"],
  ["Compute", "Auto Scaling", "planned"],
  ["Compute", "Lambda", "existing"],
  ["Compute", "ECS", "existing"],
  ["Compute", "EKS", "existing"],
  ["Compute", "Fargate", "partial"],
  ["Compute", "App Runner", "existing"],
  ["Compute", "Batch", "existing"],
  ["Compute", "Elastic Beanstalk", "planned"],
  ["Compute", "Lightsail", "planned"],
  ["Storage", "S3", "existing"],
  ["Storage", "EBS", "existing"],
  ["Storage", "EFS", "existing"],
  ["Storage", "FSx", "planned"],
  ["Storage", "S3 Glacier", "existing"],
  ["Storage", "AWS Backup", "existing"],
  ["Storage", "Storage Gateway", "existing"],
  ["Storage", "DataSync", "planned"],
  ["Database", "RDS", "existing"],
  ["Database", "Aurora", "partial"],
  ["Database", "DynamoDB", "existing"],
  ["Database", "ElastiCache", "existing"],
  ["Database", "DocumentDB", "planned"],
  ["Database", "Neptune", "planned"],
  ["Database", "Timestream", "planned"],
  ["Database", "MemoryDB", "planned"],
  ["Analytics", "Redshift", "existing"],
  ["Analytics", "Athena", "existing"],
  ["Analytics", "Glue", "existing"],
  ["Analytics", "EMR", "existing"],
  ["Analytics", "Kinesis Data Streams", "existing"],
  ["Analytics", "Kinesis Data Analytics", "existing"],
  ["Analytics", "Kinesis Data Firehose", "planned"],
  ["Analytics", "MSK", "planned"],
  ["Analytics", "OpenSearch Service", "existing"],
  ["Analytics", "QuickSight", "planned"],
  ["Analytics", "Lake Formation", "planned"],
  ["Application Integration", "SQS", "existing"],
  ["Application Integration", "SNS", "existing"],
  ["Application Integration", "EventBridge", "existing"],
  ["Application Integration", "Step Functions", "existing"],
  ["Application Integration", "AppSync", "existing"],
  ["Application Integration", "Amazon MQ", "planned"],
  ["Application Integration", "API Gateway", "existing"],
  ["Networking", "VPC", "existing"],
  ["Networking", "Subnets", "existing"],
  ["Networking", "Security Groups", "existing"],
  ["Networking", "NAT Gateway", "existing"],
  ["Networking", "Internet Gateway", "existing"],
  ["Networking", "Route Tables", "existing"],
  ["Networking", "Network ACLs", "existing"],
  ["Networking", "Elastic Load Balancing", "existing"],
  ["Networking", "CloudFront", "existing"],
  ["Networking", "Route 53", "planned"],
  ["Networking", "Global Accelerator", "existing"],
  ["Networking", "Transit Gateway", "planned"],
  ["Networking", "PrivateLink", "planned"],
  ["Security", "IAM", "existing"],
  ["Security", "KMS", "existing"],
  ["Security", "ACM", "existing"],
  ["Security", "CloudTrail", "existing"],
  ["Security", "AWS Config", "existing"],
  ["Security", "WAF", "existing"],
  ["Security", "Shield", "planned"],
  ["Security", "GuardDuty", "planned"],
  ["Security", "Security Hub", "planned"],
  ["Security", "Inspector", "planned"],
  ["Security", "Macie", "planned"],
  ["Security", "Secrets Manager", "planned"],
  ["Management", "CloudWatch Metrics", "existing"],
  ["Management", "CloudWatch Logs", "existing"],
  ["Management", "CloudWatch Alarms", "existing"],
  ["Management", "CloudWatch Dashboards", "existing"],
  ["Management", "Systems Manager", "existing"],
  ["Management", "Organizations", "planned"],
  ["Management", "Control Tower", "planned"],
  ["Management", "Service Catalog", "planned"],
  ["Management", "Trusted Advisor", "planned"],
  ["Management", "Compute Optimizer", "planned"],
  ["Management", "Health", "planned"],
  ["Management", "Resilience Hub", "planned"],
  ["Migration and DR", "DMS", "planned"],
  ["Migration and DR", "Application Migration Service", "planned"],
  ["Migration and DR", "Elastic Disaster Recovery", "planned"],
  ["AI and ML", "Bedrock", "planned"],
  ["AI and ML", "SageMaker AI", "planned"],
  ["AI and ML", "Textract", "planned"],
  ["AI and ML", "Comprehend", "planned"],
].map(([category, name, status]) => ({ category, name, status, provider: "aws" }));

const azureServices = [
  ["Compute", "Virtual Machines"],
  ["Compute", "Virtual Machine Scale Sets"],
  ["Compute", "Azure Functions"],
  ["Compute", "Azure App Service"],
  ["Compute", "Azure Batch"],
  ["Containers", "Azure Kubernetes Service"],
  ["Containers", "Azure Container Apps"],
  ["Containers", "Azure Container Instances"],
  ["Containers", "Azure Container Registry"],
  ["Containers", "Azure Kubernetes Fleet Manager"],
  ["Databases", "Azure SQL Database"],
  ["Databases", "Azure SQL Managed Instance"],
  ["Databases", "Azure Database for PostgreSQL"],
  ["Databases", "Azure Database for MySQL"],
  ["Databases", "Azure Cosmos DB"],
  ["Databases", "Azure Managed Redis"],
  ["Databases", "Azure Cache for Redis"],
  ["Storage", "Azure Blob Storage"],
  ["Storage", "Azure Files"],
  ["Storage", "Azure Disk Storage"],
  ["Storage", "Azure NetApp Files"],
  ["Storage", "Azure Backup"],
  ["Storage", "Azure Site Recovery"],
  ["Networking", "Azure Virtual Network"],
  ["Networking", "Azure Load Balancer"],
  ["Networking", "Azure Application Gateway"],
  ["Networking", "Azure Front Door"],
  ["Networking", "Azure DNS"],
  ["Networking", "Azure Private Link"],
  ["Networking", "Azure Firewall"],
  ["Networking", "Azure DDoS Protection"],
  ["Security", "Microsoft Entra ID"],
  ["Security", "Azure Key Vault"],
  ["Security", "Microsoft Defender for Cloud"],
  ["Security", "Microsoft Sentinel"],
  ["Security", "Azure Policy"],
  ["Security", "Azure Role-Based Access Control"],
  ["Observability", "Azure Monitor"],
  ["Observability", "Log Analytics"],
  ["Observability", "Application Insights"],
  ["Observability", "Azure Advisor"],
  ["Governance", "Azure Arc"],
  ["Governance", "Azure Resource Graph"],
  ["Governance", "Azure Automation"],
  ["Governance", "Azure Cost Management"],
  ["Integration", "Azure Service Bus"],
  ["Integration", "Azure Event Hubs"],
  ["Integration", "Azure Event Grid"],
  ["Integration", "Azure Logic Apps"],
  ["Integration", "Azure API Management"],
  ["Analytics", "Azure Synapse Analytics"],
  ["Analytics", "Azure Databricks"],
  ["Analytics", "Microsoft Fabric"],
  ["Analytics", "Azure Data Factory"],
  ["Analytics", "Azure Stream Analytics"],
  ["AI", "Azure OpenAI in Foundry Models"],
  ["AI", "Azure Machine Learning"],
  ["AI", "Azure AI Search"],
].map(([category, name]) => ({ category, name, status: "planned", provider: "azure" }));

const gcpServices = [
  ["Compute", "Compute Engine"],
  ["Compute", "Cloud Run"],
  ["Compute", "Cloud Functions"],
  ["Compute", "App Engine"],
  ["Compute", "Batch"],
  ["Containers", "Google Kubernetes Engine"],
  ["Containers", "Artifact Registry"],
  ["Storage", "Cloud Storage"],
  ["Storage", "Persistent Disk"],
  ["Storage", "Filestore"],
  ["Storage", "Backup and DR Service"],
  ["Databases", "Cloud SQL"],
  ["Databases", "AlloyDB for PostgreSQL"],
  ["Databases", "Spanner"],
  ["Databases", "Firestore"],
  ["Databases", "Bigtable"],
  ["Databases", "Memorystore"],
  ["Networking", "Virtual Private Cloud"],
  ["Networking", "Cloud Load Balancing"],
  ["Networking", "Cloud CDN"],
  ["Networking", "Cloud DNS"],
  ["Networking", "Cloud NAT"],
  ["Networking", "Cloud Interconnect"],
  ["Networking", "Private Service Connect"],
  ["Security", "Cloud IAM"],
  ["Security", "Cloud KMS"],
  ["Security", "Secret Manager"],
  ["Security", "Security Command Center"],
  ["Security", "Cloud Armor"],
  ["Security", "Cloud IDS"],
  ["Security", "Cloud Audit Logs"],
  ["Observability", "Cloud Monitoring"],
  ["Observability", "Cloud Logging"],
  ["Observability", "Cloud Trace"],
  ["Observability", "Cloud Profiler"],
  ["Observability", "Error Reporting"],
  ["Governance", "Cloud Asset Inventory"],
  ["Governance", "Organization Policy Service"],
  ["Governance", "Policy Controller"],
  ["Governance", "Recommender"],
  ["Governance", "Cloud Billing"],
  ["Integration", "Pub/Sub"],
  ["Integration", "Workflows"],
  ["Integration", "Cloud Scheduler"],
  ["Integration", "Eventarc"],
  ["Analytics", "BigQuery"],
  ["Analytics", "Dataflow"],
  ["Analytics", "Dataproc"],
  ["Analytics", "Cloud Composer"],
  ["Analytics", "Datastream"],
  ["Analytics", "Looker"],
  ["AI", "Vertex AI"],
  ["AI", "Document AI"],
  ["AI", "Cloud Translation"],
  ["AI", "Speech-to-Text"],
].map(([category, name]) => ({ category, name, status: "planned", provider: "gcp" }));

const k8sItems = [
  "Clusters", "Namespaces", "Nodes", "Pods", "Deployments", "ReplicaSets", "StatefulSets",
  "DaemonSets", "Jobs", "CronJobs", "Services", "Ingress", "Gateway API", "Endpoints",
  "EndpointSlices", "ConfigMaps", "Secrets", "ServiceAccounts", "Roles", "RoleBindings",
  "ClusterRoles", "ClusterRoleBindings", "NetworkPolicies", "HorizontalPodAutoscalers",
  "VerticalPodAutoscalers", "PodDisruptionBudgets", "ResourceQuotas", "LimitRanges",
  "PersistentVolumes", "PersistentVolumeClaims", "StorageClasses", "VolumeSnapshots",
  "CustomResourceDefinitions", "CustomResources", "Events", "Pod Logs", "Pod Exec",
  "Admission Webhooks", "Pod Security Standards", "Node Taints", "Node Drains",
].map((name) => ({ category: "Kubernetes Resource", name, status: "partial" }));

const mysqlItems = [
  "Performance Schema", "sys schema", "slow query log", "digest statistics", "wait events",
  "InnoDB buffer pool", "redo log", "undo log", "binary logs", "replication status",
  "Group Replication", "Aurora MySQL", "RDS MySQL", "connection threads", "metadata locks",
  "deadlocks", "index cardinality", "unused indexes", "missing indexes", "table bloat",
  "partitioning", "temporary tables", "sort operations", "join buffers", "query plans",
  "schema explorer", "privilege audit", "TLS configuration", "backup posture",
  "restore drills", "parameter drift", "cost attribution", "AI prompt templates",
].map((name) => ({ category: "MySQL Domain", name, status: "partial" }));

const kafkaItems = [
  "Clusters", "Brokers", "Controller quorum", "Topics", "Partitions", "Replicas",
  "ISR health", "Consumer groups", "Offsets", "Lag", "Producers", "Consumers",
  "Admin API", "ACLs", "SASL", "TLS", "Quotas", "Retention policies",
  "Compaction policies", "Schema Registry", "Kafka Connect", "Connectors", "Kafka Streams",
  "MirrorMaker 2", "Tiered storage", "KRaft", "ZooKeeper migration", "Backup",
  "Restore", "Topic migration", "Message replay", "Dead-letter topics", "Poison messages",
  "Broker disk", "Network throughput", "Managed Kafka services",
].map((name) => ({ category: "Kafka Domain", name, status: "partial" }));

const postgresItems = [
  "pg_stat_activity", "pg_stat_statements", "pg_stat_database", "pg_stat_io",
  "pg_stat_wal", "pg_locks", "autovacuum", "VACUUM", "ANALYZE", "WAL archiving",
  "replication slots", "streaming replication", "logical replication", "connection pools",
  "prepared transactions", "index bloat", "table bloat", "missing indexes", "unused indexes",
  "query plans", "EXPLAIN ANALYZE", "partitioning", "toast storage", "checkpoint tuning",
  "shared buffers", "work_mem", "temp files", "deadlocks", "long transactions",
  "privilege audit", "row level security", "TLS configuration", "backup posture",
  "PITR restore", "RDS PostgreSQL", "Aurora PostgreSQL", "AlloyDB", "Azure Database for PostgreSQL",
].map((name) => ({ category: "Postgres Domain", name, status: "partial" }));

const linuxItems = [
  ["Host Identity", "Machine inventory"],
  ["Host Identity", "OS distribution and kernel"],
  ["Host Identity", "Cloud and VPS metadata"],
  ["Host Identity", "Hardware and virtualization"],
  ["Compute", "CPU utilization"],
  ["Compute", "CPU saturation"],
  ["Compute", "load average"],
  ["Compute", "scheduler latency"],
  ["Compute", "process inventory"],
  ["Compute", "process restarts"],
  ["Compute", "cgroups"],
  ["Memory", "memory utilization"],
  ["Memory", "swap activity"],
  ["Memory", "OOM events"],
  ["Memory", "page cache"],
  ["Memory", "memory leaks"],
  ["Storage", "filesystem utilization"],
  ["Storage", "inode utilization"],
  ["Storage", "disk latency"],
  ["Storage", "disk throughput"],
  ["Storage", "I/O wait"],
  ["Storage", "mount points"],
  ["Storage", "LVM volumes"],
  ["Storage", "RAID status"],
  ["Storage", "backup directories"],
  ["Networking", "network interfaces"],
  ["Networking", "TCP connections"],
  ["Networking", "socket backlog"],
  ["Networking", "packet drops"],
  ["Networking", "DNS resolution"],
  ["Networking", "routing table"],
  ["Networking", "firewall rules"],
  ["Networking", "TLS certificates"],
  ["Services", "systemd units"],
  ["Services", "service dependencies"],
  ["Services", "timers and cron jobs"],
  ["Services", "journald logs"],
  ["Services", "application logs"],
  ["Services", "log rotation"],
  ["Security", "SSH posture"],
  ["Security", "local users and groups"],
  ["Security", "sudoers policy"],
  ["Security", "open ports"],
  ["Security", "package vulnerabilities"],
  ["Security", "kernel hardening"],
  ["Security", "SELinux and AppArmor"],
  ["Security", "file permissions"],
  ["Security", "secrets on disk"],
  ["Security", "auditd events"],
  ["Packages", "package inventory"],
  ["Packages", "pending updates"],
  ["Packages", "repository drift"],
  ["Packages", "service restart required"],
  ["Containers", "Docker runtime"],
  ["Containers", "container health"],
  ["Containers", "container logs"],
  ["Containers", "container resource limits"],
  ["Containers", "image freshness"],
  ["Reliability", "boot health"],
  ["Reliability", "time synchronization"],
  ["Reliability", "kernel messages"],
  ["Reliability", "crash dumps"],
  ["Reliability", "watchdog status"],
  ["Cost", "VPS right-sizing"],
  ["Cost", "idle host detection"],
  ["Cost", "overprovisioned disk"],
  ["Cost", "network egress estimate"],
  ["Operations", "remote command execution"],
  ["Operations", "file inspection"],
  ["Operations", "configuration drift"],
  ["Operations", "patch orchestration"],
  ["Operations", "incident runbooks"],
  ["Observability", "OpenTelemetry collector"],
  ["Observability", "Prometheus node exporter"],
  ["Observability", "eBPF signals"],
].map(([category, name]) => ({ category, name, status: "planned" }));

const resourceGraphItems = plannedItems([
  ["Identity", "global resource identity"],
  ["Identity", "identity merge and split"],
  ["Identity", "resource aliases"],
  ["Identity", "external identifiers"],
  ["Ingestion", "cloud resource nodes"],
  ["Ingestion", "Kubernetes object nodes"],
  ["Ingestion", "Linux host nodes"],
  ["Ingestion", "database nodes"],
  ["Ingestion", "Kafka nodes"],
  ["Relationships", "dependency edge model"],
  ["Relationships", "runtime call edges"],
  ["Relationships", "network flow edges"],
  ["Relationships", "ownership edges"],
  ["Relationships", "cost allocation edges"],
  ["Relationships", "deployment edges"],
  ["Relationships", "incident impact edges"],
  ["Analysis", "blast radius traversal"],
  ["Analysis", "root cause path ranking"],
  ["Analysis", "change impact graph"],
  ["Analysis", "orphan resource detection"],
  ["Analysis", "stale edge cleanup"],
  ["Analysis", "critical path detection"],
  ["Timeline", "graph snapshots"],
  ["Timeline", "graph diff"],
  ["Timeline", "before and after incident view"],
  ["Query", "graph query API"],
  ["Query", "saved graph views"],
  ["Query", "graph export"],
  ["UI", "interactive topology map"],
  ["UI", "pillar overlay"],
  ["UI", "cost overlay"],
  ["UI", "security overlay"],
  ["UI", "SLO overlay"],
  ["Governance", "graph permissions"],
  ["Governance", "graph audit trail"],
]);

const serviceCatalogItems = plannedItems([
  ["Service Record", "service profile"],
  ["Service Record", "environment model"],
  ["Service Record", "lifecycle status"],
  ["Ownership", "team ownership"],
  ["Ownership", "on-call mapping"],
  ["Ownership", "secondary owner"],
  ["Ownership", "ownership review"],
  ["Ownership", "orphan resource assignment"],
  ["Engineering", "repository links"],
  ["Engineering", "CI/CD pipeline links"],
  ["Engineering", "deployment history"],
  ["Engineering", "feature flag links"],
  ["Operations", "runbook links"],
  ["Operations", "SLO links"],
  ["Operations", "incident links"],
  ["Operations", "support contacts"],
  ["FinOps", "cost center"],
  ["FinOps", "business capability"],
  ["FinOps", "unit economics owner"],
  ["Compliance", "data classification"],
  ["Compliance", "regulatory scope"],
  ["Compliance", "service criticality"],
  ["Automation", "service onboarding wizard"],
  ["Automation", "tag normalization"],
  ["Automation", "catalog drift detection"],
  ["UI", "service scorecard"],
  ["UI", "service dependency view"],
  ["UI", "service health timeline"],
]);

const incidentItems = plannedItems([
  ["Intake", "manual incident creation"],
  ["Intake", "alert triggered incident"],
  ["Intake", "security signal incident"],
  ["Intake", "cost anomaly incident"],
  ["Grouping", "alert deduplication"],
  ["Grouping", "resource correlation"],
  ["Grouping", "symptom clustering"],
  ["Severity", "severity policy"],
  ["Severity", "customer impact estimate"],
  ["Timeline", "incident event timeline"],
  ["Timeline", "change correlation"],
  ["Timeline", "agent investigation timeline"],
  ["Timeline", "action timeline"],
  ["Response", "responder roles"],
  ["Response", "war room notes"],
  ["Response", "handoff workflow"],
  ["Response", "status updates"],
  ["Response", "stakeholder notifications"],
  ["Diagnosis", "blast radius panel"],
  ["Diagnosis", "likely root cause ranking"],
  ["Diagnosis", "related resource graph"],
  ["Actions", "approved remediation list"],
  ["Actions", "rollback tracking"],
  ["Postmortem", "postmortem draft"],
  ["Postmortem", "action item extraction"],
  ["Postmortem", "learning to rule conversion"],
  ["Reporting", "MTTA and MTTR metrics"],
  ["Reporting", "incident review dashboard"],
]);

const sloItems = plannedItems([
  ["SLI", "availability SLI"],
  ["SLI", "latency SLI"],
  ["SLI", "error rate SLI"],
  ["SLI", "throughput SLI"],
  ["SLI", "freshness SLI"],
  ["SLI", "queue lag SLI"],
  ["SLI", "database query SLI"],
  ["SLI", "Kafka consumer lag SLI"],
  ["SLI", "synthetic check SLI"],
  ["SLO", "service SLO policy"],
  ["SLO", "resource SLO policy"],
  ["SLO", "dependency SLO policy"],
  ["SLO", "multi-region SLO policy"],
  ["Budget", "error budget burn rate"],
  ["Budget", "multi-window burn alert"],
  ["Budget", "budget exhaustion forecast"],
  ["Budget", "release gate on burn"],
  ["Reporting", "SLO scorecard"],
  ["Reporting", "executive reliability report"],
  ["Reporting", "SLO history"],
  ["Actions", "SLO breach investigation"],
  ["Actions", "SLO-driven remediation"],
  ["Actions", "post-incident SLO review"],
]);

const otelItems = plannedItems([
  ["Signals", "metrics ingestion"],
  ["Signals", "trace ingestion"],
  ["Signals", "log ingestion"],
  ["Signals", "baggage ingestion"],
  ["Signals", "profile ingestion"],
  ["Signals", "event ingestion"],
  ["Schema", "OpenTelemetry resource attributes"],
  ["Schema", "semantic conventions"],
  ["Schema", "service name normalization"],
  ["Pipeline", "collector enrollment"],
  ["Pipeline", "collector configuration"],
  ["Pipeline", "tail sampling"],
  ["Pipeline", "head sampling"],
  ["Pipeline", "cardinality control"],
  ["Pipeline", "PII redaction"],
  ["Pipeline", "log parsing"],
  ["Pipeline", "metric transforms"],
  ["Correlation", "trace to log correlation"],
  ["Correlation", "metric exemplar linking"],
  ["Correlation", "service map from traces"],
  ["Storage", "retention tiers"],
  ["Storage", "hot and cold telemetry"],
  ["UI", "trace waterfall"],
  ["UI", "log explorer"],
  ["UI", "metric explorer"],
  ["UI", "profile flamegraph"],
]);

const workflowItems = plannedItems([
  ["Core", "workflow definition"],
  ["Core", "workflow versioning"],
  ["Core", "workflow execution history"],
  ["Core", "workflow cancellation"],
  ["Core", "workflow replay"],
  ["Triggers", "manual trigger"],
  ["Triggers", "schedule trigger"],
  ["Triggers", "finding trigger"],
  ["Triggers", "incident trigger"],
  ["Triggers", "webhook trigger"],
  ["Actions", "HTTP action"],
  ["Actions", "cloud API action"],
  ["Actions", "Kubernetes action"],
  ["Actions", "database diagnostic action"],
  ["Actions", "Kafka admin action"],
  ["Actions", "Linux diagnostic action"],
  ["Logic", "branching"],
  ["Logic", "conditions"],
  ["Logic", "loops with limits"],
  ["Logic", "timeouts"],
  ["Logic", "retries and backoff"],
  ["Safety", "dry-run action"],
  ["Safety", "approval action"],
  ["Safety", "change window"],
  ["Safety", "rollback note"],
  ["Safety", "blast radius check"],
  ["Secrets", "scoped secret access"],
  ["Templates", "incident blueprint"],
  ["Templates", "remediation blueprint"],
  ["Templates", "security response blueprint"],
  ["UI", "workflow builder"],
  ["UI", "execution monitor"],
]);

const iacDriftItems = plannedItems([
  ["Sources", "Terraform state"],
  ["Sources", "Terraform plan"],
  ["Sources", "CloudFormation stack"],
  ["Sources", "Pulumi stack"],
  ["Sources", "Helm release"],
  ["Sources", "Kustomize overlay"],
  ["Sources", "Argo CD app"],
  ["Sources", "Flux Kustomization"],
  ["Sources", "raw Kubernetes YAML"],
  ["Detection", "resource drift"],
  ["Detection", "deleted managed resource"],
  ["Detection", "unmanaged resource"],
  ["Detection", "configuration drift"],
  ["Detection", "tag drift"],
  ["Detection", "security drift"],
  ["Detection", "cost drift"],
  ["Analysis", "drift blast radius"],
  ["Analysis", "drift owner mapping"],
  ["Analysis", "change source attribution"],
  ["Actions", "reconcile recommendation"],
  ["Actions", "PR proposal"],
  ["Actions", "rollback PR"],
  ["Actions", "import resource plan"],
  ["Governance", "policy-as-code gate"],
  ["Governance", "exception workflow"],
  ["UI", "drift diff viewer"],
  ["UI", "IaC lineage view"],
]);

const complianceItems = plannedItems([
  ["Framework", "CIS AWS Benchmark"],
  ["Framework", "CIS Kubernetes Benchmark"],
  ["Framework", "CIS Linux Benchmark"],
  ["Framework", "NIST control mapping"],
  ["Framework", "SOC2 control mapping"],
  ["Framework", "HIPAA control mapping"],
  ["Framework", "PCI DSS control mapping"],
  ["Framework", "AWS Foundational Security Best Practices"],
  ["Identity", "IAM privilege audit"],
  ["Identity", "CIEM entitlement review"],
  ["Identity", "stale principal detection"],
  ["Secrets", "secret exposure detection"],
  ["Secrets", "secret rotation posture"],
  ["Network", "public exposure audit"],
  ["Network", "firewall policy audit"],
  ["Workload", "container image vulnerability"],
  ["Workload", "package vulnerability"],
  ["Workload", "runtime protection finding"],
  ["Evidence", "control evidence snapshot"],
  ["Evidence", "exception approval"],
  ["Evidence", "audit export"],
  ["Reporting", "compliance dashboard"],
  ["Reporting", "control owner report"],
  ["Actions", "security remediation workflow"],
]);

const finopsItems = plannedItems([
  ["Ingestion", "AWS bill ingestion"],
  ["Ingestion", "Azure cost ingestion"],
  ["Ingestion", "Google Cloud billing ingestion"],
  ["Ingestion", "custom cost upload"],
  ["Allocation", "tag normalization"],
  ["Allocation", "cost center mapping"],
  ["Allocation", "service allocation"],
  ["Allocation", "team allocation"],
  ["Allocation", "customer allocation"],
  ["Allocation", "Kubernetes namespace allocation"],
  ["Allocation", "Kafka topic allocation"],
  ["Allocation", "database workload allocation"],
  ["Unit Economics", "cost per request"],
  ["Unit Economics", "cost per customer"],
  ["Unit Economics", "cost per job"],
  ["Unit Economics", "cost per query family"],
  ["Optimization", "rightsizing opportunity"],
  ["Optimization", "idle resource opportunity"],
  ["Optimization", "commitment discount opportunity"],
  ["Optimization", "storage tier opportunity"],
  ["Optimization", "network egress opportunity"],
  ["Governance", "budget policy"],
  ["Governance", "forecast"],
  ["Governance", "anomaly alert"],
  ["Verification", "realized savings tracking"],
]);

const syntheticItems = plannedItems([
  ["HTTP", "HTTP availability check"],
  ["HTTP", "API contract check"],
  ["HTTP", "latency percentile check"],
  ["Browser", "browser journey check"],
  ["Browser", "login journey check"],
  ["Browser", "checkout journey check"],
  ["Network", "DNS resolution check"],
  ["Network", "TLS expiry check"],
  ["Network", "TCP connect check"],
  ["Network", "regional latency check"],
  ["Network", "private location check"],
  ["Service", "dependency availability check"],
  ["Service", "third-party API check"],
  ["Service", "status page correlation"],
  ["Incident", "synthetic-triggered incident"],
  ["SLO", "synthetic SLI"],
  ["Reporting", "user journey health"],
]);

const pluginItems = plannedItems([
  ["SDK", "connector SDK"],
  ["SDK", "action SDK"],
  ["SDK", "rule pack SDK"],
  ["SDK", "UI extension SDK"],
  ["Manifest", "plugin manifest"],
  ["Manifest", "permission declaration"],
  ["Manifest", "compatibility declaration"],
  ["Manifest", "risk declaration"],
  ["Distribution", "private registry"],
  ["Distribution", "plugin signing"],
  ["Distribution", "install workflow"],
  ["Distribution", "update workflow"],
  ["Distribution", "rollback workflow"],
  ["Governance", "plugin review workflow"],
  ["Governance", "plugin audit events"],
  ["Governance", "plugin sandbox policy"],
  ["Templates", "resource connector template"],
  ["Templates", "remediation action template"],
  ["Templates", "compliance pack template"],
  ["Marketplace", "plugin catalog"],
  ["Marketplace", "action pack catalog"],
  ["Marketplace", "rule pack catalog"],
]);

const evidenceStoreItems = plannedItems([
  ["Storage", "resource config snapshot"],
  ["Storage", "metric snapshot"],
  ["Storage", "log event snapshot"],
  ["Storage", "finding snapshot"],
  ["Storage", "action execution snapshot"],
  ["Storage", "agent trace snapshot"],
  ["Storage", "cost snapshot"],
  ["Storage", "graph snapshot"],
  ["Query", "evidence query API"],
  ["Query", "time range query"],
  ["Query", "resource timeline query"],
  ["Query", "incident evidence query"],
  ["Diff", "config diff"],
  ["Diff", "finding diff"],
  ["Diff", "cost diff"],
  ["Replay", "investigation replay"],
  ["Replay", "workflow replay"],
  ["Governance", "retention policy"],
  ["Governance", "immutability policy"],
  ["Governance", "legal hold"],
  ["Governance", "access control"],
  ["Export", "CSV export"],
  ["Export", "JSON export"],
  ["Export", "postmortem evidence bundle"],
]);

const learningItems = plannedItems([
  ["Capture", "manual fix capture"],
  ["Capture", "incident learning capture"],
  ["Capture", "agent suggestion capture"],
  ["Conversion", "case to deterministic rule"],
  ["Conversion", "case to runbook"],
  ["Conversion", "case to workflow"],
  ["Conversion", "case to knowledge article"],
  ["Runbook", "runbook editor"],
  ["Runbook", "runbook versioning"],
  ["Runbook", "runbook approval"],
  ["Runbook", "runbook schedule"],
  ["Runbook", "runbook execution history"],
  ["Quality", "runbook success rate"],
  ["Quality", "rule false positive feedback"],
  ["Quality", "recommendation usefulness feedback"],
  ["Knowledge", "known issue library"],
  ["Knowledge", "diagnostic recipe library"],
  ["Knowledge", "team playbook library"],
  ["Automation", "learning backlog"],
  ["Automation", "owner assignment"],
  ["Automation", "verification task"],
]);

const fleetItems = plannedItems([
  ["Enrollment", "host enrollment token"],
  ["Enrollment", "host identity proof"],
  ["Enrollment", "fleet grouping"],
  ["Enrollment", "air-gapped enrollment"],
  ["Health", "agent heartbeat"],
  ["Health", "agent self diagnostics"],
  ["Health", "agent resource usage"],
  ["Policy", "policy bundle"],
  ["Policy", "local allowlist"],
  ["Policy", "command denylist"],
  ["Updates", "agent version inventory"],
  ["Updates", "rolling agent update"],
  ["Updates", "agent rollback"],
  ["Connectivity", "proxy support"],
  ["Connectivity", "offline buffering"],
  ["Connectivity", "mTLS rotation"],
  ["Actions", "remote diagnostic request"],
  ["Actions", "approved command execution"],
  ["Actions", "file collection request"],
  ["Actions", "package patch request"],
  ["Security", "host revocation"],
  ["Security", "credential rotation"],
  ["UI", "fleet dashboard"],
  ["UI", "host detail page"],
]);

const k8sCostItems = plannedItems([
  ["Ingestion", "OpenCost integration"],
  ["Ingestion", "cloud bill integration"],
  ["Allocation", "namespace cost"],
  ["Allocation", "workload cost"],
  ["Allocation", "pod cost"],
  ["Allocation", "node cost"],
  ["Allocation", "persistent volume cost"],
  ["Allocation", "GPU cost"],
  ["Allocation", "network cost"],
  ["Waste", "idle request cost"],
  ["Waste", "over-requested CPU"],
  ["Waste", "over-requested memory"],
  ["Waste", "orphaned volume cost"],
  ["Optimization", "rightsizing recommendation"],
  ["Optimization", "cluster autoscaler recommendation"],
  ["Optimization", "spot node opportunity"],
  ["Governance", "namespace budget"],
  ["Governance", "showback report"],
  ["Governance", "chargeback report"],
  ["Forecast", "workload cost forecast"],
]);

const apmItems = plannedItems([
  ["Discovery", "service auto-discovery"],
  ["Discovery", "endpoint inventory"],
  ["Discovery", "dependency map"],
  ["Metrics", "RED metrics"],
  ["Metrics", "USE metrics"],
  ["Metrics", "Apdex score"],
  ["Traces", "distributed trace view"],
  ["Traces", "slow span detection"],
  ["Traces", "database span analysis"],
  ["Traces", "external call analysis"],
  ["Errors", "error tracking"],
  ["Errors", "exception grouping"],
  ["Errors", "release regression detection"],
  ["Profiling", "CPU profiling"],
  ["Profiling", "memory profiling"],
  ["Profiling", "hot path detection"],
  ["Runtime", "JVM runtime metrics"],
  ["Runtime", "Node.js runtime metrics"],
  ["Runtime", "Python runtime metrics"],
  ["Deployment", "deploy marker"],
  ["Deployment", "feature flag correlation"],
  ["SLO", "service health score"],
  ["UI", "service workbench"],
]);

const aiObservabilityItems = plannedItems([
  ["Inventory", "model inventory"],
  ["Inventory", "prompt inventory"],
  ["Inventory", "agent inventory"],
  ["Telemetry", "LLM latency"],
  ["Telemetry", "LLM error rate"],
  ["Telemetry", "token usage"],
  ["Telemetry", "model cost"],
  ["Telemetry", "tool call trace"],
  ["Quality", "evaluation dataset"],
  ["Quality", "response quality score"],
  ["Quality", "grounding score"],
  ["Quality", "hallucination feedback"],
  ["Safety", "prompt injection detection"],
  ["Safety", "sensitive data leakage"],
  ["Safety", "unsafe tool call prevention"],
  ["Agent", "agent trace replay"],
  ["Agent", "agent budget controls"],
  ["Agent", "agent stop condition"],
  ["Governance", "model routing policy"],
  ["Governance", "provider failover"],
  ["Governance", "approval policy"],
  ["Reporting", "AI spend report"],
]);

const modules = [
  {
    folder: "01-aws-cloud",
    title: "AWS Cloud",
    maturity: "strong partial: broad AWS inventory and data-plane foundations exist, but pillar scoring and governance are not yet unified",
    mission: "Become the Well-Architected operating system for AWS: inventory, telemetry, cost, resilience, performance, scalability, security, DR, governance, and AI-assisted remediation.",
    codeRefs: [
      "backend/src/api/routes/cloud.rs",
      "backend/src/services/aws/aws_control_plane/",
      "backend/src/services/aws/aws_data_plane/",
      "backend/src/controllers/cloud.rs",
      "backend/src/controllers/aws_analytics.rs",
      "backend/src/services/aws_cost_analytics.rs",
      "frontend/src/pages/CloudResources.js",
      "frontend/src/pages/CostAnalytics.js",
      "frontend/src/components/cloud/",
    ],
    now: [
      "AWS account management, resource sync, Cloud Resource browser, Cost Analytics, and many AWS control-plane list endpoints exist.",
      "Data-plane support exists for S3, DynamoDB, SQS, Kinesis, CloudWatch, RDS, Lambda, SNS, EC2, ElastiCache, and OpenSearch areas.",
      "CloudWatch metrics/logs, cost explorer pieces, Kinesis operations, and AWS analytics controller provide a base for evidence collection.",
    ],
    gaps: [
      "No single portfolio-level pillar score spanning cost, resilience, performance, scalability, security, DR, and operations.",
      "AWS service coverage is broad but uneven; several high-value managed services are planned-only or inventory-only.",
      "Remediation, approvals, policy exceptions, ownership, SLOs, evidence retention, and executive reporting need a common workflow model.",
    ],
    services: awsServices,
    templates: cloudTemplates,
  },
  {
    folder: "02-kubernetes-dashboard",
    title: "Kubernetes Dashboard",
    maturity: "strong partial: many resource APIs and UI tabs exist, but advanced policy, capacity, cost, release safety, and multi-cluster workflows remain",
    mission: "Build a multi-cluster Kubernetes control center that combines dashboard, ops workflows, security posture, capacity planning, cost allocation, and AI triage.",
    codeRefs: [
      "backend/src/api/routes/kubernetes.rs",
      "backend/src/services/kubernetes/",
      "backend/src/controllers/kubernetes.rs",
      "backend/src/controllers/rbac.rs",
      "frontend/src/pages/KubernetesDashboardPage.js",
      "frontend/src/components/kubernetes/",
      "frontend/src/services/kubernetesApiService.js",
    ],
    now: [
      "Cluster CRUD, namespaces, nodes, workloads, services, storage, pods, logs, events, config, RBAC, HPA, PDB, quotas, limits, and CRDs are represented in backend routes.",
      "Frontend dashboard tabs exist for workloads, pods, nodes, namespaces, metrics, logs, events, PVC/PV, and config/secrets.",
      "Cluster management is separate from runtime operations, which is useful but needs a unified user flow.",
    ],
    gaps: [
      "No full cluster security posture, policy admission simulation, image vulnerability rollup, or runtime risk scoring.",
      "No serious capacity/cost allocation, bin-packing, autoscaler recommendation, release safety, or disaster-recovery drill workflow.",
      "Some backend API surfaces are richer than the frontend tabs, so users cannot operate all available resources from the UI.",
    ],
    services: k8sItems,
    templates: platformTemplates,
  },
  {
    folder: "03-mysql-ai-triager",
    title: "MySQL AI Triager",
    maturity: "medium partial: real telemetry, deterministic signals, and LLM summary exist, but it is not yet a full DBA copilot",
    mission: "Turn MySQL telemetry into evidence-grounded DBA triage, safe recommendations, regression detection, and repeatable performance operations.",
    codeRefs: [
      "backend/src/services/analytics/mysql_analytics/mysql_analytics_service.rs",
      "backend/src/services/analytics/mysql_analytics/mysql_telemetry.rs",
      "backend/src/services/analytics/mysql_analytics/mysql_signals.rs",
      "backend/src/controllers/ai.rs",
      "backend/migrations/015_mysql_triaging_prompts.sql",
      "backend/migrations/021_mysql_telemetry_snapshots.sql",
      "frontend/src/components/database/MySqlTriage.js",
      "frontend/src/components/database/MySqlTelemetry.js",
    ],
    now: [
      "MySQL telemetry endpoints, history, signals, performance analysis, and AI triage workflows for performance, connections, and index advice exist.",
      "The implementation uses deterministic collectors/signals plus LLM prompts rather than an autonomous tool loop.",
      "Telemetry snapshots and prompt compatibility migrations exist, which is the right foundation for evidence-grounded triage.",
    ],
    gaps: [
      "Triage follow-ups are UI placeholders and there is no saved DBA investigation workspace.",
      "No full remediation planner for indexes, parameters, connection pools, replication, backup/restore, or RDS/Aurora-specific actions.",
      "No benchmark baseline, workload replay, SLO, or regression detection workflow tied to application releases.",
    ],
    services: mysqlItems,
    templates: platformTemplates,
  },
  {
    folder: "04-kafka-dashboard-management",
    title: "Kafka Dashboard and Management",
    maturity: "medium partial: cluster/topic/consumer/backup APIs exist, but observability, governance, schema, Connect, and managed Kafka support need depth",
    mission: "Build a Kafka operations platform for self-managed and managed Kafka: topology, health, lag, governance, message workflows, backup/restore, and AI incident triage.",
    codeRefs: [
      "backend/src/api/routes/kafka.rs",
      "backend/src/controllers/kafka.rs",
      "backend/src/services/kafka.rs",
      "backend/tests/integration/kafka/",
      "frontend/src/pages/Kafka.js",
      "_work/_done/milestone1/kafka/",
    ],
    now: [
      "Backend routes cover clusters, health, metrics, topics, produce/consume, consumer groups, offset reset, configs, partitions, brokers, backup, restore, migrate, and drain.",
      "Kafka service includes rdkafka Admin/Producer/Consumer flows, backup storage abstractions, compression, checksums, and Prometheus counters/gauges.",
      "Frontend currently exposes cluster and topic basics, while backend capabilities are much richer.",
    ],
    gaps: [
      "No first-class schema registry, Kafka Connect, Kafka Streams, ACL/SASL/TLS governance, or multi-vendor managed Kafka inventory.",
      "No deep lag forecasting, partition skew, broker disk/cpu/network saturation, ISR flapping, controller election, or replication risk triage.",
      "Backup/restore exists but needs enterprise workflows, retention policy, encryption, object storage, restore drills, and audit reporting.",
    ],
    services: kafkaItems,
    templates: platformTemplates,
  },
  {
    folder: "05-postgres",
    title: "Postgres",
    maturity: "early partial: backend analytics and prompt migration exist, but productized Postgres triage is pending",
    mission: "Reach parity with MySQL and then exceed it with Postgres-specific internals: pg_stat evidence, vacuum, WAL, replication, bloat, planner, security, backup, and managed-service posture.",
    codeRefs: [
      "backend/src/services/analytics/postgres_analytics/postgres_analytics_service.rs",
      "backend/migrations/017_postgres_triaging_prompts.sql",
      "_work/_done/milestone2/postgres-performance-analysis/postgres-performance-analysis.md",
      "frontend/src/pages/Databases.js",
      "frontend/src/components/database/",
    ],
    now: [
      "Postgres analytics service exists with query stats, performance metrics, storage metrics, cost placeholders, and issue detection.",
      "Postgres triage prompts have a migration, and generic database connection/query/schema/analysis routes can call provider-specific analysis.",
      "The current product surface is less explicit than MySQL: no Postgres telemetry page, no Postgres triage component, and no Postgres-specific endpoint family.",
    ],
    gaps: [
      "No productized pg_stat dashboard, autovacuum/bloat workflow, WAL/replication view, or PITR restore drill support.",
      "No managed-service variants for RDS PostgreSQL, Aurora PostgreSQL, AlloyDB, Azure Database for PostgreSQL, or Cloud SQL for PostgreSQL.",
      "No Postgres-specific evidence contract for LLM triage with pg_stat_statements, pg_locks, pg_stat_io, and EXPLAIN artifacts.",
    ],
    services: postgresItems,
    templates: platformTemplates,
  },
  {
    folder: "06-azure-cloud",
    title: "Azure Cloud",
    maturity: "greenfield pending: README says Azure is a goal, but no Azure connector surface was found in the active backend routes",
    mission: "Add Azure as a first-class cloud provider with Azure Well-Architected posture, Azure Monitor evidence, Azure Advisor alignment, and managed service coverage.",
    codeRefs: [
      "backend/src/api/routes/cloud.rs",
      "backend/src/controllers/cloud.rs",
      "backend/src/models/cloud_resource.rs",
      "frontend/src/components/cloud/CloudResourceBrowser.js",
    ],
    now: [
      "The product has a generic cloud resources browser and provider abstraction shape that can host Azure.",
      "README mentions Azure cloud management as a feature goal.",
      "No Azure-specific SDK modules, routes, repositories, sync workers, or frontend filters were found in the active module map.",
    ],
    gaps: [
      "Need identity model, subscription/tenant inventory, resource graph sync, Azure Monitor ingestion, Advisor recommendations, policy compliance, cost management, and remediation workflows.",
      "Need coverage for AKS, databases, storage, networking, security, integration, analytics, AI, hybrid, and governance services.",
      "Need provider-agnostic pillar model shared with AWS/GCP while preserving Azure-native terms like resource groups, subscriptions, tenants, and management groups.",
    ],
    services: azureServices,
    templates: cloudTemplates,
  },
  {
    folder: "07-google-cloud",
    title: "Google Cloud",
    maturity: "greenfield pending: no Google Cloud connector surface was found in active backend routes",
    mission: "Add Google Cloud as a first-class provider with architecture-framework posture, Cloud Operations evidence, Recommender insights, and managed service coverage.",
    codeRefs: [
      "backend/src/api/routes/cloud.rs",
      "backend/src/controllers/cloud.rs",
      "backend/src/models/cloud_resource.rs",
      "frontend/src/components/cloud/CloudResourceBrowser.js",
    ],
    now: [
      "The generic cloud resource model can become the host for GCP inventory.",
      "No GCP-specific SDK modules, service routes, sync workers, or frontend filters were found in the active module map.",
      "Multi-cloud posture needs to be designed before adding another provider-specific island.",
    ],
    gaps: [
      "Need organization/project/folder inventory, Cloud Asset Inventory, Cloud Monitoring/Logging, Recommender, Security Command Center, Billing, and IAM analysis.",
      "Need coverage for GKE, Cloud Run, Cloud SQL, AlloyDB, BigQuery, Pub/Sub, Cloud Storage, VPC, Cloud Armor, and Vertex AI.",
      "Need provider-agnostic scorecards with GCP-native evidence and resource hierarchy.",
    ],
    services: gcpServices,
    templates: cloudTemplates,
  },
  {
    folder: "08-linux-companion",
    title: "Linux Companion",
    maturity: "greenfield pending: no always-on Linux host companion or agent module was found in the active repository",
    mission: "Revive the original Mayyam companion vision: lightweight Linux host presence for VPS, bare-metal, DigitalOcean, cloud VMs, and edge servers with observability, posture, triage, and safe interaction.",
    codeRefs: [
      "README.md",
      "backend/src/api/routes/metrics.rs",
      "backend/src/api/routes/chaos.rs",
      "backend/src/api/routes/cloud.rs",
      "frontend/src/pages/Dashboard.js",
    ],
    now: [
      "Mayyam has platform-level metrics and operational modules, but no host-resident Linux companion was found.",
      "The existing cloud, Kubernetes, database, Kafka, chaos, and AI surfaces provide patterns that the Linux companion can reuse.",
      "A Linux companion would close the gap between cloud resources and unmanaged servers, including DigitalOcean droplets, VPS hosts, bare-metal, and hybrid machines.",
    ],
    gaps: [
      "Need secure enrollment, host identity, lightweight collector, local policy, remote action model, update mechanism, and offline buffering.",
      "Need deterministic host health rules, security posture, package drift, service dependency analysis, cost/right-sizing, and incident runbooks.",
      "Need bounded agentic investigation that can inspect host state safely, propose commands, and require approvals before mutations.",
    ],
    services: linuxItems,
    templates: platformTemplates,
  },
];

function platformModule(folder, title, mission, services, gaps) {
  return {
    folder,
    title,
    maturity: "greenfield pending: platform primitive is not yet implemented as a first-class Mayyam module",
    mission,
    codeRefs: [
      "README.md",
      "backend/src/api/routes/mod.rs",
      "backend/src/controllers/mod.rs",
      "backend/src/services/mod.rs",
      "frontend/src/App.js",
      "frontend/src/components/layout/AppLayout.js",
    ],
    now: [
      "Related capabilities exist in separate product areas, but this platform primitive is not yet unified.",
      "The current roadmap foundation gives this module shared resource identity, evidence, findings, actions, and audit concepts to build on.",
      "This module should be implemented as reusable infrastructure for all resource families rather than a one-off page.",
    ],
    gaps,
    services,
    templates: platformTemplates,
  };
}

modules.push(
  platformModule(
    "09-universal-resource-graph",
    "Universal Resource Graph",
    "Create the live dependency graph that connects resources, services, owners, costs, incidents, deployments, telemetry, and actions across the whole platform.",
    resourceGraphItems,
    [
      "Need a normalized graph model for nodes, edges, snapshots, and time-aware diffs.",
      "Need blast-radius, root-cause path ranking, ownership overlays, cost overlays, security overlays, and incident overlays.",
      "Need UI and API support for graph query, saved views, exports, permissions, and stale-edge governance.",
    ],
  ),
  platformModule(
    "10-service-catalog-ownership",
    "Service Catalog and Ownership",
    "Make every resource operationally accountable by linking it to a service, owner, team, on-call path, repository, SLO, cost center, runbook, and business context.",
    serviceCatalogItems,
    [
      "Need service ownership records and orphan-resource assignment workflows.",
      "Need team, on-call, repository, runbook, cost-center, compliance, and service-criticality mapping.",
      "Need service scorecards that roll up resource posture into owner-facing accountability.",
    ],
  ),
  platformModule(
    "11-incident-command-center",
    "Incident Command Center",
    "Turn findings and alerts into coordinated incident response with timeline, blast radius, agent investigation, actions, postmortems, and learning loops.",
    incidentItems,
    [
      "Need incident intake, grouping, deduplication, severity, timeline, responder roles, and status updates.",
      "Need automatic correlation with resource graph, recent changes, cost anomalies, security signals, and agent investigations.",
      "Need postmortem generation and conversion of lessons into runbooks, rules, and workflows.",
    ],
  ),
  platformModule(
    "12-slo-error-budget",
    "SLO and Error Budget",
    "Connect resource posture to user-facing reliability by tracking SLIs, SLOs, burn rates, dependency health, and release risk.",
    sloItems,
    [
      "Need generic SLI definitions for availability, latency, error rate, throughput, lag, freshness, and synthetic checks.",
      "Need burn-rate policies, release gates, dependency SLOs, resource SLOs, and executive reliability reporting.",
      "Need SLO-driven triage and remediation that prioritizes customer-impacting failures.",
    ],
  ),
  platformModule(
    "13-opentelemetry-ingestion",
    "OpenTelemetry Ingestion",
    "Ingest and correlate open telemetry signals so Mayyam can see applications, infrastructure, and resource behavior without a closed instrumentation model.",
    otelItems,
    [
      "Need metrics, traces, logs, baggage, events, profiles, semantic conventions, and resource attribute normalization.",
      "Need collector enrollment, sampling, cardinality control, PII redaction, retention tiers, and pipeline health.",
      "Need trace-log-metric-profile correlation that feeds service maps, incidents, SLOs, and agent investigations.",
    ],
  ),
  platformModule(
    "14-workflow-action-engine",
    "Workflow and Action Engine",
    "Provide the automation backbone for safe resource interaction: triggers, approvals, branches, actions, retries, dry-runs, rollback notes, and audit trails.",
    workflowItems,
    [
      "Need workflow definitions, versioning, execution history, replay, cancellation, and observability.",
      "Need action adapters for HTTP, cloud APIs, Kubernetes, databases, Kafka, and Linux diagnostics.",
      "Need safety primitives: dry-run, approval, change window, blast-radius check, scoped secrets, and rollback notes.",
    ],
  ),
  platformModule(
    "15-iac-drift-change-intelligence",
    "IaC Drift and Change Intelligence",
    "Tie resource findings to infrastructure-as-code, drift, recent changes, deployment history, and safe reconciliation.",
    iacDriftItems,
    [
      "Need Terraform, CloudFormation, Pulumi, Helm, Kustomize, Argo CD, Flux, and YAML source ingestion.",
      "Need resource drift, unmanaged resource, deleted managed resource, tag drift, security drift, and cost drift detection.",
      "Need PR proposal, rollback PR, import plan, policy-as-code gates, and drift ownership workflows.",
    ],
  ),
  platformModule(
    "16-security-compliance-packs",
    "Security and Compliance Packs",
    "Ship reusable control packs for cloud, Kubernetes, Linux, databases, Kafka, secrets, identity, workload, and audit evidence.",
    complianceItems,
    [
      "Need CIS, NIST, SOC2, HIPAA, PCI, AWS security best-practice, identity, secret, network, workload, and vulnerability controls.",
      "Need evidence snapshots, exception approvals, control owners, audit exports, and remediation workflows.",
      "Need compliance packs to feed the same findings, scorecards, action engine, and evidence store as all other modules.",
    ],
  ),
  platformModule(
    "17-finops-unit-economics",
    "FinOps and Unit Economics",
    "Convert cost visibility into allocation, unit economics, savings opportunities, realized savings, and owner accountability.",
    finopsItems,
    [
      "Need multi-cloud billing ingestion, custom cost upload, tag normalization, and allocation by service, team, customer, namespace, topic, and workload.",
      "Need unit economics such as cost per request, customer, job, query family, and business capability.",
      "Need opportunities with estimated savings, confidence, effort, risk, owner, verification, and realized savings tracking.",
    ],
  ),
  platformModule(
    "18-digital-experience-synthetic-checks",
    "Digital Experience and Synthetic Checks",
    "Measure user-visible health through API, browser, DNS, TLS, network, private-location, third-party, and regional synthetic checks.",
    syntheticItems,
    [
      "Need synthetic probes that map back to services, resources, SLOs, incidents, and root-cause investigations.",
      "Need private locations for internal endpoints and regional checks for customer-impact visibility.",
      "Need synthetic results to generate SLIs, incidents, and remediation workflows.",
    ],
  ),
  platformModule(
    "19-plugin-action-marketplace",
    "Plugin and Action Marketplace",
    "Make Mayyam extensible through connector SDKs, action SDKs, rule packs, UI extensions, private registries, signed plugins, and action catalogs.",
    pluginItems,
    [
      "Need plugin manifest, permission declaration, compatibility, risk declaration, signing, install, update, rollback, and audit events.",
      "Need SDK templates for resource connectors, remediation actions, compliance packs, and UI extensions.",
      "Need private marketplace support so teams can ship internal integrations safely.",
    ],
  ),
  platformModule(
    "20-evidence-store-time-machine",
    "Evidence Store and Time Machine",
    "Preserve resource state, findings, metrics, logs, actions, graph snapshots, costs, and agent traces so teams can compare and replay any incident or change.",
    evidenceStoreItems,
    [
      "Need durable evidence snapshots across resource config, metrics, logs, findings, actions, costs, graph state, and agent traces.",
      "Need query, diff, replay, retention, immutability, access control, legal hold, and export capabilities.",
      "Need evidence bundles for incidents, postmortems, audits, and verification.",
    ],
  ),
  platformModule(
    "21-learning-runbook-system",
    "Learning and Runbook System",
    "Turn manual fixes, incidents, and agent investigations into deterministic rules, runbooks, workflows, knowledge articles, and recurring automation.",
    learningItems,
    [
      "Need capture flows for manual fixes, incidents, and agent suggestions.",
      "Need conversion workflows from cases to rules, runbooks, workflows, and knowledge articles.",
      "Need feedback metrics for runbook success, rule false positives, and recommendation usefulness.",
    ],
  ),
  platformModule(
    "22-fleet-management-control-plane",
    "Fleet Management Control Plane",
    "Manage the Linux companion fleet with enrollment, heartbeat, policy bundles, updates, offline buffering, secure diagnostics, and approved host actions.",
    fleetItems,
    [
      "Need secure host enrollment, grouping, identity proof, air-gapped support, and revocation.",
      "Need agent heartbeat, self-diagnostics, policy bundles, update rollout, rollback, proxy support, and mTLS rotation.",
      "Need approved remote diagnostics, file collection, package patching, and fleet dashboards.",
    ],
  ),
  platformModule(
    "23-kubernetes-cost-allocation",
    "Kubernetes Cost Allocation",
    "Add Kubernetes-native cost allocation, idle cost detection, rightsizing, budgets, showback, chargeback, and forecast workflows.",
    k8sCostItems,
    [
      "Need OpenCost-style allocation across namespaces, workloads, pods, nodes, volumes, GPUs, and network.",
      "Need waste detection for idle requests, over-requested CPU/memory, orphaned volumes, and inefficient node shapes.",
      "Need showback, chargeback, budgets, rightsizing, autoscaler recommendations, spot opportunities, and forecasts.",
    ],
  ),
  platformModule(
    "24-applications-microservices-apm",
    "Applications and Microservices APM",
    "Add application-aware observability and operations: service discovery, RED/USE metrics, traces, errors, profiles, deployments, runtime metrics, and service workbench.",
    apmItems,
    [
      "Need service discovery, endpoint inventory, dependency maps, RED/USE metrics, traces, error tracking, and profiling.",
      "Need deploy markers, release regression detection, feature flag correlation, runtime metrics, and service health scoring.",
      "Need APM evidence to feed incidents, SLOs, resource graph, cost attribution, and agent investigations.",
    ],
  ),
  platformModule(
    "25-ai-llm-observability",
    "AI and LLM Observability",
    "Make Mayyam observable to itself and to AI-heavy workloads: model inventory, prompt traces, token cost, quality, safety, tool calls, and agent replay.",
    aiObservabilityItems,
    [
      "Need model, prompt, and agent inventory with latency, error, token, cost, and tool-call telemetry.",
      "Need quality, grounding, hallucination feedback, prompt-injection detection, sensitive data leakage controls, and unsafe-tool prevention.",
      "Need agent trace replay, budget controls, stop conditions, model routing policy, provider failover, and AI spend reporting.",
    ],
  ),
);

function priority(status, pillar, workstream) {
  if (status === "existing" && ["posture", "telemetry", "ai-triage"].includes(workstream)) return "P0";
  if (pillar === "security" || pillar === "cost" || pillar === "resilience") return "P0";
  if (pillar === "disaster-recovery" || workstream === "remediation") return "P1";
  return status === "planned" ? "P2" : "P1";
}

function sourceStatus(module, item) {
  if (module.folder === "06-azure-cloud" || module.folder === "07-google-cloud" || module.folder === "08-linux-companion") return "pending";
  if (item.status === "existing") return "implemented-foundation";
  if (item.status === "partial") return "partial-foundation";
  return "planned-gap";
}

function releasePhase(workstream) {
  if (workstream === "inventory") return "M1 inventory";
  if (workstream === "telemetry" || workstream === "health") return "M2 observable";
  if (workstream === "posture" || workstream === "ai-triage" || workstream === "tests") return "M3 explainable";
  if (["operations", "remediation", "automation", "slo-policy", "forecasting", "reporting"].includes(workstream)) return "M4 interactive";
  if (workstream === "agentic-investigation") return "M5 autonomous-assist";
  return "M2 observable";
}

function shipSize(workstream) {
  if (workstream === "inventory" || workstream === "tests") return "S";
  if (workstream === "agentic-investigation" || workstream === "remediation") return "L";
  return "M";
}

function generateRows(module) {
  const rows = [];
  let seq = 1;
  for (const item of module.services) {
    for (const pillar of pillars) {
      for (const template of module.templates) {
        const id = `${module.folder.toUpperCase()}-${String(seq).padStart(5, "0")}`;
        const feature = `${template.title}: ${item.name} / ${pillar}`;
        rows.push({
          id,
          module: module.title,
          category: item.category,
          service_or_domain: item.name,
          pillar,
          workstream: template.workstream,
          feature,
          release_phase: releasePhase(template.workstream),
          ship_size: shipSize(template.workstream),
          user_story: `As an operator, I can understand and act on ${item.name} ${pillar} posture without leaving Mayyam.`,
          ship_slice: `Ship as one vertical slice for ${item.name}: data contract, collector or tool adapter, backend API, deterministic evaluator, UI surface, tests, documentation, and operator runbook.`,
          implementation_detail: template.detail(item, pillar),
          backend_scope: template.backend(item),
          frontend_scope: template.frontend(item),
          api_contract: `Expose authenticated API endpoints for ${module.title} ${item.name} ${template.workstream} with pagination, freshness metadata, audit IDs, error codes, and export support.`,
          data_model: `${slug(item.name)}_${slug(pillar)}_${slug(template.workstream)} evidence, score, finding, recommendation, owner, suppression, audit event`,
          deterministic_scope: `Implement deterministic checks for ${item.name} ${pillar} that can run without an LLM, emit reason codes, and preserve raw evidence.`,
          agentic_scope: `Allow agentic investigation only through registered tools for ${item.name}; read-only diagnostics are default, mutations require explicit approval, and every tool call is replayable.`,
          interaction_model: `Support inspect, compare, diagnose, dry-run, approve, execute, rollback-note, audit, and export workflows for ${item.name}.`,
          cost_opportunity: pillar === "cost"
            ? `Identify savings opportunities for ${item.name}, quantify estimated monthly impact, confidence, effort, risk, and verification steps.`
            : `Record any cost side effect for ${item.name} recommendations so non-cost changes do not create hidden spend regressions.`,
          risk_controls: `Require RBAC, scoped credentials, rate limits, stale-data detection, blast-radius summary, suppression policy, and rollback or recovery notes for ${item.name}.`,
          telemetry_contract: `Emit collection duration, freshness age, success/failure counts, rule evaluation count, AI/tool-call count when applicable, and user action audit metrics for ${item.name}.`,
          test_plan: `Add unit tests for evaluator logic, fixture tests for collected evidence, API contract tests, UI render/action tests, and one failure-path test for stale or missing ${item.name} data.`,
          rollout_guardrail: `Gate behind a feature flag, support read-only mode first, document required permissions, and add rollback or disable instructions before enabling ${item.name} ${template.workstream} broadly.`,
          docs_runbook: `Document prerequisites, permissions, setup, known limits, common failure modes, triage commands, remediation approval path, and verification checks for ${item.name}.`,
          acceptance_criteria: `Given ${item.name} data exists, when the ${pillar} ${template.workstream} workflow runs, then Mayyam stores evidence, shows status, explains gaps, and exposes API/UI tests for the happy path and one failure path.`,
          priority: priority(item.status, pillar, template.workstream),
          dependency: `${item.name} connector credentials, normalized resource identity, sync-run freshness, RBAC, audit logging`,
          source_status: sourceStatus(module, item),
        });
        seq += 1;
      }
    }
  }
  return rows;
}

function writeBacklog(module, rows) {
  const headers = [
    "id",
    "module",
    "category",
    "service_or_domain",
    "pillar",
    "workstream",
    "feature",
    "release_phase",
    "ship_size",
    "user_story",
    "ship_slice",
    "implementation_detail",
    "backend_scope",
    "frontend_scope",
    "api_contract",
    "data_model",
    "deterministic_scope",
    "agentic_scope",
    "interaction_model",
    "cost_opportunity",
    "risk_controls",
    "telemetry_contract",
    "test_plan",
    "rollout_guardrail",
    "docs_runbook",
    "acceptance_criteria",
    "priority",
    "dependency",
    "source_status",
  ];
  const body = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csv(row[header])).join(",")),
  ].join("\n");
  write(path.join(OUT, module.folder, "feature-backlog.csv"), body + "\n");
}

function writeCurrentState(module, rowCount) {
  const content = `# ${module.title}: Current State and Target State

## Product Mission

${module.mission}

## Current Maturity

${module.maturity}

## What Exists Now

${module.now.map((item) => `- ${item}`).join("\n")}

## Gaps to Close

${module.gaps.map((item) => `- ${item}`).join("\n")}

## Source Modules Reviewed

${module.codeRefs.map((item) => `- \`${item}\``).join("\n")}

## Target Operating Model

- One normalized resource identity per cloud service, Kubernetes object, database domain, or Kafka domain.
- Each backlog row is a shippable vertical slice with release phase, size, API contract, telemetry, tests, rollout guardrail, and runbook documentation.
- Deterministic collectors produce evidence before any LLM summary is generated.
- Findings are scored by pillar: ${pillars.join(", ")}.
- Each resource supports deterministic triage and bounded agentic investigation as separate workflows.
- Each resource can be inspected and, where safe, interacted with through dry-run, approval, execution, audit, and rollback-note flows.
- Cost is not only visible; cost opportunities must be quantified, prioritized, and verified.
- Recommendations link back to raw evidence, ownership, suppression state, and implementation history.
- Remediation is dry-run first, approval-gated, audited, reversible where possible, and tested.
- Executive reports aggregate posture by account, cluster, service, Linux host, team, environment, application, and business unit.

## Backlog Size

This folder contains ${rowCount.toLocaleString()} implementation-ready feature rows in \`feature-backlog.csv\`.
`;
  write(path.join(OUT, module.folder, "current-state.md"), content);
}

function writeCapabilityMap(module, rows) {
  const byCategory = new Map();
  for (const service of module.services) {
    if (!byCategory.has(service.category)) byCategory.set(service.category, []);
    byCategory.get(service.category).push(service);
  }

  const sections = [];
  for (const [category, services] of byCategory.entries()) {
    sections.push(`## ${category}`);
    sections.push(table(
      ["Service or Domain", "Current Source Status", "Feature Rows", "Primary First Slice"],
      services.map((service) => {
        const count = rows.filter((row) => row.service_or_domain === service.name).length;
        const firstSlice = service.status === "existing" || service.status === "partial"
          ? "Normalize evidence and add pillar scorecards"
          : "Add connector/inventory foundation";
        return [service.name, service.status, String(count), firstSlice];
      }),
    ));
    sections.push("");
  }

  const content = `# ${module.title}: Capability Map

This map is intentionally service/domain-first. Each item expands across the seven product pillars and the workstreams in \`feature-backlog.csv\`.

${sections.join("\n")}
`;
  write(path.join(OUT, module.folder, "capability-map.md"), content);
}

function writeEpics(module) {
  const categories = [...new Set(module.services.map((service) => service.category))];
  const content = `# ${module.title}: Epic Breakdown

## Epic Template

Each epic should ship as a vertical slice:

- API: connector, collector, repository, route, auth, pagination, and audit events.
- Rules: deterministic findings before LLM summary.
- Agentic: bounded tool use, replayable trace, uncertainty, and approval-gated mutation.
- Cost: quantified opportunity, confidence, effort, risk, owner, and verification status.
- UI: list, detail, scorecard, drilldown, action, and export.
- Tests: unit evaluator tests, connector fixtures, API contract tests, and one critical UI path.
- Operations: feature flag, telemetry freshness, failure handling, and runbook.

## Category Epics

${categories.map((category, index) => `### EPIC-${String(index + 1).padStart(2, "0")}: ${category}

- Goal: make ${category} measurable and actionable across ${pillars.join(", ")}.
- First release: inventory, health, ownership, and one high-confidence finding.
- Expansion release: triage, remediation workflow, reports, and historical trend.
- Hardening release: RBAC, audit, suppressions, policy exceptions, and full regression suite.
`).join("\n")}
`;
  write(path.join(OUT, module.folder, "epics.md"), content);
}

function writeModuleReadme(module, rows) {
  const content = `# ${module.title}

${module.mission}

## Where We Are

${module.now.map((item) => `- ${item}`).join("\n")}

## Where We Should Be

${module.gaps.map((item) => `- ${item}`).join("\n")}

## Files

- \`current-state.md\` explains source modules reviewed, current maturity, gaps, and target operating model.
- \`capability-map.md\` lists the service/domain coverage and feature-row counts.
- \`epics.md\` breaks delivery into implementation slices.
- \`feature-backlog.csv\` contains ${rows.length.toLocaleString()} implementation-ready feature rows with release phase, ship size, API contract, tests, rollout guardrail, and runbook scope.

## Build Order

1. Normalize resource/domain identity and evidence contracts.
2. Add deterministic rule packs for P0 pillars: cost, security, resilience.
3. Add scorecards, trend storage, and UI drilldowns.
4. Add evidence-grounded AI triage.
5. Add bounded agentic investigation with read-only tools first.
6. Add dry-run remediation, approvals, and audit history.
7. Add reports, export, notifications, and organization-level rollups.
`;
  write(path.join(OUT, module.folder, "README.md"), content);
}

function writeTopReadme(summaries) {
  const totalRows = summaries.reduce((sum, item) => sum + item.rows, 0);
  const content = `# Mayyam Product Roadmap

Generated on 2026-06-10 from the current repository shape, current official platform documentation, and the product goal of replacing passive observability tools with an SRE operating platform.

Mayyam should become a broad SRE/DBA/cloud engineering platform: Datadog/Dynatrace-class telemetry depth, Sentry-style investigation flow, Well-Architected governance, Linux host companionship, deterministic triage, bounded agentic investigation, and safe resource interaction across cloud, Kubernetes, databases, Kafka, and servers. This is not just observability; it is coverage, posture, diagnosis, governance, remediation, cost actionability, auditability, and executive reporting.

## Roadmap Folders

${table(
  ["Folder", "Area", "Feature Rows", "Maturity"],
  summaries.map((summary) => [
    `\`${summary.folder}\``,
    summary.title,
    summary.rows.toLocaleString(),
    summary.maturity,
  ]),
)}

Total generated backlog rows: ${totalRows.toLocaleString()}.

## Foundational Docs

- \`product-doctrine.md\`: product positioning and the resource promise.
- \`requirements-rigor.md\`: definition of done, maturity levels, acceptance bar, and confirmation questions.
- \`agentic-operating-model.md\`: deterministic evidence, AI triage, bounded agentic investigation, and approved remediation.
- \`source-module-review.md\`: current code surface and architectural gaps.
- \`implementation-sequencing.md\`: suggested build phases.

## Product Principles

- Evidence before advice: collectors and deterministic rules must run before LLM summaries.
- Pillar-first posture: every module should report cost, resilience, performance, scalability, security, disaster recovery, and operational excellence.
- Interact, do not only observe: every resource needs inspect, diagnose, dry-run, approve, execute, rollback-note, and audit workflows where technically safe.
- Deterministic plus agentic: deterministic evaluators provide trusted facts; agentic AI investigates through bounded tools, explicit uncertainty, and approval gates.
- Cost is actionable: cost data must become savings opportunities with impact, confidence, effort, risk, owner, and verification status.
- Linux-first reach: Mayyam must work for unmanaged Linux servers, DigitalOcean droplets, VPS hosts, bare metal, cloud VMs, and Kubernetes nodes.
- Safe operations: mutations need dry-run, validation, approvals, RBAC, audit trails, and rollback notes.
- Multi-provider normalization: AWS, Azure, GCP, Kubernetes, Linux, databases, and Kafka should share identity, ownership, finding, recommendation, and workflow models.
- DBA/SRE usability: workflows should end in concrete next steps, not generic dashboards.

## Source References

${references.map(([name, url]) => `- ${name}: ${url}`).join("\n")}
`;
  write(path.join(OUT, "README.md"), content);
}

function writeProductDoctrine() {
  const content = `# Product Doctrine

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
- How does it score across ${pillars.join(", ")}?
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
`;
  write(path.join(OUT, "product-doctrine.md"), content);
}

function writeRequirementsRigor() {
  const content = `# Requirements Rigor Model

## Resource Definition of Done

Each cloud service, Kubernetes object, database domain, Kafka domain, and Linux host domain is not considered complete until it has:

1. Inventory: stable identity, provider/domain IDs, ownership, tags/labels, environment, region/zone/host, lifecycle state, and dependencies.
2. Telemetry: metrics, logs, events, freshness, sampling limits, collection failures, and retention policy.
3. Well-Architected score: cost, resilience, performance, scalability, security, disaster recovery, and operational excellence findings.
4. Deterministic triage: rule-based findings with reason codes, thresholds, raw evidence, severity, affected objects, and tests.
5. Agentic investigation: bounded tool registry, read-only default, token/time budgets, uncertainty labels, trace replay, and approval-gated mutations.
6. Resource interaction: inspect, compare, diagnose, dry-run, approve, execute, rollback-note, audit, and export.
7. Cost opportunity: monthly savings estimate, confidence, effort, risk, owner, verification step, and realized savings status.
8. Security controls: RBAC, credential scope, secret handling, audit trail, stale-data warnings, and suppressions.
9. DR and recovery: RTO/RPO fields where relevant, backup coverage, restore evidence, drill status, and recovery runbooks.
10. Reporting: API pagination, CSV/JSON export, saved views, ownership rollups, and executive summary.
11. Tests: unit evaluator tests, connector fixtures, API contract tests, UI workflow tests, and one negative path.
12. Operations: feature flag, collection health, backoff/rate-limit handling, retry policy, and support runbook.

## Maturity Levels

| Level | Meaning | Requirement |
| --- | --- | --- |
| M0 | Named | Resource exists only as a roadmap item. |
| M1 | Inventory | Resource can be discovered, stored, listed, and linked to owner/context. |
| M2 | Observable | Resource has metrics/logs/events with freshness and failure states. |
| M3 | Explainable | Resource has deterministic findings, scorecards, evidence, and tests. |
| M4 | Interactive | Resource has safe inspect/dry-run/action workflows with audit. |
| M5 | Autonomous-Assist | Resource supports bounded agentic investigation and approved remediation loops. |

## Acceptance Bar

For every backlog row, implementation should prove:

- Evidence exists and is visible.
- Deterministic logic runs without AI.
- AI output cites evidence and flags uncertainty.
- Mutations are impossible without approval unless explicitly configured otherwise.
- Cost impact is captured.
- The happy path and one failure path are tested.
- The user can export or share the result.

## Backlog Row Contract

Every generated CSV row is intended to be shippable. A row is not a vague capability label; it carries:

- Release phase: M1 inventory, M2 observable, M3 explainable, M4 interactive, or M5 autonomous-assist.
- Ship size: S, M, or L based on the operational risk and engineering scope.
- Vertical slice: data contract, collector or tool adapter, backend API, deterministic evaluator, UI, tests, docs, and runbook.
- API contract: authenticated endpoint behavior, pagination, freshness, audit IDs, error codes, and export support.
- Telemetry contract: collection health, freshness, evaluator counts, AI/tool counts, and action audit metrics.
- Test plan: unit, fixture, API contract, UI, and failure-path coverage.
- Rollout guardrail: feature flag, read-only mode first, permissions, rollback or disable instructions.
- Documentation/runbook: setup, permissions, limits, known failures, triage, approval path, and verification.

## Product Confirmation Questions

These are not blockers for the roadmap, but they should be confirmed before implementation:

- Should the Linux companion be installed as a systemd service, Docker container, single binary, or all three?
- Should Mayyam default to self-hosted/local-first control plane, SaaS, or hybrid?
- In v1, should agentic AI ever execute mutations automatically, or should every mutation require human approval?
- Which resource family should be the first flagship: AWS Well-Architected, Linux companion, MySQL/Postgres DBA copilot, Kubernetes operations, or Kafka operations?
- Should DigitalOcean/VPS support be a separate provider module or enter through the Linux companion first?
`;
  write(path.join(OUT, "requirements-rigor.md"), content);
}

function writeAgenticOperatingModel() {
  const content = `# Deterministic and Agentic Operating Model

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
`;
  write(path.join(OUT, "agentic-operating-model.md"), content);
}

function writeSourceReview() {
  const content = `# Source Module Review

## Backend Product Surface

- \`backend/src/api/routes/cloud.rs\`: AWS account/resource routes, many AWS service inventory endpoints, CloudWatch metrics/logs, AWS cost, and AWS data-plane operations.
- \`backend/src/services/aws/aws_control_plane/\`: broad AWS control-plane service modules including EC2, S3, RDS, DynamoDB, IAM, CloudWatch, Config, KMS, ECS, EKS, Lambda, Redshift, EMR, Athena, Glue, Backup, WAF, Global Accelerator, AppSync, and more.
- \`backend/src/services/aws/aws_data_plane/\`: data-plane modules for CloudWatch, Cost Explorer, S3, SQS, DynamoDB, ElastiCache, EC2, Kinesis, RDS, SNS, Lambda, and OpenSearch.
- \`backend/src/api/routes/kubernetes.rs\`: broad Kubernetes routes for clusters, namespaces, nodes, workloads, services, storage, pods, logs, events, configmaps, secrets, jobs, cronjobs, ingress, endpoints, network policies, HPA, PDB, quotas, limits, service accounts, RBAC, node ops, replica sets, storage classes, CRDs, and custom resources.
- \`backend/src/api/routes/kafka.rs\`: Kafka routes for clusters, health, metrics, produce/consume, topics, consumer groups, offset reset, topic config, partitions, brokers, backup, restore, migrate, and drain.
- \`backend/src/api/routes/database.rs\`: generic database connection/query/schema/analyze routes plus MySQL telemetry, telemetry history, and signal endpoints.
- \`backend/src/services/analytics/mysql_analytics/\`: MySQL analytics, telemetry collection, and deterministic signals.
- \`backend/src/services/analytics/postgres_analytics/postgres_analytics_service.rs\`: early Postgres analytics exists but is not productized to the same level as MySQL.
- \`backend/src/api/routes/chaos.rs\`: chaos templates, experiments, runs, audit logs, and metrics. This should be tied into resilience and DR roadmaps.
- \`backend/src/api/routes/cost_analytics.rs\` and \`backend/src/api/routes/budget.rs\`: cost data, monthly aggregates, top services, anomalies, insights, budgets, alerts, and resource costs.
- No always-on Linux companion, host agent, host enrollment, package inventory, systemd/journald collector, or safe remote command module was found.

## Frontend Product Surface

- \`frontend/src/components/layout/AppLayout.js\`: navigation includes dashboard, sync runs, cloud resources, databases, Kafka, Kinesis, Kubernetes, cost analytics, Aurora, slow queries, query fingerprints, explain plans, AI analysis, chaos, chat, and settings.
- \`frontend/src/pages/CloudResources.js\` and \`frontend/src/components/cloud/\`: generic cloud resource browser and AWS resource details.
- \`frontend/src/pages/KubernetesDashboardPage.js\` and \`frontend/src/components/kubernetes/\`: Kubernetes dashboard tabs for workloads, storage, nodes, namespaces, pods, logs, metrics, events, config, and secrets.
- \`frontend/src/pages/Databases.js\` and \`frontend/src/components/database/\`: connection management, query tool, schema explorer, monitoring, MySQL triage, and MySQL telemetry.
- \`frontend/src/pages/Kafka.js\`: Kafka cluster/topic UI exists, but backend functionality is much deeper than frontend coverage.
- \`frontend/src/pages/CostAnalytics.js\`, \`frontend/src/pages/SlowQueryDashboard.js\`, \`frontend/src/pages/AuroraClusters.js\`, and \`frontend/src/pages/ExplainPlans.js\`: database and cost surfaces should become part of a unified operations cockpit.

## Main Architectural Gaps

- The project has many resource collectors and pages, but no single shared posture model for all pillars.
- AWS coverage is much stronger than Azure and Google Cloud, which appear pending.
- Kubernetes API coverage is broad, but the UI does not yet feel like a complete operations console.
- MySQL triage has the strongest evidence-grounded AI foundation; Postgres should reuse that shape.
- Kafka backend has management depth, but frontend, governance, schema, Connect, managed Kafka, and deep health analytics need expansion.
- Cost, chaos, security, and AI analysis are separate modules; the roadmap should converge them into each resource's scorecard and workflow.
- Linux hosts, VPS servers, and DigitalOcean-style unmanaged infrastructure are not yet first-class resources.
- AI triage exists in places, but true bounded agentic investigation with replayable tool calls and approval-gated mutation is not yet a platform primitive.
`;
  write(path.join(OUT, "source-module-review.md"), content);
}

function writeSequencing(summaries) {
  const content = `# Implementation Sequencing

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

## Backlog Counts

${table(
  ["Area", "Rows"],
  summaries.map((summary) => [summary.title, summary.rows.toLocaleString()]),
)}
`;
  write(path.join(OUT, "implementation-sequencing.md"), content);
}

function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  const summaries = [];
  for (const module of modules) {
    const rows = generateRows(module);
    writeModuleReadme(module, rows);
    writeCurrentState(module, rows.length);
    writeCapabilityMap(module, rows);
    writeEpics(module);
    writeBacklog(module, rows);
    summaries.push({
      folder: module.folder,
      title: module.title,
      rows: rows.length,
      maturity: module.maturity,
    });
  }
  writeTopReadme(summaries);
  writeProductDoctrine();
  writeRequirementsRigor();
  writeAgenticOperatingModel();
  writeSourceReview();
  writeSequencing(summaries);
  console.log(`Generated ${summaries.reduce((sum, item) => sum + item.rows, 0)} roadmap rows in ${OUT}`);
}

main();
