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

// Deterministic Step Functions inventory evaluators for the cost, security,
// and resilience pillars.
//
// Evaluates fields persisted by stepfunctions_control_plane: status,
// state_machine_type, role_arn, logging_level, logging_include_execution_data,
// logging_destination_count, tracing_enabled, plus the tags column. The
// enrichment fields come from DescribeStateMachine; when that per-machine call
// failed during sync, the data-gap reason codes report the missing evidence
// instead of guessing.

use chrono::{DateTime, Utc};
use serde_json::json;

use crate::models::aws_resource::Model as AwsResourceModel;
use crate::services::aws::inventory::types::{
    check_stale, data_str, score_pillar, InventoryFinding, Pillar, PillarReport, Severity,
};

/// Only rows of this resource type are evaluated.
pub const RESOURCE_TYPE: &str = "StepFunction";

// Reason codes are the stable contract for findings; never reuse or rename.
pub const REASON_COST_NO_TAGS: &str = "SFN_COST_NO_TAGS";
pub const REASON_COST_MACHINE_DELETING: &str = "SFN_COST_MACHINE_DELETING";
pub const REASON_COST_EXPRESS_FULL_EXECUTION_LOGGING: &str =
    "SFN_COST_EXPRESS_FULL_EXECUTION_LOGGING";
pub const REASON_SEC_LOGGING_OFF: &str = "SFN_SEC_LOGGING_OFF";
pub const REASON_SEC_TRACING_DISABLED: &str = "SFN_SEC_TRACING_DISABLED";
pub const REASON_SEC_NO_ROLE_ARN: &str = "SFN_SEC_NO_ROLE_ARN";
pub const REASON_RES_MACHINE_NOT_ACTIVE: &str = "SFN_RES_MACHINE_NOT_ACTIVE";
pub const REASON_RES_LOG_DESTINATIONS_MISSING: &str = "SFN_RES_LOG_DESTINATIONS_MISSING";
pub const REASON_DATA_GAP_LOGGING: &str = "SFN_DATA_GAP_LOGGING";
pub const REASON_DATA_GAP_TRACING: &str = "SFN_DATA_GAP_TRACING";
pub const REASON_DATA_GAP_STATUS: &str = "SFN_DATA_GAP_STATUS";
pub const REASON_INV_STALE_DATA: &str = "SFN_INV_STALE_DATA";

/// Evaluate every Step Functions state machine in the fleet for one pillar.
/// Rows whose `resource_type` is not `StepFunction` are skipped and not
/// counted.
pub fn evaluate_stepfunctions_fleet(
    resources: &[AwsResourceModel],
    pillar: Pillar,
    now: DateTime<Utc>,
) -> PillarReport {
    let mut findings: Vec<InventoryFinding> = Vec::new();
    let mut stale_resources = 0usize;
    let mut evaluated = 0usize;

    for resource in resources {
        if resource.resource_type != RESOURCE_TYPE {
            continue;
        }
        evaluated += 1;

        if let Some(stale) = check_stale(resource, pillar, REASON_INV_STALE_DATA, now) {
            stale_resources += 1;
            findings.push(stale);
        }
        match pillar {
            Pillar::Cost => evaluate_cost(resource, &mut findings),
            Pillar::Security => evaluate_security(resource, &mut findings),
            Pillar::Resilience => evaluate_resilience(resource, &mut findings),
        }
    }

    let score = score_pillar(&findings);
    PillarReport {
        pillar,
        resources_evaluated: evaluated,
        stale_resources,
        score,
        findings,
    }
}

fn machine_status(resource: &AwsResourceModel) -> Option<String> {
    data_str(&resource.resource_data, "status")
}

fn logging_level(resource: &AwsResourceModel) -> Option<String> {
    data_str(&resource.resource_data, "logging_level")
}

fn machine_type(resource: &AwsResourceModel) -> Option<String> {
    data_str(&resource.resource_data, "state_machine_type")
}

