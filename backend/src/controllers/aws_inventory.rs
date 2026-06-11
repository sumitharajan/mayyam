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

// Thin controller for deterministic inventory pillar reports. All scoring
// logic lives in services::aws::inventory; this layer only loads resources
// and shapes the HTTP response with freshness metadata.

use actix_web::{web, HttpResponse};
use chrono::Utc;
use serde::Deserialize;
use serde_json::json;
use std::sync::Arc;
use tracing::debug;

use crate::errors::AppError;
use crate::models::aws_resource::AwsResourceType;
use crate::repositories::aws_resource::AwsResourceRepository;
use crate::services::aws::inventory::ebs_pillar_evaluator::evaluate_ebs_fleet;
use crate::services::aws::inventory::ec2_pillar_evaluator::evaluate_ec2_fleet;
use crate::services::aws::inventory::efs_pillar_evaluator::evaluate_efs_fleet;
use crate::services::aws::inventory::lambda_pillar_evaluator::evaluate_lambda_fleet;
use crate::services::aws::inventory::rds_pillar_evaluator::evaluate_rds_fleet;
use crate::services::aws::inventory::s3_pillar_evaluator::evaluate_s3_fleet;
use crate::services::aws::inventory::types::{Pillar, DEFAULT_STALE_AFTER_HOURS};

#[derive(Clone)]
pub struct AwsInventoryController {
    aws_resource_repo: Arc<AwsResourceRepository>,
}

impl AwsInventoryController {
    pub fn new(aws_resource_repo: Arc<AwsResourceRepository>) -> Self {
        Self { aws_resource_repo }
    }
}

#[derive(Debug, Deserialize)]
pub struct Ec2PillarQuery {
    pub account_id: String,
    /// Optional: `cost`, `security`, or `resilience`. Omit for all three.
    pub pillar: Option<String>,
}

fn parse_pillars(raw: &Option<String>) -> Result<Vec<Pillar>, AppError> {
    match raw {
        Some(raw) => Ok(vec![Pillar::parse(raw).ok_or_else(|| {
            AppError::BadRequest(format!(
                "Unknown pillar '{}'; expected one of: cost, security, resilience",
                raw
            ))
        })?]),
        None => Ok(vec![Pillar::Cost, Pillar::Security, Pillar::Resilience]),
    }
}

async fn pillar_reports(
    controller: &AwsInventoryController,
    query: Ec2PillarQuery,
    resource_type: AwsResourceType,
    evaluate: impl Fn(
        &[crate::models::aws_resource::Model],
        Pillar,
        chrono::DateTime<Utc>,
    ) -> crate::services::aws::inventory::types::PillarReport,
) -> Result<HttpResponse, AppError> {
    let pillars = parse_pillars(&query.pillar)?;
    let resources = controller
        .aws_resource_repo
        .find_by_account_and_type(&query.account_id, &resource_type.to_string())
        .await?;

    let now = Utc::now();
    let reports: Vec<_> = pillars
        .iter()
        .map(|pillar| evaluate(&resources, *pillar, now))
        .collect();
    let oldest_refresh = resources.iter().map(|r| r.last_refreshed).min();

    Ok(HttpResponse::Ok().json(json!({
        "account_id": query.account_id,
        "resource_type": resource_type.to_string(),
        "evaluated_at": now,
        "stale_after_hours": DEFAULT_STALE_AFTER_HOURS,
        "resources_evaluated": resources.len(),
        "oldest_refresh": oldest_refresh,
        "reports": reports,
    })))
}

pub async fn get_ec2_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("EC2 pillar report request: {:?}", query);
    pillar_reports(&controller, query, AwsResourceType::EC2Instance, evaluate_ec2_fleet).await
}

pub async fn get_lambda_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("Lambda pillar report request: {:?}", query);
    pillar_reports(&controller, query, AwsResourceType::LambdaFunction, evaluate_lambda_fleet).await
}

pub async fn get_s3_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("S3 pillar report request: {:?}", query);
    pillar_reports(&controller, query, AwsResourceType::S3Bucket, evaluate_s3_fleet).await
}

pub async fn get_rds_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("RDS pillar report request: {:?}", query);
    pillar_reports(&controller, query, AwsResourceType::RdsInstance, evaluate_rds_fleet).await
}

pub async fn get_ebs_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("EBS pillar report request: {:?}", query);
    pillar_reports(&controller, query, AwsResourceType::EbsVolume, evaluate_ebs_fleet).await
}

pub async fn get_efs_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("EFS pillar report request: {:?}", query);
    pillar_reports(&controller, query, AwsResourceType::EfsFileSystem, evaluate_efs_fleet).await
}
