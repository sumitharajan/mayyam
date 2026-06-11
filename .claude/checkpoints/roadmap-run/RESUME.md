# Roadmap Run Resume

- Run ID: run-001
- Roadmap hash: ab4059db94762a3e
- Last commit: 4d6700f (batch-002: Lambda pillar evaluators + shared inventory types)
- Completed batches: 2 (batch-001 EC2 2ec71c0, batch-002 Lambda 4d6700f)
- Committed features: 6 (EC2 00001/00010/00037, Lambda 00127/00136/00163)
- Blocked features: 3 (Auto Scaling 00064/00073/00100 — no ASG collector/resource type
  in backend; needs new connector, schedule as a larger dedicated slice)
- Current batch: batch-003 (not yet claimed)
- Blocker: none for the run
- Next action: select batch-003 — remaining P0 M1 inventory rows in 01-aws-cloud that
  have existing collectors (check feature-backlog.csv for next S-size M1 slices, e.g.
  ECS/EKS/Fargate or S3/RDS pillar evaluators following
  backend/src/services/aws/inventory/{ec2,lambda}_pillar_evaluator.rs pattern), claim
  rows in checkpoint.sqlite, implement with TDD, cargo test --lib inventory,
  cargo check, commit.
- Pattern: shared types in backend/src/services/aws/inventory/types.rs; controller
  backend/src/controllers/aws_inventory.rs; routes /api/aws/inventory/<svc>/pillars.
