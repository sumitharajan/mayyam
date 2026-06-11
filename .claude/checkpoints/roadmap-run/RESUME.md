# Roadmap Run Resume

- Run ID: run-001
- Roadmap hash: ab4059db94762a3e (verify via `git diff <last_commit>..HEAD --
  docs/product-roadmap scripts/generate-product-roadmap.js` being empty, not by
  recomputing)
- Last commit: 8c2c023 (batch-021: performance/scalability/disaster-recovery/
  operational-excellence pillars for EventBridge, Step Functions, AWS Config)
- Completed batches: 21 · Committed features: 165 · Blocked: 0 · Pending: 0
  — ALL tracked backlog rows (P0 + P1) are committed.
  - batch-001 EC2 (2ec71c0), 002 Lambda (4d6700f), 003 S3 (d446eb1),
    004 RDS+EBS+EFS (a2aede3), 005 scorecards UI (8453624), 006 ECS+EKS (e462907),
    007 DynamoDB (be759fb), 008 SQS+SNS+Kinesis (2609581),
    009 ElastiCache+OpenSearch+VPC (30b2853), 010 IAM+CloudFront+ELB+APIGW (791b944),
    011 CloudWatch+AppSync+Glacier+StorageGW+KinesisAnalytics (af9da2b),
    012 Subnet+SG+NATGW+IGW+RouteTable+NACL (c30f03f), 013 Fargate (d13f57f),
    014 KMS+ACM+CloudTrail (0e37900), 015 Config+EventBridge+StepFunctions (009f030),
    016 AppRunner+Athena+SSM (d9fd822), 017 Backup+Batch+EMR (6937cb3),
    018 GA+Glue+Redshift+WAF (392459b), 019 AutoScaling (dda26ae),
    020 CloudWatchMetrics+LogGroups (202339d), 021 extended pillars (8c2c023)
- batch-021 committed rows: 01-AWS-CLOUD-02476/02485/02503/02512 (EventBridge),
  02539/02548/02566/02575 (Step Functions), 03862/03871/03889/03898 (Config).
- batch-021 added: Pillar enum extended with Performance, Scalability,
  DisasterRecovery ("disaster-recovery"), OperationalExcellence
  ("operational-excellence"); all 47 other evaluators got a `_ => {}` dispatch
  fallback (no findings for unextended pillars); controller gained
  BASE_PILLARS/ALL_PILLARS + parse_pillars(raw, supported) which rejects
  unsupported pillars per service, and extended_pillar_reports used by the
  config/eventbridge/stepfunctions handlers (default = 7 reports there, 3
  elsewhere); new reason codes EVENTBRIDGE_PERF_BROAD_EVENT_PATTERN/
  PERF_PATTERN_UNPARSEABLE/SCALE_TARGET_QUOTA_REACHED/DR_SCHEDULED_NO_DLQ/
  OPEX_NO_OWNER_TAG, SFN_PERF_TRACING_DISABLED/PERF_EXPRESS_ALL_LOGGING/
  SCALE_FULL_EXECUTION_LOGGING/DR_LOGGING_OFF/OPEX_NO_OWNER_TAG/
  DATA_GAP_MACHINE_TYPE, CONFIG_PERF_INTERMITTENT_EVALUATION_FAILURES/
  SCALE_HOURLY_EVALUATION/DR_NEVER_EVALUATED/OPEX_NO_OWNER_TAG; integration
  test now expects 7 reports for the three extended services. Frontend
  unchanged (PillarScorecard renders reports generically).
- ses_control_plane.rs remains a stub permanently — the backlog has NO SES rows
  (verified batch-016); leave it.
- Last validation (batch-021): cargo test --lib → 529 passed, 0 failed (35
  new); cargo check → 0 errors; cargo check --features integration-tests
  --tests → 0 errors. Frontend not rebuilt (no frontend change). KNOWN
  PRE-EXISTING: cargo test --test unit_tests has 7 failures in
  aws_account_service_test on HEAD from before roadmap batches — do not chase.
- Current batch: none — run complete for the tracked backlog slice.
- Next action: feature_progress has 165/165 committed, 0 pending/blocked. If a
  future run finds the roadmap hash changed (new backlog rows), re-enumerate
  and seed new feature_progress rows; otherwise there is no remaining roadmap
  work in this run.
- No React test infra (no @testing-library) — UI tests deferred.
- Note: user works on CLAUDE.md/prompts in parallel; never commit those — use
  explicit pathspec on git commit.
