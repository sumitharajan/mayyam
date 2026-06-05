-- Persist direct MySQL telemetry collector snapshots for database connections.

CREATE TABLE IF NOT EXISTS mysql_telemetry_snapshots (
    id UUID PRIMARY KEY,
    connection_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
    collected_at TIMESTAMP WITH TIME ZONE NOT NULL,
    qps_since_start DOUBLE PRECISION NOT NULL DEFAULT 0,
    threads_connected INTEGER NOT NULL DEFAULT 0,
    threads_running INTEGER NOT NULL DEFAULT 0,
    connection_usage_pct DOUBLE PRECISION,
    buffer_pool_hit_ratio DOUBLE PRECISION,
    slow_queries BIGINT NOT NULL DEFAULT 0,
    findings_count INTEGER NOT NULL DEFAULT 0,
    high_priority_findings_count INTEGER NOT NULL DEFAULT 0,
    snapshot JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mysql_telemetry_snapshots_connection_time
    ON mysql_telemetry_snapshots(connection_id, collected_at DESC);

CREATE INDEX IF NOT EXISTS idx_mysql_telemetry_snapshots_high_priority
    ON mysql_telemetry_snapshots(connection_id, high_priority_findings_count)
    WHERE high_priority_findings_count > 0;
