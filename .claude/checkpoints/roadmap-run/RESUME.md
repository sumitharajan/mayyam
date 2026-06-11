# Roadmap Run Resume

- Run ID: run-001
- Roadmap hash: ab4059db94762a3e (verify via `git diff <last_commit>..HEAD --
  docs/product-roadmap scripts/generate-product-roadmap.js` being empty, not by
  recomputing)
- Last commit: d478603 (batch-023: Aurora + MSK + GuardDuty collectors + pillar evaluators)
- Completed batches: 23 · Committed features: 183 · Blocked: 0 · Pending: 0
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
    022 Route53+TransitGateway+SecretsManager (bb03c2e),
    023 Aurora+MSK+GuardDuty (d478603)
- batch-023 committed rows: 01-AWS-CLOUD-01198/01207/01234 (Aurora),
  02080/02089/02116 (MSK), 04033/04042/04069 (GuardDuty).
- batch-023 pattern (same as batch-022): 3 new per-service files each
  (aws_control_plane/<svc>_control_plane.rs + inventory/<svc>_pillar_evaluator.rs);
  coordinator wires 10 shared points. Aurora reuses create_rds_client.
  MSK uses aws-sdk-kafka (new dep). GuardDuty uses aws-sdk-guardduty (new dep).
- Remaining backlog slice: 93 M1 P0 inventory rows = 31 services × 3 pillars
  not yet seeded: Amazon MQ, Application Migration Service, Bedrock,
  Comprehend, Compute Optimizer, Control Tower, DMS, DataSync, DocumentDB,
  Elastic Beanstalk, Elastic Disaster Recovery, FSx, Health, Inspector,
  Kinesis Data Firehose, Lake Formation, Lightsail, Macie, MemoryDB, Neptune,
  Organizations, PrivateLink, QuickSight, Resilience Hub, SageMaker AI,
  Security Hub, Service Catalog, Shield, Textract, Timestream, Trusted Advisor.
  After M1 P0: P0 M2 telemetry (460 rows), then M3+.
- ses_control_plane.rs remains a stub permanently — no SES rows in backlog.
- Last validation (batch-023): cargo test --lib → 595 passed, 0 failed (33 new);
  cargo check → 0 errors; npm run build → ok.
  KNOWN PRE-EXISTING: cargo test --test unit_tests has 7 failures in
  aws_account_service_test — do not chase.
- Current batch: none.
- Next action: select batch-024 (next 3 services from remaining 31, e.g.
  DocumentDB + Neptune + MemoryDB as database cluster services), claim rows
  in sqlite, follow batch-023 pattern, validate, commit.
- No React test infra (no @testing-library) — UI tests deferred.
- Note: user works on CLAUDE.md/prompts in parallel; never commit those.
