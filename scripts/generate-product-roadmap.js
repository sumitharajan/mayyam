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
          user_story: `As an operator, I can understand and act on ${item.name} ${pillar} posture without leaving Mayyam.`,
          implementation_detail: template.detail(item, pillar),
          backend_scope: template.backend(item),
          frontend_scope: template.frontend(item),
          data_model: `${slug(item.name)}_${slug(pillar)}_${slug(template.workstream)} evidence, score, finding, recommendation, owner, suppression, audit event`,
          deterministic_scope: `Implement deterministic checks for ${item.name} ${pillar} that can run without an LLM, emit reason codes, and preserve raw evidence.`,
          agentic_scope: `Allow agentic investigation only through registered tools for ${item.name}; read-only diagnostics are default, mutations require explicit approval, and every tool call is replayable.`,
          interaction_model: `Support inspect, compare, diagnose, dry-run, approve, execute, rollback-note, audit, and export workflows for ${item.name}.`,
          cost_opportunity: pillar === "cost"
            ? `Identify savings opportunities for ${item.name}, quantify estimated monthly impact, confidence, effort, risk, and verification steps.`
            : `Record any cost side effect for ${item.name} recommendations so non-cost changes do not create hidden spend regressions.`,
          risk_controls: `Require RBAC, scoped credentials, rate limits, stale-data detection, blast-radius summary, suppression policy, and rollback or recovery notes for ${item.name}.`,
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
    "user_story",
    "implementation_detail",
    "backend_scope",
    "frontend_scope",
    "data_model",
    "deterministic_scope",
    "agentic_scope",
    "interaction_model",
    "cost_opportunity",
    "risk_controls",
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
- \`feature-backlog.csv\` contains ${rows.length.toLocaleString()} implementation-ready feature rows.

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
