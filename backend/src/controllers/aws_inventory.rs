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
use crate::services::aws::inventory::ec2_pillar_evaluator::{
    evaluate_ec2_fleet, Pillar, DEFAULT_STALE_AFTER_HOURS,
};

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

pub async fn get_ec2_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("EC2 pillar report request: {:?}", query);

    let pillars: Vec<Pillar> = match &query.pillar {
        Some(raw) => vec![Pillar::parse(raw).ok_or_else(|| {
            AppError::BadRequest(format!(
                "Unknown pillar '{}'; expected one of: cost, security, resilience",
                raw
            ))
        })?],
        None => vec![Pillar::Cost, Pillar::Security, Pillar::Resilience],
    };

    let resources = controller
        .aws_resource_repo
        .find_by_account_and_type(&query.account_id, &AwsResourceType::EC2Instance.to_string())
        .await?;

    let now = Utc::now();
    let reports: Vec<_> = pillars
        .iter()
        .map(|pillar| evaluate_ec2_fleet(&resources, *pillar, now))
        .collect();
    let oldest_refresh = resources.iter().map(|r| r.last_refreshed).min();

    Ok(HttpResponse::Ok().json(json!({
        "account_id": query.account_id,
        "resource_type": AwsResourceType::EC2Instance.to_string(),
        "evaluated_at": now,
        "stale_after_hours": DEFAULT_STALE_AFTER_HOURS,
        "resources_evaluated": resources.len(),
        "oldest_refresh": oldest_refresh,
        "reports": reports,
    })))
}
