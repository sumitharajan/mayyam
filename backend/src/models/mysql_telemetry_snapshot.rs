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

use chrono::{DateTime, Utc};
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Deserialize, Serialize)]
#[sea_orm(table_name = "mysql_telemetry_snapshots")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub connection_id: Uuid,
    pub collected_at: DateTime<Utc>,
    pub qps_since_start: f64,
    pub threads_connected: i32,
    pub threads_running: i32,
    pub connection_usage_pct: Option<f64>,
    pub buffer_pool_hit_ratio: Option<f64>,
    pub slow_queries: i64,
    pub findings_count: i32,
    pub high_priority_findings_count: i32,
    pub snapshot: Json,
    pub created_at: DateTime<Utc>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

pub type MySqlTelemetrySnapshotRecord = Model;
