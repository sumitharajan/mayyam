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

use actix_web::{web, HttpResponse, Responder};
use chrono::{DateTime, Utc};
use sea_orm::DatabaseConnection;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

use crate::config::Config;
use crate::errors::AppError;
use crate::middleware::auth::Claims;
use crate::models::database::{CreateDatabaseConnectionRequest, DatabaseQueryRequest};
use crate::repositories::database::DatabaseRepository;
use crate::repositories::mysql_telemetry_snapshot_repository::MySqlTelemetrySnapshotRepository;
use crate::services::analytics::mysql_analytics::mysql_analytics_service::MySqlAnalyticsService;
use crate::services::analytics::mysql_analytics::mysql_signals::{
    MySqlPerformanceSignal, MySqlSignalEvaluator, MySqlSignalRules, MySqlSignalSnapshot,
};
use crate::services::analytics::mysql_analytics::mysql_telemetry::MySqlTelemetryCollector;
use crate::services::analytics::postgres_analytics::postgres_analytics_service::PostgresAnalyticsService;
use crate::services::database::DatabaseService;
use crate::utils::database::connect_to_dynamic_database;

#[derive(Debug, Deserialize)]
pub struct MySqlTelemetryHistoryQuery {
    pub hours: Option<i64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Serialize)]
pub struct MySqlTelemetryHistoryPoint {
    pub id: Uuid,
    pub collected_at: DateTime<Utc>,
    pub qps_since_start: f64,
    pub threads_connected: i32,
    pub threads_running: i32,
    pub connection_usage_pct: Option<f64>,
    pub buffer_pool_hit_ratio: Option<f64>,
    pub slow_queries: i64,
    pub findings_count: i32,
    pub high_priority_findings_count: i32,
}

#[derive(Debug, Serialize)]
pub struct MySqlTelemetryHistoryResponse {
    pub snapshots: Vec<MySqlTelemetryHistoryPoint>,
    pub total: usize,
}

#[derive(Debug, Serialize)]
pub struct MySqlTelemetrySignalsResponse {
    pub signals: Vec<MySqlPerformanceSignal>,
    pub sample_count: usize,
    pub period_hours: i64,
}

pub async fn execute_query(
    query_req: web::Json<DatabaseQueryRequest>,
    db_pool: web::Data<Arc<DatabaseConnection>>,
    config: web::Data<Config>,
    _claims: web::ReqData<Claims>,
) -> Result<impl Responder, AppError> {
    let db_repo = DatabaseRepository::new(db_pool.get_ref().clone(), config.get_ref().clone());

    // Get the database connection details
    let conn_id = uuid::Uuid::parse_str(&query_req.connection_id)
        .map_err(|e| AppError::BadRequest(format!("Invalid UUID: {}", e)))?;
    let conn_model = db_repo.find_by_id(conn_id).await?.ok_or_else(|| {
        AppError::NotFound(format!(
            "Database connection not found: {}",
            query_req.connection_id
        ))
    })?;

    // Execute the query with analysis if requested
    let analytics = MySqlAnalyticsService::new(config.get_ref().clone());
    let result = if query_req.explain.unwrap_or(false) {
        analytics
            .execute_query_with_explain(&conn_model, &query_req.query, query_req.params.as_ref())
            .await?
    } else {
        analytics
            .execute_query(&conn_model, &query_req.query, query_req.params.as_ref())
            .await?
    };

    Ok(HttpResponse::Ok().json(result))
}

