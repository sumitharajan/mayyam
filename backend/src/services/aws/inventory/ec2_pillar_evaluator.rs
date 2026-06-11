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

// Deterministic EC2 inventory evaluators for the cost, security, and
// resilience pillars (roadmap rows 01-AWS-CLOUD-00001/00010/00037).
//
// Pure domain logic: takes already-collected `aws_resources` rows plus an
// explicit `now`, returns reason-coded findings with the raw evidence that
// triggered each finding. No AWS calls, no database access, no LLM.

use chrono::{DateTime, Utc};
use serde_json::json;

use crate::models::aws_resource::Model as AwsResourceModel;
use crate::services::aws::inventory::types::{
    check_stale, data_str, has_any_tag, score_pillar, InventoryFinding, Pillar, PillarReport,
    Severity, COST_ALLOCATION_TAG_KEYS, OWNER_TAG_KEYS,
};

// Reason codes are the stable contract for findings; never reuse or rename.
pub const REASON_COST_MISSING_ALLOCATION_TAGS: &str = "EC2_COST_MISSING_ALLOCATION_TAGS";
pub const REASON_COST_STOPPED_INSTANCE: &str = "EC2_COST_STOPPED_INSTANCE_ACCRUING_STORAGE";
pub const REASON_SEC_PUBLIC_IP: &str = "EC2_SEC_PUBLIC_IP_ASSIGNED";
pub const REASON_SEC_MISSING_OWNER_TAG: &str = "EC2_SEC_MISSING_OWNER_TAG";
pub const REASON_RES_MISSING_AZ: &str = "EC2_RES_MISSING_AVAILABILITY_ZONE";
pub const REASON_RES_SINGLE_AZ_CONCENTRATION: &str = "EC2_RES_SINGLE_AZ_CONCENTRATION";
pub const REASON_INV_STALE_DATA: &str = "EC2_INV_STALE_DATA";

/// Evaluate every EC2 instance in the fleet for one pillar.
pub fn evaluate_ec2_fleet(
    resources: &[AwsResourceModel],
    pillar: Pillar,
    now: DateTime<Utc>,
) -> PillarReport {
    let mut findings: Vec<InventoryFinding> = Vec::new();
    let mut stale_resources = 0usize;

    for resource in resources {
        if let Some(stale) = check_stale(resource, pillar, REASON_INV_STALE_DATA, now) {
            stale_resources += 1;
            findings.push(stale);
        }
        match pillar {
            Pillar::Cost => evaluate_cost(resource, &mut findings),
            Pillar::Security => evaluate_security(resource, &mut findings),
            Pillar::Resilience => evaluate_resilience(resource, &mut findings),
            // Pillars without checks for this service yet produce no findings.
            _ => {}
        }
    }

    if pillar == Pillar::Resilience {
        if let Some(finding) = check_az_concentration(resources) {
            findings.push(finding);
        }
    }

    let score = score_pillar(&findings);
    PillarReport {
        pillar,
        resources_evaluated: resources.len(),
        stale_resources,
        score,
        findings,
    }
}

fn evaluate_cost(resource: &AwsResourceModel, findings: &mut Vec<InventoryFinding>) {
    if !has_any_tag(&resource.tags, COST_ALLOCATION_TAG_KEYS) {
        findings.push(InventoryFinding {
            resource_id: resource.resource_id.clone(),
            arn: resource.arn.clone(),
            pillar: Pillar::Cost,
            reason_code: REASON_COST_MISSING_ALLOCATION_TAGS.to_string(),
            severity: Severity::Medium,
            message: format!(
                "Instance {} has no cost allocation tag (expected one of: {})",
                resource.resource_id,
                COST_ALLOCATION_TAG_KEYS.join(", ")
            ),
            evidence: json!({ "tags": resource.tags }),
        });
    }

    let state = data_str(&resource.resource_data, "state");
    if state.as_deref() == Some("stopped") {
        findings.push(InventoryFinding {
            resource_id: resource.resource_id.clone(),
            arn: resource.arn.clone(),
            pillar: Pillar::Cost,
            reason_code: REASON_COST_STOPPED_INSTANCE.to_string(),
            severity: Severity::Low,
            message: format!(
                "Instance {} is stopped but still accrues EBS and IP charges; review for termination or snapshot",
                resource.resource_id
            ),
            evidence: json!({ "state": state }),
        });
    }
}

