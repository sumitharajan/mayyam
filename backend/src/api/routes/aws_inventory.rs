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


use actix_web::{web, Scope};
use std::sync::Arc;

use crate::controllers::aws_inventory::{self, AwsInventoryController};

pub fn configure(controller: Arc<AwsInventoryController>) -> Scope {
    web::scope("/api/aws/inventory")
        .app_data(web::Data::new(controller))
        .route("/ec2/pillars", web::get().to(aws_inventory::get_ec2_pillar_reports))
        .route("/lambda/pillars", web::get().to(aws_inventory::get_lambda_pillar_reports))
        .route("/s3/pillars", web::get().to(aws_inventory::get_s3_pillar_reports))
        .route("/rds/pillars", web::get().to(aws_inventory::get_rds_pillar_reports))
        .route("/ebs/pillars", web::get().to(aws_inventory::get_ebs_pillar_reports))
        .route("/efs/pillars", web::get().to(aws_inventory::get_efs_pillar_reports))
        .route("/ecs/pillars", web::get().to(aws_inventory::get_ecs_pillar_reports))
        .route("/eks/pillars", web::get().to(aws_inventory::get_eks_pillar_reports))
        .route("/dynamodb/pillars", web::get().to(aws_inventory::get_dynamodb_pillar_reports))
        .route("/sqs/pillars", web::get().to(aws_inventory::get_sqs_pillar_reports))
        .route("/sns/pillars", web::get().to(aws_inventory::get_sns_pillar_reports))
        .route("/kinesis/pillars", web::get().to(aws_inventory::get_kinesis_pillar_reports))
}
