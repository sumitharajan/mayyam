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
use crate::services::aws::inventory::acm_pillar_evaluator::evaluate_acm_fleet;
use crate::services::aws::inventory::api_gateway_pillar_evaluator::evaluate_api_gateway_fleet;
use crate::services::aws::inventory::apprunner_pillar_evaluator::evaluate_apprunner_fleet;
use crate::services::aws::inventory::appsync_pillar_evaluator::evaluate_appsync_fleet;
use crate::services::aws::inventory::athena_pillar_evaluator::evaluate_athena_fleet;
use crate::services::aws::inventory::backup_pillar_evaluator::evaluate_backup_fleet;
use crate::services::aws::inventory::batch_pillar_evaluator::evaluate_batch_fleet;
use crate::services::aws::inventory::emr_pillar_evaluator::evaluate_emr_fleet;
use crate::services::aws::inventory::ssm_pillar_evaluator::evaluate_ssm_fleet;
use crate::services::aws::inventory::cloudfront_pillar_evaluator::evaluate_cloudfront_fleet;
use crate::services::aws::inventory::cloudtrail_pillar_evaluator::evaluate_cloudtrail_fleet;
use crate::services::aws::inventory::cloudwatch_pillar_evaluator::evaluate_cloudwatch_fleet;
use crate::services::aws::inventory::config_pillar_evaluator::evaluate_config_fleet;
use crate::services::aws::inventory::eventbridge_pillar_evaluator::evaluate_eventbridge_fleet;
use crate::services::aws::inventory::stepfunctions_pillar_evaluator::evaluate_stepfunctions_fleet;
use crate::services::aws::inventory::dynamodb_pillar_evaluator::evaluate_dynamodb_fleet;
use crate::services::aws::inventory::ebs_pillar_evaluator::evaluate_ebs_fleet;
use crate::services::aws::inventory::ec2_pillar_evaluator::evaluate_ec2_fleet;
use crate::services::aws::inventory::ecs_pillar_evaluator::evaluate_ecs_fleet;
use crate::services::aws::inventory::eks_pillar_evaluator::evaluate_eks_fleet;
use crate::services::aws::inventory::efs_pillar_evaluator::evaluate_efs_fleet;
use crate::services::aws::inventory::elasticache_pillar_evaluator::evaluate_elasticache_fleet;
use crate::services::aws::inventory::fargate_pillar_evaluator::evaluate_fargate_fleet;
use crate::services::aws::inventory::glacier_pillar_evaluator::evaluate_glacier_fleet;
use crate::services::aws::inventory::iam_pillar_evaluator::evaluate_iam_fleet;
use crate::services::aws::inventory::kinesis_pillar_evaluator::evaluate_kinesis_fleet;
use crate::services::aws::inventory::kinesisanalytics_pillar_evaluator::evaluate_kinesisanalytics_fleet;
use crate::services::aws::inventory::kms_pillar_evaluator::evaluate_kms_fleet;
use crate::services::aws::inventory::internet_gateway_pillar_evaluator::evaluate_internet_gateway_fleet;
use crate::services::aws::inventory::lambda_pillar_evaluator::evaluate_lambda_fleet;
use crate::services::aws::inventory::nat_gateway_pillar_evaluator::evaluate_nat_gateway_fleet;
use crate::services::aws::inventory::network_acl_pillar_evaluator::evaluate_network_acl_fleet;
use crate::services::aws::inventory::route_table_pillar_evaluator::evaluate_route_table_fleet;
use crate::services::aws::inventory::security_group_pillar_evaluator::evaluate_security_group_fleet;
use crate::services::aws::inventory::subnet_pillar_evaluator::evaluate_subnet_fleet;
use crate::services::aws::inventory::load_balancer_pillar_evaluator::evaluate_load_balancer_fleet;
use crate::services::aws::inventory::opensearch_pillar_evaluator::evaluate_opensearch_fleet;
use crate::services::aws::inventory::rds_pillar_evaluator::evaluate_rds_fleet;
use crate::services::aws::inventory::s3_pillar_evaluator::evaluate_s3_fleet;
use crate::services::aws::inventory::sns_pillar_evaluator::evaluate_sns_fleet;
use crate::services::aws::inventory::sqs_pillar_evaluator::evaluate_sqs_fleet;
use crate::services::aws::inventory::storagegateway_pillar_evaluator::evaluate_storagegateway_fleet;
use crate::services::aws::inventory::types::{Pillar, DEFAULT_STALE_AFTER_HOURS};
use crate::services::aws::inventory::vpc_pillar_evaluator::evaluate_vpc_fleet;

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

