# Roadmap Run Resume

- Run ID: run-001
- Roadmap hash: ab4059db94762a3e
- Last commit: 30b2853 (batch-009: ElastiCache+OpenSearch+VPC pillar evaluators)
- Completed batches: 9
  - batch-001 EC2 (2ec71c0), batch-002 Lambda (4d6700f), batch-003 S3 (d446eb1),
    batch-004 RDS+EBS+EFS (a2aede3), batch-005 frontend scorecards UI (8453624),
    batch-006 ECS+EKS (e462907), batch-007 DynamoDB (be759fb),
    batch-008 SQS+SNS+Kinesis (2609581), batch-009 ElastiCache+OpenSearch+VPC (30b2853)
- Committed features: 45 · Blocked: 3 (Auto Scaling — no collector)
- Last validation (batch-009): cargo test --lib inventory → 81 passed, 0 failed;
  cargo check → 0 errors; npm run build → ok. All batch-009 files committed in 30b2853.
- Working tree: clean except checkpoint files (.claude/checkpoints/roadmap-run/).
  No uncommitted source changes.
- Current batch: batch-010 (recorded in runs.current_batch_id, NOT started — no
  claims, no edits)
- Next action: implement batch-010 evaluators for IAM (03592/03601/03628),
  CloudFront (03277/03286/03313), ELB (03214/03223/03250),
  API Gateway (02710/02719/02746). Pattern:
  1) grep collector resource_data fields in
     backend/src/services/aws/aws_control_plane/<svc>_control_plane.rs
  2) new backend/src/services/aws/inventory/<svc>_pillar_evaluator.rs with
     reason-coded checks + data-gap findings + stale path + #[cfg(test)] tests
  3) wire mod.rs, controllers/aws_inventory.rs handler, routes/aws_inventory.rs,
     integration test list, frontend PillarScorecards SERVICES tab
  4) cargo test --lib inventory; cargo check; cargo check --features
     integration-tests --tests; npm run build; commit; update sqlite ledger.
- Known blockers: 17 stub collectors (63-line files in aws_control_plane/) —
  those services' M1 rows need collector completion first (larger slices).
- No React test infra (no @testing-library) — UI tests deferred.