pub async fn analyze_database(
    path: web::Path<String>,
    db_pool: web::Data<Arc<DatabaseConnection>>,
    config: web::Data<Config>,
    _claims: web::ReqData<Claims>,
) -> Result<impl Responder, AppError> {
    let db_repo = DatabaseRepository::new(db_pool.get_ref().clone(), config.get_ref().clone());

    // Get the database connection details to check if it exists
    let conn_id = uuid::Uuid::parse_str(&path.into_inner())
        .map_err(|e| AppError::BadRequest(format!("Invalid UUID: {}", e)))?;
    let conn_model = db_repo
        .find_by_id(conn_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Database connection not found".to_string()))?;

    // Log that we're analyzing the connection for debugging purposes
    tracing::info!("Analyzing database connection: {}", conn_model.name);

    let connection_type = conn_model.connection_type.to_lowercase();
    let analysis = match connection_type.as_str() {
        "mysql" => {
            let analytics = MySqlAnalyticsService::new(config.get_ref().clone());
            let dynamic_conn = connect_to_dynamic_database(&conn_model, config.get_ref()).await?;
            analytics.analyze_database(&dynamic_conn).await
        }
        "postgres" => {
            let analytics = PostgresAnalyticsService::new(config.get_ref().clone());
            let dynamic_conn = connect_to_dynamic_database(&conn_model, config.get_ref()).await?;
            analytics.analyze_database(&dynamic_conn).await
        }
        other => Err(AppError::BadRequest(format!(
            "Unsupported database type for analysis: {}",
            other
        ))),
    }?;

    Ok(HttpResponse::Ok().json(analysis))
}

pub async fn get_mysql_telemetry(
    path: web::Path<String>,
    db_pool: web::Data<Arc<DatabaseConnection>>,
    config: web::Data<Config>,
    claims: web::ReqData<Claims>,
) -> Result<impl Responder, AppError> {
    let db_repo = DatabaseRepository::new(db_pool.get_ref().clone(), config.get_ref().clone());
    let conn_id = uuid::Uuid::parse_str(&path.into_inner())
        .map_err(|e| AppError::BadRequest(format!("Invalid UUID: {}", e)))?;
    let conn_model = db_repo
        .find_by_id(conn_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Database connection not found".to_string()))?;

    let user_id = uuid::Uuid::parse_str(&claims.sub)
        .map_err(|e| AppError::BadRequest(format!("Invalid user UUID: {}", e)))?;
    let is_admin = claims.roles.iter().any(|role| role == "admin");
    if conn_model.created_by != user_id && !is_admin {
        return Err(AppError::Auth(
            "You do not have access to this database connection".to_string(),
        ));
    }

    if conn_model.connection_type.to_lowercase() != "mysql" {
        return Err(AppError::BadRequest(
            "MySQL telemetry is only supported for mysql connections".to_string(),
        ));
    }

    let dynamic_conn = connect_to_dynamic_database(&conn_model, config.get_ref()).await?;
    let telemetry = MySqlTelemetryCollector::collect(&dynamic_conn).await?;
    let telemetry_repo = MySqlTelemetrySnapshotRepository::new(db_pool.get_ref().clone());
    if let Err(error) = telemetry_repo
        .create_from_snapshot(conn_id, &telemetry)
        .await
    {
        tracing::warn!(
            connection_id = %conn_id,
            error = %error,
            "Failed to persist MySQL telemetry snapshot"
        );
    }

    Ok(HttpResponse::Ok().json(telemetry))
}

pub async fn get_mysql_telemetry_history(
    path: web::Path<String>,
    query: web::Query<MySqlTelemetryHistoryQuery>,
    db_pool: web::Data<Arc<DatabaseConnection>>,
    config: web::Data<Config>,
    claims: web::ReqData<Claims>,
) -> Result<impl Responder, AppError> {
    let db_repo = DatabaseRepository::new(db_pool.get_ref().clone(), config.get_ref().clone());
    let conn_id = uuid::Uuid::parse_str(&path.into_inner())
        .map_err(|e| AppError::BadRequest(format!("Invalid UUID: {}", e)))?;
    let conn_model = db_repo
        .find_by_id(conn_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Database connection not found".to_string()))?;

    let user_id = uuid::Uuid::parse_str(&claims.sub)
        .map_err(|e| AppError::BadRequest(format!("Invalid user UUID: {}", e)))?;
    let is_admin = claims.roles.iter().any(|role| role == "admin");
    if conn_model.created_by != user_id && !is_admin {
        return Err(AppError::Auth(
            "You do not have access to this database connection".to_string(),
        ));
    }

    if conn_model.connection_type.to_lowercase() != "mysql" {
        return Err(AppError::BadRequest(
            "MySQL telemetry history is only supported for mysql connections".to_string(),
        ));
    }

    let hours = query.hours.unwrap_or(24).clamp(1, 24 * 30);
    let limit = query.limit.unwrap_or(50).clamp(1, 500);
    let telemetry_repo = MySqlTelemetrySnapshotRepository::new(db_pool.get_ref().clone());
    let snapshots = telemetry_repo
        .find_recent_by_connection(conn_id, hours, limit)
        .await?;

    let points = snapshots
        .into_iter()
        .map(|snapshot| MySqlTelemetryHistoryPoint {
            id: snapshot.id,
            collected_at: snapshot.collected_at,
            qps_since_start: snapshot.qps_since_start,
            threads_connected: snapshot.threads_connected,
            threads_running: snapshot.threads_running,
            connection_usage_pct: snapshot.connection_usage_pct,
            buffer_pool_hit_ratio: snapshot.buffer_pool_hit_ratio,
            slow_queries: snapshot.slow_queries,
            findings_count: snapshot.findings_count,
            high_priority_findings_count: snapshot.high_priority_findings_count,
        })
        .collect::<Vec<_>>();
    let total = points.len();

    Ok(HttpResponse::Ok().json(MySqlTelemetryHistoryResponse {
        snapshots: points,
        total,
    }))
}

pub async fn get_mysql_telemetry_signals(
    path: web::Path<String>,
    query: web::Query<MySqlTelemetryHistoryQuery>,
    db_pool: web::Data<Arc<DatabaseConnection>>,
    config: web::Data<Config>,
    claims: web::ReqData<Claims>,
) -> Result<impl Responder, AppError> {
    let db_repo = DatabaseRepository::new(db_pool.get_ref().clone(), config.get_ref().clone());
    let conn_id = uuid::Uuid::parse_str(&path.into_inner())
        .map_err(|e| AppError::BadRequest(format!("Invalid UUID: {}", e)))?;
    let conn_model = db_repo
        .find_by_id(conn_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Database connection not found".to_string()))?;

    let user_id = uuid::Uuid::parse_str(&claims.sub)
        .map_err(|e| AppError::BadRequest(format!("Invalid user UUID: {}", e)))?;
    let is_admin = claims.roles.iter().any(|role| role == "admin");
    if conn_model.created_by != user_id && !is_admin {
        return Err(AppError::Auth(
            "You do not have access to this database connection".to_string(),
        ));
    }

    let connection_type = conn_model.connection_type.to_lowercase();
    if connection_type != "mysql" && connection_type != "aurora-mysql" {
        return Err(AppError::BadRequest(
            "MySQL telemetry signals are only supported for mysql connections".to_string(),
        ));
    }

    let hours = query.hours.unwrap_or(24).clamp(1, 24 * 30);
    let limit = query.limit.unwrap_or(100).clamp(2, 500);
    let telemetry_repo = MySqlTelemetrySnapshotRepository::new(db_pool.get_ref().clone());
    let snapshots = telemetry_repo
        .find_recent_by_connection(conn_id, hours, limit)
        .await?;

    let signal_snapshots = snapshots
        .iter()
        .map(|snapshot| MySqlSignalSnapshot {
            id: snapshot.id,
            collected_at: snapshot.collected_at,
            qps_since_start: snapshot.qps_since_start,
            threads_connected: snapshot.threads_connected,
            threads_running: snapshot.threads_running,
            connection_usage_pct: snapshot.connection_usage_pct,
            buffer_pool_hit_ratio: snapshot.buffer_pool_hit_ratio,
            slow_queries: snapshot.slow_queries,
            findings_count: snapshot.findings_count,
            high_priority_findings_count: snapshot.high_priority_findings_count,
        })
        .collect::<Vec<_>>();
    let signals = MySqlSignalEvaluator::evaluate(&signal_snapshots, &MySqlSignalRules::default());

    Ok(HttpResponse::Ok().json(MySqlTelemetrySignalsResponse {
        signals,
        sample_count: signal_snapshots.len(),
        period_hours: hours,
    }))
}

pub async fn list_connections(
    db_pool: web::Data<Arc<DatabaseConnection>>,
    config: web::Data<Config>,
    _claims: web::ReqData<Claims>,
) -> Result<impl Responder, AppError> {
    let db_repo = DatabaseRepository::new(db_pool.get_ref().clone(), config.get_ref().clone());
    let connections = db_repo.find_all().await?;

    Ok(HttpResponse::Ok().json(connections))
}

pub async fn get_connection(
    path: web::Path<String>,
    db_pool: web::Data<Arc<DatabaseConnection>>,
    config: web::Data<Config>,
    _claims: web::ReqData<Claims>,
) -> Result<impl Responder, AppError> {
    let db_repo = DatabaseRepository::new(db_pool.get_ref().clone(), config.get_ref().clone());

    let conn_id = uuid::Uuid::parse_str(&path.into_inner())
        .map_err(|e| AppError::BadRequest(format!("Invalid UUID: {}", e)))?;
    let connection = db_repo
        .find_by_id(conn_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Database connection not found".to_string()))?;

    Ok(HttpResponse::Ok().json(connection))
}

pub async fn create_connection(
    connection: web::Json<CreateDatabaseConnectionRequest>,
    db_pool: web::Data<Arc<DatabaseConnection>>,
    config: web::Data<Config>,
    claims: web::ReqData<Claims>,
) -> Result<impl Responder, AppError> {
    let db_repo = DatabaseRepository::new(db_pool.get_ref().clone(), config.get_ref().clone());

    // Create the database connection
    let user_id = uuid::Uuid::parse_str(&claims.sub)
        .map_err(|e| AppError::BadRequest(format!("Invalid UUID: {}", e)))?;
    let new_connection = db_repo.create(&connection, user_id).await?;

    Ok(HttpResponse::Created().json(new_connection))
}

pub async fn update_connection(
    path: web::Path<String>,
    connection: web::Json<CreateDatabaseConnectionRequest>,
    db_pool: web::Data<Arc<DatabaseConnection>>,
    config: web::Data<Config>,
    _claims: web::ReqData<Claims>,
) -> Result<impl Responder, AppError> {
    let db_repo = DatabaseRepository::new(db_pool.get_ref().clone(), config.get_ref().clone());

    // Update the database connection
    let conn_id = uuid::Uuid::parse_str(&path.into_inner())
        .map_err(|e| AppError::BadRequest(format!("Invalid UUID: {}", e)))?;
    let updated_connection = db_repo.update(conn_id, &connection).await?;

    Ok(HttpResponse::Ok().json(updated_connection))
}

pub async fn delete_connection(
    path: web::Path<String>,
    db_pool: web::Data<Arc<DatabaseConnection>>,
    config: web::Data<Config>,
    _claims: web::ReqData<Claims>,
) -> Result<impl Responder, AppError> {
    let db_repo = DatabaseRepository::new(db_pool.get_ref().clone(), config.get_ref().clone());

    // Delete the database connection
    let conn_id = uuid::Uuid::parse_str(&path.into_inner())
        .map_err(|e| AppError::BadRequest(format!("Invalid UUID: {}", e)))?;
    db_repo.delete(conn_id).await?;

    Ok(HttpResponse::NoContent().finish())
}

pub async fn test_connection(
    path: web::Path<String>,
    db_pool: web::Data<Arc<DatabaseConnection>>,
    config: web::Data<Config>,
    _claims: web::ReqData<Claims>,
) -> Result<impl Responder, AppError> {
    let db_service = DatabaseService::new(config.get_ref().clone());
    let db_repo = DatabaseRepository::new(db_pool.get_ref().clone(), config.get_ref().clone());

    // Get the database connection details
    let conn_id = uuid::Uuid::parse_str(&path.into_inner())
        .map_err(|e| AppError::BadRequest(format!("Invalid UUID: {}", e)))?;
    let conn = db_repo
        .find_by_id(conn_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Database connection not found".to_string()))?;

    // Test the connection
    let test_result = db_service.test_connection(&conn).await?;

    Ok(HttpResponse::Ok().json(test_result))
}

pub async fn get_schema(
    path: web::Path<String>,
    db_pool: web::Data<Arc<DatabaseConnection>>,
    config: web::Data<Config>,
    _claims: web::ReqData<Claims>,
) -> Result<impl Responder, AppError> {
    let db_service = DatabaseService::new(config.get_ref().clone());
    let db_repo = DatabaseRepository::new(db_pool.get_ref().clone(), config.get_ref().clone());

    // Get the database connection details
    let conn_id = uuid::Uuid::parse_str(&path.into_inner())
        .map_err(|e| AppError::BadRequest(format!("Invalid UUID: {}", e)))?;
    let conn = db_repo
        .find_by_id(conn_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Database connection not found".to_string()))?;

    // Get the database schema
    let schema = db_service.get_schema(&conn).await?;

    Ok(HttpResponse::Ok().json(schema))
}
