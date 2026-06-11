# Roadmap Run Resume

- Run ID: run-001
- Roadmap hash: ab4059db94762a3e
- Last commit: be759fb (batch-007: DynamoDB pillar evaluators)
- Completed batches: 7
  - batch-001 EC2 (2ec71c0), batch-002 Lambda (4d6700f), batch-003 S3 (d446eb1),
    batch-004 RDS+EBS+EFS (a2aede3), batch-005 frontend scorecards UI (8453624),
    batch-006 ECS+EKS (e462907), batch-007 DynamoDB (be759fb)
- Committed features: 27 · Blocked: 3 (Auto Scaling — no collector)
- Current batch: batch-008 (claimed in next_action, not yet started)
- Next action: implement SQS (02332/02341/02368), SNS (02395/02404/02431),
  Kinesis Data Streams (01891/01900/01927) evaluators. Pattern:
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