/// Pillar reports that span several persisted resource types (e.g. IAM
/// users/roles/policies/groups) load every type into one fleet slice and
/// report under a combined resource_type label.
async fn multi_type_pillar_reports(
    controller: &AwsInventoryController,
    query: Ec2PillarQuery,
    resource_types: &[AwsResourceType],
    combined_label: &str,
    evaluate: impl Fn(
        &[crate::models::aws_resource::Model],
        Pillar,
        chrono::DateTime<Utc>,
    ) -> crate::services::aws::inventory::types::PillarReport,
) -> Result<HttpResponse, AppError> {
    let pillars = parse_pillars(&query.pillar)?;

    let mut resources = Vec::new();
    for resource_type in resource_types {
        resources.extend(
            controller
                .aws_resource_repo
                .find_by_account_and_type(&query.account_id, &resource_type.to_string())
                .await?,
        );
    }

    let now = Utc::now();
    let reports: Vec<_> = pillars
        .iter()
        .map(|pillar| evaluate(&resources, *pillar, now))
        .collect();
    let oldest_refresh = resources.iter().map(|r| r.last_refreshed).min();

    Ok(HttpResponse::Ok().json(json!({
        "account_id": query.account_id,
        "resource_type": combined_label,
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

/// ECS pillar reports span clusters and services, so this handler loads
/// both resource types before evaluating.
pub async fn get_ecs_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("ECS pillar report request: {:?}", query);
    let pillars = parse_pillars(&query.pillar)?;

    let mut resources = controller
        .aws_resource_repo
        .find_by_account_and_type(&query.account_id, &AwsResourceType::EcsCluster.to_string())
        .await?;
    resources.extend(
        controller
            .aws_resource_repo
            .find_by_account_and_type(&query.account_id, &AwsResourceType::EcsService.to_string())
            .await?,
    );

    let now = Utc::now();
    let reports: Vec<_> = pillars
        .iter()
        .map(|pillar| evaluate_ecs_fleet(&resources, *pillar, now))
        .collect();
    let oldest_refresh = resources.iter().map(|r| r.last_refreshed).min();

    Ok(HttpResponse::Ok().json(json!({
        "account_id": query.account_id,
        "resource_type": "EcsClusterAndService",
        "evaluated_at": now,
        "stale_after_hours": DEFAULT_STALE_AFTER_HOURS,
        "resources_evaluated": resources.len(),
        "oldest_refresh": oldest_refresh,
        "reports": reports,
    })))
}

pub async fn get_sqs_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("SQS pillar report request: {:?}", query);
    pillar_reports(&controller, query, AwsResourceType::SqsQueue, evaluate_sqs_fleet).await
}

pub async fn get_sns_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("SNS pillar report request: {:?}", query);
    pillar_reports(&controller, query, AwsResourceType::SnsTopics, evaluate_sns_fleet).await
}

pub async fn get_kinesis_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("Kinesis pillar report request: {:?}", query);
    pillar_reports(&controller, query, AwsResourceType::KinesisStream, evaluate_kinesis_fleet).await
}

pub async fn get_elasticache_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("ElastiCache pillar report request: {:?}", query);
    pillar_reports(&controller, query, AwsResourceType::ElasticacheCluster, evaluate_elasticache_fleet).await
}