fn evaluate_cost(resource: &AwsResourceModel, findings: &mut Vec<InventoryFinding>) {
    let tags_empty = resource
        .tags
        .as_object()
        .map(|m| m.is_empty())
        .unwrap_or(true);
    if tags_empty {
        findings.push(InventoryFinding {
            resource_id: resource.resource_id.clone(),
            arn: resource.arn.clone(),
            pillar: Pillar::Cost,
            reason_code: REASON_COST_NO_TAGS.to_string(),
            severity: Severity::Medium,
            message: format!(
                "State machine {} has no tags recorded (untagged resource or tag collection gap); cost allocation cannot be assessed",
                resource.resource_id
            ),
            evidence: json!({ "tags": resource.tags }),
        });
    }

    let status = machine_status(resource);
    if status.as_deref() == Some("DELETING") {
        findings.push(InventoryFinding {
            resource_id: resource.resource_id.clone(),
            arn: resource.arn.clone(),
            pillar: Pillar::Cost,
            reason_code: REASON_COST_MACHINE_DELETING.to_string(),
            severity: Severity::Low,
            message: format!(
                "State machine {} is in DELETING status; confirm deletion completes and clean up its log groups and alarms so residual log storage stops billing",
                resource.resource_id
            ),
            evidence: json!({ "status": "DELETING" }),
        });
    }

    // EXPRESS workflows can run at very high volume; ALL-level logging with
    // execution data included multiplies CloudWatch Logs ingestion cost per
    // execution.
    let include_execution_data = resource
        .resource_data
        .get("logging_include_execution_data")
        .and_then(|v| v.as_bool());
    if machine_type(resource).as_deref() == Some("EXPRESS")
        && logging_level(resource).as_deref() == Some("ALL")
        && include_execution_data == Some(true)
    {
        findings.push(InventoryFinding {
            resource_id: resource.resource_id.clone(),
            arn: resource.arn.clone(),
            pillar: Pillar::Cost,
            reason_code: REASON_COST_EXPRESS_FULL_EXECUTION_LOGGING.to_string(),
            severity: Severity::Medium,
            message: format!(
                "EXPRESS state machine {} logs at ALL level with execution data included; CloudWatch Logs ingestion can exceed the workflow cost at high volume",
                resource.resource_id
            ),
            evidence: json!({
                "state_machine_type": "EXPRESS",
                "logging_level": "ALL",
                "logging_include_execution_data": true,
            }),
        });
    }
}

fn evaluate_security(resource: &AwsResourceModel, findings: &mut Vec<InventoryFinding>) {
    let role_arn = data_str(&resource.resource_data, "role_arn");
    if role_arn.as_deref().map(|r| r.is_empty()).unwrap_or(true) {
        findings.push(InventoryFinding {
            resource_id: resource.resource_id.clone(),
            arn: resource.arn.clone(),
            pillar: Pillar::Security,
            reason_code: REASON_SEC_NO_ROLE_ARN.to_string(),
            severity: Severity::Medium,
            message: format!(
                "State machine {} has no execution role ARN recorded (missing role or enrichment gap); permission scope cannot be assessed",
                resource.resource_id
            ),
            evidence: json!({ "role_arn": role_arn }),
        });
    }

    match logging_level(resource).as_deref() {
        Some("OFF") => {
            findings.push(InventoryFinding {
                resource_id: resource.resource_id.clone(),
                arn: resource.arn.clone(),
                pillar: Pillar::Security,
                reason_code: REASON_SEC_LOGGING_OFF.to_string(),
                severity: Severity::Medium,
                message: format!(
                    "State machine {} has execution logging turned OFF; there is no audit trail of executions in CloudWatch Logs",
                    resource.resource_id
                ),
                evidence: json!({ "logging_level": "OFF" }),
            });
        }
        Some(_) => {}
        None => {
            findings.push(InventoryFinding {
                resource_id: resource.resource_id.clone(),
                arn: resource.arn.clone(),
                pillar: Pillar::Security,
                reason_code: REASON_DATA_GAP_LOGGING.to_string(),
                severity: Severity::Low,
                message: format!(
                    "Logging configuration for state machine {} is not collected yet; the security pillar cannot be fully assessed",
                    resource.resource_id
                ),
                evidence: json!({ "logging_level_collected": false }),
            });
        }
    }

    let tracing_enabled = resource
        .resource_data
        .get("tracing_enabled")
        .and_then(|v| v.as_bool());
    match tracing_enabled {
        Some(false) => {
            findings.push(InventoryFinding {
                resource_id: resource.resource_id.clone(),
                arn: resource.arn.clone(),
                pillar: Pillar::Security,
                reason_code: REASON_SEC_TRACING_DISABLED.to_string(),
                severity: Severity::Low,
                message: format!(
                    "State machine {} has X-Ray tracing disabled; downstream call paths cannot be audited end to end",
                    resource.resource_id
                ),
                evidence: json!({ "tracing_enabled": false }),
            });
        }
        Some(true) => {}
        None => {
            findings.push(InventoryFinding {
                resource_id: resource.resource_id.clone(),
                arn: resource.arn.clone(),
                pillar: Pillar::Security,
                reason_code: REASON_DATA_GAP_TRACING.to_string(),
                severity: Severity::Low,
                message: format!(
                    "Tracing configuration for state machine {} is not collected yet; the security pillar cannot be fully assessed",
                    resource.resource_id
                ),
                evidence: json!({ "tracing_enabled_collected": false }),
            });
        }
    }
}

