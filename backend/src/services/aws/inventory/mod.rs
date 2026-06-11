// Copyright (c) 2025 Rajan Panneer Selvam
//
// Licensed under the Business Source License 1.1 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.mariadb.com/bsl11
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Deterministic inventory pillar evaluators. These run without an LLM,
// emit reason-coded findings, and preserve the raw evidence they used.

pub mod dynamodb_pillar_evaluator;
pub mod ebs_pillar_evaluator;
pub mod ec2_pillar_evaluator;
pub mod ecs_pillar_evaluator;
pub mod eks_pillar_evaluator;
pub mod efs_pillar_evaluator;
pub mod lambda_pillar_evaluator;
pub mod rds_pillar_evaluator;
pub mod s3_pillar_evaluator;
pub mod types;