pub async fn get_opensearch_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("OpenSearch pillar report request: {:?}", query);
    pillar_reports(&controller, query, AwsResourceType::OpenSearchDomain, evaluate_opensearch_fleet).await
}

pub async fn get_vpc_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("VPC pillar report request: {:?}", query);
    pillar_reports(&controller, query, AwsResourceType::Vpc, evaluate_vpc_fleet).await
}

pub async fn get_dynamodb_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("DynamoDB pillar report request: {:?}", query);
    pillar_reports(&controller, query, AwsResourceType::DynamoDbTable, evaluate_dynamodb_fleet).await
}

pub async fn get_eks_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("EKS pillar report request: {:?}", query);
    pillar_reports(&controller, query, AwsResourceType::EksCluster, evaluate_eks_fleet).await
}

pub async fn get_iam_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("IAM pillar report request: {:?}", query);
    multi_type_pillar_reports(
        &controller,
        query,
        &[
            AwsResourceType::IamUser,
            AwsResourceType::IamRole,
            AwsResourceType::IamPolicy,
            AwsResourceType::IamGroup,
        ],
        "IamUserRolePolicyAndGroup",
        evaluate_iam_fleet,
    )
    .await
}

pub async fn get_cloudfront_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("CloudFront pillar report request: {:?}", query);
    pillar_reports(
        &controller,
        query,
        AwsResourceType::CloudFrontDistribution,
        evaluate_cloudfront_fleet,
    )
    .await
}

pub async fn get_elb_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("ELB pillar report request: {:?}", query);
    multi_type_pillar_reports(
        &controller,
        query,
        &[AwsResourceType::Alb, AwsResourceType::Nlb, AwsResourceType::Elb],
        "AlbNlbAndElb",
        evaluate_load_balancer_fleet,
    )
    .await
}

pub async fn get_api_gateway_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("API Gateway pillar report request: {:?}", query);
    multi_type_pillar_reports(
        &controller,
        query,
        &[
            AwsResourceType::ApiGatewayRestApi,
            AwsResourceType::ApiGatewayStage,
            AwsResourceType::ApiGatewayMethod,
        ],
        "ApiGatewayRestApiStageAndMethod",
        evaluate_api_gateway_fleet,
    )
    .await
}

pub async fn get_cloudwatch_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("CloudWatch pillar report request: {:?}", query);
    multi_type_pillar_reports(
        &controller,
        query,
        &[
            AwsResourceType::CloudWatchAlarm,
            AwsResourceType::CloudWatchDashboard,
        ],
        "CloudWatchAlarmAndDashboard",
        evaluate_cloudwatch_fleet,
    )
    .await
}

pub async fn get_appsync_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("AppSync pillar report request: {:?}", query);
    pillar_reports(&controller, query, AwsResourceType::AppSyncApi, evaluate_appsync_fleet).await
}

pub async fn get_glacier_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("Glacier pillar report request: {:?}", query);
    pillar_reports(&controller, query, AwsResourceType::GlacierArchive, evaluate_glacier_fleet)
        .await
}

pub async fn get_storagegateway_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("Storage Gateway pillar report request: {:?}", query);
    pillar_reports(
        &controller,
        query,
        AwsResourceType::StorageGateway,
        evaluate_storagegateway_fleet,
    )
    .await
}

pub async fn get_kinesisanalytics_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("Kinesis Analytics pillar report request: {:?}", query);
    pillar_reports(
        &controller,
        query,
        AwsResourceType::KinesisAnalyticsApp,
        evaluate_kinesisanalytics_fleet,
    )
    .await
}

pub async fn get_subnet_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("Subnet pillar report request: {:?}", query);
    pillar_reports(&controller, query, AwsResourceType::Subnet, evaluate_subnet_fleet).await
}

pub async fn get_security_group_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("Security group pillar report request: {:?}", query);
    pillar_reports(
        &controller,
        query,
        AwsResourceType::SecurityGroup,
        evaluate_security_group_fleet,
    )
    .await
}

