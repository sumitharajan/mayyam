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

import React, { useCallback, useEffect, useState } from "react";
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow
} from "@coreui/react";
import api from "../../services/api";

const severityColor = (severity) => {
  switch (severity) {
    case "Critical":
      return "danger";
    case "High":
      return "danger";
    case "Medium":
      return "warning";
    case "Low":
      return "info";
    default:
      return "secondary";
  }
};

const formatNumber = (value) => {
  if (value === null || value === undefined) return "N/A";
  return Number(value).toLocaleString();
};

const formatPercent = (value, scale = 1) => {
  if (value === null || value === undefined) return "N/A";
  return `${(Number(value) * scale).toFixed(1)}%`;
};

const formatMs = (value) => {
  if (value === null || value === undefined) return "N/A";
  return `${Number(value).toFixed(0)} ms`;
};

const formatTime = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const truncate = (value, max = 140) => {
  if (!value) return "";
  return value.length > max ? `${value.slice(0, max)}...` : value;
};

const MySqlTelemetry = ({ connection }) => {
  const [telemetry, setTelemetry] = useState(null);
  const [history, setHistory] = useState([]);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTelemetry = useCallback(async () => {
    if (!connection?.id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/databases/${connection.id}/mysql/telemetry`);
      setTelemetry(response.data);

      try {
        const historyResponse = await api.get(
          `/api/databases/${connection.id}/mysql/telemetry/history?hours=24&limit=12`
        );
        setHistory(historyResponse.data?.snapshots || []);
      } catch (historyErr) {
        console.warn("Failed to load MySQL telemetry history", historyErr);
      }

      try {
        const signalsResponse = await api.get(
          `/api/databases/${connection.id}/mysql/telemetry/signals?hours=24&limit=100`
        );
        setSignals(signalsResponse.data?.signals || []);
      } catch (signalsErr) {
        console.warn("Failed to load MySQL telemetry signals", signalsErr);
      }
    } catch (err) {
      setError("Failed to load MySQL telemetry: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [connection?.id]);

  useEffect(() => {
    if (connection?.id) {
      fetchTelemetry();
    }
  }, [connection?.id, fetchTelemetry]);

  if (!connection) {
    return <CAlert color="info">Select a MySQL connection to view telemetry.</CAlert>;
  }

  const findings = telemetry?.findings || [];
  const highPriorityCount = findings.filter((finding) =>
    ["Critical", "High"].includes(finding.severity)
  ).length;

  return (
    <div className="mysql-telemetry">
      <CRow className="mb-4">
        <CCol>
          <CCard>
            <CCardHeader>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>MySQL Telemetry</strong>
                  {telemetry?.collected_at && (
                    <span className="text-muted small ms-2">
                      {new Date(telemetry.collected_at).toLocaleString()}
                    </span>
                  )}
                </div>
                <CButton size="sm" color="primary" variant="outline" onClick={fetchTelemetry} disabled={loading}>
                  {loading ? <CSpinner size="sm" /> : "Refresh"}
                </CButton>
              </div>
            </CCardHeader>
            <CCardBody>
              {error && <CAlert color="danger">{error}</CAlert>}
              {!telemetry && loading && (
                <div className="text-center p-5">
                  <CSpinner color="primary" />
                </div>
              )}
              {telemetry && (
                <CRow>
                  <CCol md={3}>
                    <div className="border rounded p-3 h-100">
                      <div className="text-muted small">Findings</div>
                      <div className="fs-3 fw-semibold">{findings.length}</div>
                      <CBadge color={highPriorityCount > 0 ? "danger" : "success"}>
                        {highPriorityCount} high priority
                      </CBadge>
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="border rounded p-3 h-100">
                      <div className="text-muted small">Connections</div>
                      <div className="fs-3 fw-semibold">
                        {formatNumber(telemetry.connections?.threads_connected)}
                      </div>
                      <div className="small text-muted">
                        {formatPercent(telemetry.connections?.connection_usage_pct)} of max
                      </div>
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="border rounded p-3 h-100">
                      <div className="text-muted small">Buffer Pool Hit</div>
                      <div className="fs-3 fw-semibold">
                        {formatPercent(telemetry.innodb?.buffer_pool_hit_ratio, 100)}
                      </div>
                      <div className="small text-muted">
                        Dirty {formatPercent(telemetry.innodb?.buffer_pool_dirty_pct)}
                      </div>
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="border rounded p-3 h-100">
                      <div className="text-muted small">QPS Since Start</div>
                      <div className="fs-3 fw-semibold">
                        {(telemetry.workload?.qps_since_start || 0).toFixed(2)}
                      </div>
                      <div className="small text-muted">
                        Slow {formatNumber(telemetry.workload?.slow_queries)}
                      </div>
                    </div>
                  </CCol>
                </CRow>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {telemetry && (
        <>
          <CRow className="mb-4">
            <CCol>
              <CCard>
                <CCardHeader>
                  <strong>Evidence-backed Findings</strong>
                </CCardHeader>
                <CCardBody>
                  {findings.length === 0 ? (
                    <CAlert color="success" className="mb-0">
                      No high-confidence findings detected in the current snapshot.
                    </CAlert>
                  ) : (
                    <div className="d-grid gap-3">
                      {findings.map((finding, index) => (
                        <div key={`${finding.title}-${index}`} className="border rounded p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <CBadge color={severityColor(finding.severity)} className="me-2">
                                {finding.severity}
                              </CBadge>
                              <CBadge color="light" textColor="dark" className="me-2">
                                {finding.category}
                              </CBadge>
                              <strong>{finding.title}</strong>
                            </div>
                          </div>
                          <div className="small mb-2">
                            <strong>Impact:</strong> {finding.impact}
                          </div>
                          <div className="small mb-2">
                            <strong>Recommendation:</strong> {finding.recommendation}
                          </div>
                          <div className="small text-muted">
                            <strong>Evidence:</strong> {finding.evidence?.join(" | ")}
                          </div>
                          {finding.validation_query && (
                            <pre className="small bg-light border rounded p-2 mt-2 mb-0">
                              {finding.validation_query}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>

          <CRow className="mb-4">
            <CCol>
              <CCard>
                <CCardHeader>
                  <strong>Performance Signals</strong>
                  <span className="text-muted small ms-2">evidence-backed trends</span>
                </CCardHeader>
                <CCardBody>
                  {signals.length === 0 ? (
                    <CAlert color="success" className="mb-0">
                      No active trend signals detected in the recent telemetry window.
                    </CAlert>
                  ) : (
                    <div className="d-grid gap-3">
                      {signals.map((signal, index) => (
                        <div key={`${signal.title}-${index}`} className="border rounded p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <CBadge color={severityColor(signal.severity)} className="me-2">
                                {signal.severity}
                              </CBadge>
                              <CBadge color="light" textColor="dark" className="me-2">
                                {signal.category}
                              </CBadge>
                              <strong>{signal.title}</strong>
                            </div>
                          </div>
                          <div className="small mb-2">{signal.summary}</div>
                          <div className="small mb-2">
                            <strong>Recommendation:</strong> {signal.recommendation}
                          </div>
                          {signal.evidence?.length > 0 && (
                            <div className="small text-muted">
                              <strong>Evidence:</strong> {signal.evidence.join(" | ")}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>

          {history.length > 0 && (
            <CRow className="mb-4">
              <CCol>
                <CCard>
                  <CCardHeader>
                    <strong>Recent Snapshots</strong>
                    <span className="text-muted small ms-2">last 24 hours</span>
                  </CCardHeader>
                  <CCardBody>
                    <CTable responsive hover small>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Collected</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Findings</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">High</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Threads</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Running</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">QPS</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Buffer Hit</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {history.map((snapshot) => (
                          <CTableRow key={snapshot.id}>
                            <CTableDataCell>{formatTime(snapshot.collected_at)}</CTableDataCell>
                            <CTableDataCell className="text-end">{formatNumber(snapshot.findings_count)}</CTableDataCell>
                            <CTableDataCell className="text-end">
                              <CBadge color={snapshot.high_priority_findings_count > 0 ? "danger" : "success"}>
                                {formatNumber(snapshot.high_priority_findings_count)}
                              </CBadge>
                            </CTableDataCell>
                            <CTableDataCell className="text-end">
                              {formatNumber(snapshot.threads_connected)}
                            </CTableDataCell>
                            <CTableDataCell className="text-end">
                              {formatNumber(snapshot.threads_running)}
                            </CTableDataCell>
                            <CTableDataCell className="text-end">
                              {Number(snapshot.qps_since_start || 0).toFixed(2)}
                            </CTableDataCell>
                            <CTableDataCell className="text-end">
                              {formatPercent(snapshot.buffer_pool_hit_ratio, 100)}
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          )}

          <CRow className="mb-4">
            <CCol lg={8}>
              <CCard>
                <CCardHeader>
                  <strong>Top Statement Digests</strong>
                </CCardHeader>
                <CCardBody>
                  <CTable responsive hover small>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Query</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Execs</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Avg</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Rows Waste</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {(telemetry.statements || []).slice(0, 10).map((statement, index) => (
                        <CTableRow key={statement.digest || index}>
                          <CTableDataCell>{truncate(statement.digest_text)}</CTableDataCell>
                          <CTableDataCell className="text-end">{formatNumber(statement.execution_count)}</CTableDataCell>
                          <CTableDataCell className="text-end">{formatMs(statement.total_time_ms)}</CTableDataCell>
                          <CTableDataCell className="text-end">{formatMs(statement.avg_time_ms)}</CTableDataCell>
                          <CTableDataCell className="text-end">
                            {statement.rows_examined_per_row_sent
                              ? statement.rows_examined_per_row_sent.toFixed(1)
                              : "N/A"}
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol lg={4}>
              <CCard>
                <CCardHeader>
                  <strong>Wait Events</strong>
                </CCardHeader>
                <CCardBody>
                  <CTable responsive hover small>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Event</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {(telemetry.waits || []).slice(0, 8).map((wait, index) => (
                        <CTableRow key={`${wait.event_name}-${index}`}>
                          <CTableDataCell>{truncate(wait.event_name, 48)}</CTableDataCell>
                          <CTableDataCell className="text-end">{formatMs(wait.total_wait_ms)}</CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>

          <CRow>
            <CCol lg={6}>
              <CCard>
                <CCardHeader>
                  <strong>Potentially Unused Indexes</strong>
                </CCardHeader>
                <CCardBody>
                  <CTable responsive hover small>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Index</CTableHeaderCell>
                        <CTableHeaderCell>Columns</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Reads</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {(telemetry.indexes || [])
                        .filter((index) => !index.is_primary && !index.is_unique && index.read_count === 0)
                        .slice(0, 8)
                        .map((index) => (
                          <CTableRow key={`${index.table_name}-${index.index_name}`}>
                            <CTableDataCell>{index.table_name}.{index.index_name}</CTableDataCell>
                            <CTableDataCell>{index.columns?.join(", ")}</CTableDataCell>
                            <CTableDataCell className="text-end">{formatNumber(index.read_count)}</CTableDataCell>
                          </CTableRow>
                        ))}
                    </CTableBody>
                  </CTable>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol lg={6}>
              <CCard>
                <CCardHeader>
                  <strong>Largest Tables</strong>
                </CCardHeader>
                <CCardBody>
                  <CTable responsive hover small>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Table</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Rows</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Size</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Free</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {(telemetry.tables || []).slice(0, 8).map((table) => (
                        <CTableRow key={`${table.schema_name}-${table.table_name}`}>
                          <CTableDataCell>{table.table_name}</CTableDataCell>
                          <CTableDataCell className="text-end">{formatNumber(table.table_rows)}</CTableDataCell>
                          <CTableDataCell className="text-end">
                            {formatNumber(table.data_length + table.index_length)}
                          </CTableDataCell>
                          <CTableDataCell className="text-end">{formatNumber(table.data_free)}</CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </>
      )}
    </div>
  );
};

export default MySqlTelemetry;
