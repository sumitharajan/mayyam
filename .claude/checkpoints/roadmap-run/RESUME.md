# Roadmap Run Resume

- Run ID: run-001
- Roadmap hash: ab4059db94762a3e (inputs unchanged per git; original hash command
  unrecorded — verify via `git diff <last_commit>..HEAD -- docs/product-roadmap
  scripts/generate-product-roadmap.js` being empty, not by recomputing)
- Last commit: 009f030 (batch-015: Config+EventBridge+StepFunctions collectors + evaluators)
- Completed batches: 15 · Committed features: 114 · Blocked: 9 · Pending (explicit rows): 12
  (blocked: 3 Auto Scaling — no collector; 6 CloudWatch Metrics/Logs — collector only
  persists alarms+dashboards. pending: 12 P1 pillar rows for Config/EventBridge/SFN,
  released during batch-015 claim correction — P0-only batches per batch-014 precedent)
  - batch-001 EC2 (2ec71c0), 002 Lambda (4d6700f), 003 S3 (d446eb1),
    004 RDS+EBS+EFS (a2aede3), 005 scorecards UI (8453624), 006 ECS+EKS (e462907),
    007 DynamoDB (be759fb), 008 SQS+SNS+Kinesis (2609581),
    009 ElastiCache+OpenSearch+VPC (30b2853), 010 IAM+CloudFront+ELB+APIGW (791b944),
    011 CloudWatch+AppSync+Glacier+StorageGW+KinesisAnalytics (af9da2b),
    012 Subnet+SG+NATGW+IGW+RouteTable+NACL (c30f03f), 013 Fargate (d13f57f),
    014 KMS+ACM+CloudTrail (0e37900), 015 Config+EventBridge+StepFunctions (009f030)
- Last validation (batch-015): cargo test --lib inventory → 287 passed, 0 failed;
  cargo check → 0 errors; cargo check --features integration-tests --tests → 0
  errors; npm run build → ok. Working tree clean except checkpoint files.
- Current batch: batch-016 (recorded in runs, NOT started — no claims, no edits)
- Next action: batch-016 — complete next stub collectors + evaluators for
  SSM (SsmDocument → sync_documents), SES (SesIdentity → sync_identities), and
  Athena (verify resource type + dispatch in services/aws/control_plane.rs).
  Verify feature IDs + P0 pillar rows (cost/resilience/security) in
  docs/product-roadmap/01-aws-cloud/feature-backlog.csv first; claim ONLY P0 rows.
  Proven pattern, two files per service via 3 parallel agents (each owns its
  collector + new evaluator, agents do NOT run cargo and do NOT touch shared files):
  1) complete backend/src/services/aws/aws_control_plane/<svc>_control_plane.rs
     stub (SDK crates in Cargo.toml; verify SDK API against
     ~/.cargo/registry/src crate source; keep dispatch method name;
     reference: kms/glacier collectors)
  2) new backend/src/services/aws/inventory/<svc>_pillar_evaluator.rs grounded
     only in persisted fields, with data-gap codes + stale path + in-file tests
     (reference: kms_pillar_evaluator.rs + types.rs)
  3) coordinator wires inventory/mod.rs, controllers/aws_inventory.rs,
     api/routes/aws_inventory.rs, integration test list (path,resource_type) in
     backend/tests/integration/aws_inventory_api_tests.rs, frontend
     src/pages/PillarScorecards.js SERVICES
  4) cd backend && cargo test --lib inventory && cargo check && cargo check
     --features integration-tests --tests; cd frontend && npm run build;
     commit batch files only via explicit pathspec; update sqlite ledger.
- Remaining stub collectors after batch-016 (63-line files): apprunner, backup,
  batch, emr, globalaccelerator, glue, redshift, waf. All SDK crates already in
  backend/Cargo.toml.
- Services with NO collector file: Auto Scaling, CloudWatch Metrics/Logs, Aurora,
  Bedrock, Route 53, Secrets Manager, etc. — need new collector + enum +
  dispatch wiring (bigger slices).
- No React test infra (no @testing-library) — UI tests deferred.
- Note: user works on CLAUDE.md/prompts in parallel; never commit those — use
  explicit pathspec on git commit.