pub async fn get_nat_gateway_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("NAT gateway pillar report request: {:?}", query);
    pillar_reports(&controller, query, AwsResourceType::NatGateway, evaluate_nat_gateway_fleet)
        .await
}

pub async fn get_internet_gateway_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("Internet gateway pillar report request: {:?}", query);
    pillar_reports(
        &controller,
        query,
        AwsResourceType::InternetGateway,
        evaluate_internet_gateway_fleet,
    )
    .await
}

pub async fn get_route_table_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("Route table pillar report request: {:?}", query);
    pillar_reports(&controller, query, AwsResourceType::RouteTable, evaluate_route_table_fleet)
        .await
}

pub async fn get_network_acl_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("Network ACL pillar report request: {:?}", query);
    pillar_reports(&controller, query, AwsResourceType::NetworkAcl, evaluate_network_acl_fleet)
        .await
}

pub async fn get_fargate_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("Fargate pillar report request: {:?}", query);
    pillar_reports(&controller, query, AwsResourceType::FargateProfile, evaluate_fargate_fleet)
        .await
}

pub async fn get_kms_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("KMS pillar report request: {:?}", query);
    pillar_reports(&controller, query, AwsResourceType::KmsKey, evaluate_kms_fleet).await
}

pub async fn get_acm_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("ACM pillar report request: {:?}", query);
    pillar_reports(&controller, query, AwsResourceType::AcmCertificate, evaluate_acm_fleet).await
}

pub async fn get_cloudtrail_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("CloudTrail pillar report request: {:?}", query);
    pillar_reports(
        &controller,
        query,
        AwsResourceType::CloudTrailTrail,
        evaluate_cloudtrail_fleet,
    )
    .await
}

pub async fn get_config_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("AWS Config pillar report request: {:?}", query);
    pillar_reports(&controller, query, AwsResourceType::ConfigRule, evaluate_config_fleet).await
}

pub async fn get_eventbridge_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("EventBridge pillar report request: {:?}", query);
    pillar_reports(
        &controller,
        query,
        AwsResourceType::EventBridgeRule,
        evaluate_eventbridge_fleet,
    )
    .await
}

pub async fn get_stepfunctions_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("Step Functions pillar report request: {:?}", query);
    pillar_reports(
        &controller,
        query,
        AwsResourceType::StepFunction,
        evaluate_stepfunctions_fleet,
    )
    .await
}

pub async fn get_apprunner_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("App Runner pillar report request: {:?}", query);
    pillar_reports(
        &controller,
        query,
        AwsResourceType::AppRunnerService,
        evaluate_apprunner_fleet,
    )
    .await
}

pub async fn get_athena_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("Athena pillar report request: {:?}", query);
    pillar_reports(
        &controller,
        query,
        AwsResourceType::AthenaWorkgroup,
        evaluate_athena_fleet,
    )
    .await
}

pub async fn get_ssm_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("SSM document pillar report request: {:?}", query);
    pillar_reports(
        &controller,
        query,
        AwsResourceType::SsmDocument,
        evaluate_ssm_fleet,
    )
    .await
}

pub async fn get_backup_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("AWS Backup pillar report request: {:?}", query);
    pillar_reports(
        &controller,
        query,
        AwsResourceType::BackupVault,
        evaluate_backup_fleet,
    )
    .await
}

pub async fn get_batch_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("Batch pillar report request: {:?}", query);
    pillar_reports(
        &controller,
        query,
        AwsResourceType::BatchComputeEnv,
        evaluate_batch_fleet,
    )
    .await
}

pub async fn get_emr_pillar_reports(
    controller: web::Data<Arc<AwsInventoryController>>,
    query: web::Query<Ec2PillarQuery>,
) -> Result<HttpResponse, AppError> {
    let query = query.into_inner();
    debug!("EMR pillar report request: {:?}", query);
    pillar_reports(
        &controller,
        query,
        AwsResourceType::EmrCluster,
        evaluate_emr_fleet,
    )
    .await
}