fn evaluate_resilience(resource: &AwsResourceModel, findings: &mut Vec<InventoryFinding>) {
    match machine_status(resource).as_deref() {
        Some("ACTIVE") => {}
        Some(other) => {
            findings.push(InventoryFinding {
                resource_id: resource.resource_id.clone(),
                arn: resource.arn.clone(),
                pillar: Pillar::Resilience,
                reason_code: REASON_RES_MACHINE_NOT_ACTIVE.to_string(),
                severity: Severity::High,
                message: format!(
                    "State machine {} is in status {}; new executions will fail until it is ACTIVE",
                    resource.resource_id, other
                ),
                evidence: json!({ "status": other }),
            });
        }
        None => {
            findings.push(InventoryFinding {
                resource_id: resource.resource_id.clone(),
                arn: resource.arn.clone(),
                pillar: Pillar::Resilience,
                reason_code: REASON_DATA_GAP_STATUS.to_string(),
                severity: Severity::Low,
                message: format!(
                    "Status for state machine {} is not collected yet; the resilience pillar cannot be fully assessed",
                    resource.resource_id
                ),
                evidence: json!({ "status_collected": false }),
            });
        }
    }

    // A logging level other than OFF with zero destinations means execution
    // history is silently dropped; incidents cannot be reconstructed.
    if let Some(level) = logging_level(resource) {
        if level != "OFF" {
            let destination_count = resource
                .resource_data
                .get("logging_destination_count")
                .and_then(|v| v.as_u64())
                .unwrap_or(0);
            if destination_count == 0 {
                findings.push(InventoryFinding {
                    resource_id: resource.resource_id.clone(),
                    arn: resource.arn.clone(),
                    pillar: Pillar::Resilience,
                    reason_code: REASON_RES_LOG_DESTINATIONS_MISSING.to_string(),
                    severity: Severity::Medium,
                    message: format!(
                        "State machine {} logs at level {} but has no log destinations; execution history is dropped and incidents cannot be reconstructed",
                        resource.resource_id, level
                    ),
                    evidence: json!({
                        "logging_level": level,
                        "logging_destination_count": destination_count,
                    }),
                });
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Duration;
    use serde_json::Value;
    use uuid::Uuid;

    fn fixture(
        resource_id: &str,
        tags: Value,
        resource_data: Value,
        now: DateTime<Utc>,
    ) -> AwsResourceModel {
        let refreshed = now - Duration::hours(1);
        AwsResourceModel {
            id: Uuid::new_v4(),
            sync_id: None,
            account_id: "123456789012".to_string(),
            profile: None,
            region: "us-east-1".to_string(),
            resource_type: RESOURCE_TYPE.to_string(),
            resource_id: resource_id.to_string(),
            arn: format!(
                "arn:aws:states:us-east-1:123456789012:stateMachine:{}",
                resource_id
            ),
            name: Some(resource_id.to_string()),
            tags,
            resource_data,
            created_at: refreshed,
            updated_at: refreshed,
            last_refreshed: refreshed,
        }
    }

    fn now() -> DateTime<Utc> {
        DateTime::parse_from_rfc3339("2026-06-10T00:00:00Z")
            .unwrap()
            .with_timezone(&Utc)
    }

    fn healthy_machine_data() -> Value {
        json!({
            "name": "order-flow",
            "arn": "arn:aws:states:us-east-1:123456789012:stateMachine:order-flow",
            "state_machine_type": "STANDARD",
            "status": "ACTIVE",
            "creation_date": "2026-01-01T00:00:00Z",
            "role_arn": "arn:aws:iam::123456789012:role/sfn-exec",
            "logging_level": "ERROR",
            "logging_include_execution_data": false,
            "logging_destination_count": 1,
            "tracing_enabled": true,
        })
    }

    fn codes(report: &PillarReport) -> Vec<&str> {
        report.findings.iter().map(|f| f.reason_code.as_str()).collect()
    }

    #[test]
    fn cost_flags_untagged_machine() {
        let r = fixture("sm-untagged", json!({}), healthy_machine_data(), now());
        let report = evaluate_stepfunctions_fleet(&[r], Pillar::Cost, now());
        assert_eq!(codes(&report), vec![REASON_COST_NO_TAGS]);
    }

    #[test]
    fn cost_flags_deleting_machine() {
        let mut data = healthy_machine_data();
        data["status"] = json!("DELETING");
        let r = fixture("sm-deleting", json!({"team": "sre"}), data, now());
        let report = evaluate_stepfunctions_fleet(&[r], Pillar::Cost, now());
        assert_eq!(codes(&report), vec![REASON_COST_MACHINE_DELETING]);
        assert!(matches!(report.findings[0].severity, Severity::Low));
    }

    #[test]
    fn cost_flags_express_all_logging_with_execution_data() {
        let mut data = healthy_machine_data();
        data["state_machine_type"] = json!("EXPRESS");
        data["logging_level"] = json!("ALL");
        data["logging_include_execution_data"] = json!(true);
        let r = fixture("sm-express", json!({"team": "sre"}), data, now());
        let report = evaluate_stepfunctions_fleet(&[r], Pillar::Cost, now());
        assert_eq!(
            codes(&report),
            vec![REASON_COST_EXPRESS_FULL_EXECUTION_LOGGING]
        );

        // A STANDARD machine with the same logging setup is not flagged.
        let mut standard = healthy_machine_data();
        standard["logging_level"] = json!("ALL");
        standard["logging_include_execution_data"] = json!(true);
        let r2 = fixture("sm-standard", json!({"team": "sre"}), standard, now());
        let report = evaluate_stepfunctions_fleet(&[r2], Pillar::Cost, now());
        assert!(report.findings.is_empty(), "unexpected: {:?}", report.findings);
    }

    #[test]
    fn security_flags_logging_level_off() {
        let mut data = healthy_machine_data();
        data["logging_level"] = json!("OFF");
        let r = fixture("sm-logoff", json!({"team": "sre"}), data, now());
        let report = evaluate_stepfunctions_fleet(&[r], Pillar::Security, now());
        assert_eq!(codes(&report), vec![REASON_SEC_LOGGING_OFF]);
    }

    #[test]
    fn security_flags_tracing_disabled() {
        let mut data = healthy_machine_data();
        data["tracing_enabled"] = json!(false);
        let r = fixture("sm-notrace", json!({"team": "sre"}), data, now());
        let report = evaluate_stepfunctions_fleet(&[r], Pillar::Security, now());
        assert_eq!(codes(&report), vec![REASON_SEC_TRACING_DISABLED]);
    }

    #[test]
    fn security_flags_missing_role_arn() {
        let mut data = healthy_machine_data();
        data.as_object_mut().unwrap().remove("role_arn");
        let r = fixture("sm-norole", json!({"team": "sre"}), data, now());
        let report = evaluate_stepfunctions_fleet(&[r], Pillar::Security, now());
        assert_eq!(codes(&report), vec![REASON_SEC_NO_ROLE_ARN]);

        let mut empty_role = healthy_machine_data();
        empty_role["role_arn"] = json!("");
        let r2 = fixture("sm-emptyrole", json!({"team": "sre"}), empty_role, now());
        let report = evaluate_stepfunctions_fleet(&[r2], Pillar::Security, now());
        assert_eq!(codes(&report), vec![REASON_SEC_NO_ROLE_ARN]);
    }

    #[test]
    fn security_reports_logging_data_gap() {
        let mut data = healthy_machine_data();
        {
            let obj = data.as_object_mut().unwrap();
            obj.remove("logging_level");
            obj.remove("logging_include_execution_data");
            obj.remove("logging_destination_count");
        }
        let r = fixture("sm-loggap", json!({"team": "sre"}), data, now());
        let report = evaluate_stepfunctions_fleet(&[r], Pillar::Security, now());
        assert_eq!(codes(&report), vec![REASON_DATA_GAP_LOGGING]);
    }

    #[test]
    fn security_reports_tracing_data_gap() {
        let mut data = healthy_machine_data();
        data.as_object_mut().unwrap().remove("tracing_enabled");
        let r = fixture("sm-tracegap", json!({"team": "sre"}), data, now());
        let report = evaluate_stepfunctions_fleet(&[r], Pillar::Security, now());
        assert_eq!(codes(&report), vec![REASON_DATA_GAP_TRACING]);
    }

    #[test]
    fn resilience_flags_non_active_machine_as_high() {
        let mut data = healthy_machine_data();
        data["status"] = json!("DELETING");
        let r = fixture("sm-deleting", json!({"team": "sre"}), data, now());
        let report = evaluate_stepfunctions_fleet(&[r], Pillar::Resilience, now());
        assert_eq!(codes(&report), vec![REASON_RES_MACHINE_NOT_ACTIVE]);
        assert!(matches!(report.findings[0].severity, Severity::High));
    }

    #[test]
    fn resilience_flags_missing_log_destinations_when_logging_enabled() {
        let mut data = healthy_machine_data();
        data["logging_level"] = json!("ALL");
        data["logging_destination_count"] = json!(0);
        let r = fixture("sm-nodest", json!({"team": "sre"}), data, now());
        let report = evaluate_stepfunctions_fleet(&[r], Pillar::Resilience, now());
        assert_eq!(codes(&report), vec![REASON_RES_LOG_DESTINATIONS_MISSING]);

        // Logging OFF with zero destinations is consistent, not a defect.
        let mut off = healthy_machine_data();
        off["logging_level"] = json!("OFF");
        off["logging_destination_count"] = json!(0);
        let r2 = fixture("sm-off", json!({"team": "sre"}), off, now());
        let report = evaluate_stepfunctions_fleet(&[r2], Pillar::Resilience, now());
        assert!(report.findings.is_empty(), "unexpected: {:?}", report.findings);
    }

    #[test]
    fn resilience_reports_status_data_gap() {
        let mut data = healthy_machine_data();
        data.as_object_mut().unwrap().remove("status");
        let r = fixture("sm-statusgap", json!({"team": "sre"}), data, now());
        let report = evaluate_stepfunctions_fleet(&[r], Pillar::Resilience, now());
        assert_eq!(codes(&report), vec![REASON_DATA_GAP_STATUS]);
    }

    #[test]
    fn stale_inventory_is_flagged() {
        let mut r = fixture(
            "sm-stale",
            json!({"team": "sre"}),
            healthy_machine_data(),
            now(),
        );
        r.last_refreshed = now() - Duration::hours(48);
        let report = evaluate_stepfunctions_fleet(&[r], Pillar::Resilience, now());
        assert_eq!(report.stale_resources, 1);
        assert!(codes(&report).contains(&REASON_INV_STALE_DATA));
    }

    #[test]
    fn non_stepfunction_resources_are_skipped_and_not_counted() {
        let mut r = fixture("queue-1", json!({}), json!({}), now());
        r.resource_type = "SqsQueue".to_string();
        let report = evaluate_stepfunctions_fleet(&[r], Pillar::Cost, now());
        assert_eq!(report.resources_evaluated, 0);
        assert!(report.findings.is_empty());
    }

    #[test]
    fn empty_fleet_scores_full() {
        for pillar in [Pillar::Cost, Pillar::Security, Pillar::Resilience] {
            let report = evaluate_stepfunctions_fleet(&[], pillar, now());
            assert_eq!(report.resources_evaluated, 0);
            assert_eq!(report.score, 100);
            assert!(report.findings.is_empty());
        }
    }

    #[test]
    fn healthy_machine_passes_all_pillars() {
        let r = fixture("sm-ok", json!({"team": "sre"}), healthy_machine_data(), now());
        for pillar in [Pillar::Cost, Pillar::Security, Pillar::Resilience] {
            let report = evaluate_stepfunctions_fleet(std::slice::from_ref(&r), pillar, now());
            assert!(
                report.findings.is_empty(),
                "unexpected for {:?}: {:?}",
                pillar,
                report.findings
            );
            assert_eq!(report.score, 100);
        }
    }
}