fn evaluate_security(resource: &AwsResourceModel, findings: &mut Vec<InventoryFinding>) {
    if let Some(public_ip) = data_str(&resource.resource_data, "public_ip") {
        if !public_ip.is_empty() {
            findings.push(InventoryFinding {
                resource_id: resource.resource_id.clone(),
                arn: resource.arn.clone(),
                pillar: Pillar::Security,
                reason_code: REASON_SEC_PUBLIC_IP.to_string(),
                severity: Severity::High,
                message: format!(
                    "Instance {} has a public IP address assigned; verify it is intentionally internet-facing",
                    resource.resource_id
                ),
                evidence: json!({ "public_ip": public_ip }),
            });
        }
    }

    if !has_any_tag(&resource.tags, OWNER_TAG_KEYS) {
        findings.push(InventoryFinding {
            resource_id: resource.resource_id.clone(),
            arn: resource.arn.clone(),
            pillar: Pillar::Security,
            reason_code: REASON_SEC_MISSING_OWNER_TAG.to_string(),
            severity: Severity::Low,
            message: format!(
                "Instance {} has no owner/team tag; security findings cannot be routed to an owner",
                resource.resource_id
            ),
            evidence: json!({ "tags": resource.tags }),
        });
    }
}

fn evaluate_resilience(resource: &AwsResourceModel, findings: &mut Vec<InventoryFinding>) {
    if data_str(&resource.resource_data, "availability_zone")
        .map(|az| az.is_empty())
        .unwrap_or(true)
    {
        findings.push(InventoryFinding {
            resource_id: resource.resource_id.clone(),
            arn: resource.arn.clone(),
            pillar: Pillar::Resilience,
            reason_code: REASON_RES_MISSING_AZ.to_string(),
            severity: Severity::Medium,
            message: format!(
                "Instance {} has no availability zone recorded; placement resilience cannot be assessed",
                resource.resource_id
            ),
            evidence: json!({ "resource_data": resource.resource_data }),
        });
    }
}

