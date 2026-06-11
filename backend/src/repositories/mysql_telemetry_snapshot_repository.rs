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

use chrono::{Duration, Utc};
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, QueryOrder,
    QuerySelect, Set,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::models::mysql_telemetry_snapshot::{
    ActiveModel, Column, Entity, MySqlTelemetrySnapshotRecord,
};
use crate::services::analytics::mysql_analytics::mysql_telemetry::{
    MySqlFindingSeverity, MySqlTelemetrySnapshot,
};

#[derive(Clone)]
pub struct MySqlTelemetrySnapshotRepository {
    db: Arc<DatabaseConnection>,
}

impl MySqlTelemetrySnapshotRepository {
    pub fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }

    pub async fn create_from_snapshot(
        &self,
        connection_id: Uuid,
        snapshot: &MySqlTelemetrySnapshot,
    ) -> Result<MySqlTelemetrySnapshotRecord, String> {
        let high_priority_findings_count = snapshot
            .findings
            .iter()
            .filter(|finding| {
                matches!(
                    finding.severity,
                    MySqlFindingSeverity::Critical | MySqlFindingSeverity::High
                )
            })
            .count() as i32;

        let active_model = ActiveModel {
            id: Set(Uuid::new_v4()),
            connection_id: Set(connection_id),
            collected_at: Set(snapshot.collected_at),
            qps_since_start: Set(snapshot.workload.qps_since_start),
            threads_connected: Set(snapshot.connections.threads_connected as i32),
            threads_running: Set(snapshot.connections.threads_running as i32),
            connection_usage_pct: Set(snapshot.connections.connection_usage_pct),
            buffer_pool_hit_ratio: Set(snapshot.innodb.buffer_pool_hit_ratio),
            slow_queries: Set(snapshot.workload.slow_queries as i64),
            findings_count: Set(snapshot.findings.len() as i32),
            high_priority_findings_count: Set(high_priority_findings_count),
            snapshot: Set(serde_json::to_value(snapshot)
                .map_err(|e| format!("Failed to serialize MySQL telemetry snapshot: {}", e))?),
            created_at: Set(Utc::now()),
        };

        active_model
            .insert(self.db.as_ref())
            .await
            .map_err(|e| format!("Failed to create MySQL telemetry snapshot: {}", e))
    }

    pub async fn find_recent_by_connection(
        &self,
        connection_id: Uuid,
        hours: i64,
        limit: u64,
    ) -> Result<Vec<MySqlTelemetrySnapshotRecord>, String> {
        let cutoff = Utc::now() - Duration::hours(hours);

        Entity::find()
            .filter(Column::ConnectionId.eq(connection_id))
            .filter(Column::CollectedAt.gte(cutoff))
            .order_by_desc(Column::CollectedAt)
            .limit(limit)
            .all(self.db.as_ref())
            .await
            .map_err(|e| format!("Failed to find MySQL telemetry snapshots: {}", e))
    }
}
