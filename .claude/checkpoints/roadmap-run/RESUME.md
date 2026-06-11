# Roadmap Run Resume

- Run ID: run-001
- Roadmap hash: ab4059db94762a3e (verify via `git diff <last_commit>..HEAD --
  docs/product-roadmap scripts/generate-product-roadmap.js` being empty, not by
  recomputing)
- Last commit: bb03c2e (batch-022: Route 53, Transit Gateway, Secrets Manager
  collectors + pillar evaluators)
- Completed batches: 22 · Committed features: 174 · Blocked: 0 · Pending: 0
  - batch-001 EC2 (2ec71c0), 002 Lambda (4d6700f), 003 S3 (d446eb1),
    004 RDS+EBS+EFS (a2aede3), 005 scorecards UI (8453624), 006 ECS+EKS (e462907),
    007 DynamoDB (be759fb), 008 SQS+SNS+Kinesis (2609581),
    009 ElastiCache+OpenSearch+VPC (30b2853), 010 IAM+CloudFront+ELB+APIGW (791b944),
    011 CloudWatch+AppSync+Glacier+StorageGW+KinesisAnalytics (af9da2b),
    012 Subnet+SG+NATGW+IGW+RouteTable+NACL (c30f03f), 013 Fargate (d13f57f),
    014 KMS+ACM+CloudTrail (0e37900), 015 Config+EventBridge+StepFunctions (009f030),
    016 AppRunner+Athena+SSM (d9fd822), 017 Backup+Batch+EMR (6937cb3),
    018 GA+Glue+Redshift+WAF (392459b), 019 AutoScaling (dda26ae),
    020 CloudWatchMetrics+LogGroups (202339d), 021 extended pillars (8c2c023),
    022 Route53+TransitGateway+SecretsManager (bb03c2e)
- batch-022 committed rows: 01-AWS-CLOUD-03340/03349/03376 (Route 53),
  03466/03475/03502 (Transit Gateway), 04285/04294/04321 (Secrets Manager).
- batch-022 pattern (use for batch-023+): 3 parallel agents each write only the
  two new per-service files (aws_control_plane/<svc>_control_plane.rs +
  inventory/<svc>_pillar_evaluator.rs, templated on autoscaling); coordinator
  alone edits the 10 shared wiring points: Cargo.toml dep, aws_resource.rs enum
  (3 spots), aws_client_factory.rs (import+trait), service.rs impl,
  aws_control_plane/mod.rs, control_plane.rs (import+type list+dispatch),
  inventory/mod.rs, controllers/aws_inventory.rs (import+handler),
  routes/aws_inventory.rs, integration aws_inventory_api_tests.rs tuple,
  unit aws_models_test.rs list, frontend PillarScorecards.js SERVICES entry.
  Transit Gateway reuses create_ec2_client (no new dep).
- Remaining backlog slice: 102 M1 P0 inventory rows = 34 services × 3 pillars
  not yet seeded: Amazon MQ, Application Migration Service, Aurora, Bedrock,
  Comprehend, Compute Optimizer, Control Tower, DMS, DataSync, DocumentDB,
  Elastic Beanstalk, Elastic Disaster Recovery, FSx, GuardDuty, Health,
  Inspector, Kinesis Data Firehose, Lake Formation, Lightsail, MSK, Macie,
  MemoryDB, Neptune, Organizations, PrivateLink, QuickSight, Resilience Hub,
  SageMaker AI, Security Hub, Service Catalog, Shield, Textract, Timestream,
  Trusted Advisor. After M1 P0: P0 M2 telemetry (460 rows), then M3+.
- ses_control_plane.rs remains a stub permanently — the backlog has NO SES rows
  (verified batch-016); leave it.
- Last validation (batch-022): cargo test --lib → 562 passed, 0 failed (34 new);
  cargo check → 0 errors; cargo check --features integration-tests --tests →
  0 errors; npm run build → ok. KNOWN PRE-EXISTING: cargo test --test unit_tests
  has 7 failures in aws_account_service_test on HEAD from before roadmap
  batches — do not chase.
- Current batch: none.
- Next action: select batch-023 (next 3 services from the remaining 34, e.g.
  Aurora + MSK + GuardDuty), claim rows in sqlite, follow the batch-022
  parallel pattern, validate, commit.
- No React test infra (no @testing-library) — UI tests deferred.
- Note: user works on CLAUDE.md/prompts in parallel; never commit those — use
  explicit pathspec on git commit.