/// Fleet-level check: two or more running instances all placed in one AZ.
fn check_az_concentration(resources: &[AwsResourceModel]) -> Option<InventoryFinding> {
    let placements: Vec<(&AwsResourceModel, String)> = resources
        .iter()
        .filter(|r| data_str(&r.resource_data, "state").as_deref() == Some("running"))
        .filter_map(|r| {
            data_str(&r.resource_data, "availability_zone")
                .filter(|az| !az.is_empty())
                .map(|az| (r, az))
        })
        .collect();

    if placements.len() < 2 {
        return None;
    }
    let first_az = placements[0].1.clone();
    if !placements.iter().all(|(_, az)| *az == first_az) {
        return None;
    }
    let instance_ids: Vec<&str> = placements
        .iter()
        .map(|(r, _)| r.resource_id.as_str())
        .collect();
    Some(InventoryFinding {
        resource_id: "fleet".to_string(),
        arn: String::new(),
        pillar: Pillar::Resilience,
        reason_code: REASON_RES_SINGLE_AZ_CONCENTRATION.to_string(),
        severity: Severity::Medium,
        message: format!(
            "All {} running instances are placed in availability zone {}; an AZ outage takes down the whole fleet",
            instance_ids.len(),
            first_az
        ),
        evidence: json!({
            "availability_zone": first_az,
            "instance_ids": instance_ids,
        }),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::services::aws::inventory::types::DEFAULT_STALE_AFTER_HOURS;
    use chrono::Duration;
    use serde_json::Value;
    use uuid::Uuid;

    fn fixture(
        resource_id: &str,
        tags: Value,
        resource_data: Value,
        refreshed_hours_ago: i64,
        now: DateTime<Utc>,
    ) -> AwsResourceModel {
        let refreshed = now - Duration::hours(refreshed_hours_ago);
        AwsResourceModel {
            id: Uuid::new_v4(),
            sync_id: None,
            account_id: "123456789012".to_string(),
            profile: None,
            region: "us-east-1".to_string(),
            resource_type: "EC2Instance".to_string(),
            resource_id: resource_id.to_string(),
            arn: format!("arn:aws:ec2:us-east-1:123456789012:instance/{}", resource_id),
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

    fn reason_codes(report: &PillarReport) -> Vec<&str> {
        report.findings.iter().map(|f| f.reason_code.as_str()).collect()
    }

    #[test]
    fn cost_flags_missing_allocation_tags_and_stopped_instance() {
        let r = fixture(
            "i-untagged",
            json!({}),
            json!({"state": "stopped", "availability_zone": "us-east-1a"}),
            1,
            now(),
        );
        let report = evaluate_ec2_fleet(&[r], Pillar::Cost, now());
        let codes = reason_codes(&report);
        assert!(codes.contains(&REASON_COST_MISSING_ALLOCATION_TAGS));
        assert!(codes.contains(&REASON_COST_STOPPED_INSTANCE));
        // Evidence preserved: raw tags object for the tag finding.
        let tag_finding = report
            .findings
            .iter()
            .find(|f| f.reason_code == REASON_COST_MISSING_ALLOCATION_TAGS)
            .unwrap();
        assert_eq!(tag_finding.evidence["tags"], json!({}));
        assert!(report.score < 100);
    }

    #[test]
    fn cost_passes_for_tagged_running_instance() {
        let r = fixture(
            "i-good",
            json!({"Team": "payments", "cost-center": "cc-42"}),
            json!({"state": "running", "availability_zone": "us-east-1a"}),
            1,
            now(),
        );
        let report = evaluate_ec2_fleet(&[r], Pillar::Cost, now());
        assert!(report.findings.is_empty(), "unexpected: {:?}", report.findings);
        assert_eq!(report.score, 100);
        assert_eq!(report.resources_evaluated, 1);
        assert_eq!(report.stale_resources, 0);
    }

    #[test]
    fn security_flags_public_ip_as_high_and_missing_owner_as_low() {
        let r = fixture(
            "i-exposed",
            json!({}),
            json!({"state": "running", "public_ip": "54.0.0.1", "availability_zone": "us-east-1a"}),
            1,
            now(),
        );
        let report = evaluate_ec2_fleet(&[r], Pillar::Security, now());
        let public = report
            .findings
            .iter()
            .find(|f| f.reason_code == REASON_SEC_PUBLIC_IP)
            .expect("public ip finding");
        assert_eq!(public.severity, Severity::High);
        assert_eq!(public.evidence["public_ip"], json!("54.0.0.1"));
        let owner = report
            .findings
            .iter()
            .find(|f| f.reason_code == REASON_SEC_MISSING_OWNER_TAG)
            .expect("owner tag finding");
        assert_eq!(owner.severity, Severity::Low);
    }

    #[test]
    fn security_passes_for_private_owned_instance() {
        let r = fixture(
            "i-private",
            json!([{"Key": "Owner", "Value": "sre"}]),
            json!({"state": "running", "private_ip": "10.0.0.5", "availability_zone": "us-east-1a"}),
            1,
            now(),
        );
        let report = evaluate_ec2_fleet(&[r], Pillar::Security, now());
        assert!(report.findings.is_empty(), "unexpected: {:?}", report.findings);
    }

    #[test]
    fn resilience_flags_missing_availability_zone() {
        let r = fixture(
            "i-noaz",
            json!({"owner": "sre"}),
            json!({"state": "running"}),
            1,
            now(),
        );
        let report = evaluate_ec2_fleet(&[r], Pillar::Resilience, now());
        assert_eq!(reason_codes(&report), vec![REASON_RES_MISSING_AZ]);
    }

    #[test]
    fn resilience_flags_single_az_concentration_for_running_fleet() {
        let a = fixture(
            "i-a",
            json!({"owner": "sre"}),
            json!({"state": "running", "availability_zone": "us-east-1a"}),
            1,
            now(),
        );
        let b = fixture(
            "i-b",
            json!({"owner": "sre"}),
            json!({"state": "running", "availability_zone": "us-east-1a"}),
            1,
            now(),
        );
        let report = evaluate_ec2_fleet(&[a, b], Pillar::Resilience, now());
        let fleet = report
            .findings
            .iter()
            .find(|f| f.reason_code == REASON_RES_SINGLE_AZ_CONCENTRATION)
            .expect("fleet concentration finding");
        assert_eq!(fleet.evidence["availability_zone"], json!("us-east-1a"));
        assert_eq!(fleet.evidence["instance_ids"], json!(["i-a", "i-b"]));
    }

    #[test]
    fn resilience_accepts_multi_az_fleet() {
        let a = fixture(
            "i-a",
            json!({"owner": "sre"}),
            json!({"state": "running", "availability_zone": "us-east-1a"}),
            1,
            now(),
        );
        let b = fixture(
            "i-b",
            json!({"owner": "sre"}),
            json!({"state": "running", "availability_zone": "us-east-1b"}),
            1,
            now(),
        );
        let report = evaluate_ec2_fleet(&[a, b], Pillar::Resilience, now());
        assert!(report.findings.is_empty(), "unexpected: {:?}", report.findings);
        assert_eq!(report.score, 100);
    }

    #[test]
    fn stale_inventory_is_reported_as_failure_path_for_every_pillar() {
        let r = fixture(
            "i-stale",
            json!({"owner": "sre", "project": "mayyam"}),
            json!({"state": "running", "availability_zone": "us-east-1a", "private_ip": "10.0.0.9"}),
            48,
            now(),
        );
        for pillar in [Pillar::Cost, Pillar::Security, Pillar::Resilience] {
            let report = evaluate_ec2_fleet(std::slice::from_ref(&r), pillar, now());
            assert_eq!(report.stale_resources, 1, "pillar {:?}", pillar);
            let stale = report
                .findings
                .iter()
                .find(|f| f.reason_code == REASON_INV_STALE_DATA)
                .unwrap_or_else(|| panic!("stale finding missing for {:?}", pillar));
            assert_eq!(stale.evidence["age_hours"], json!(48));
            assert_eq!(stale.evidence["stale_after_hours"], json!(DEFAULT_STALE_AFTER_HOURS));
        }
    }
}
