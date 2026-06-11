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

use crate::integration::helpers::TestHarness;
use serde_json::Value;

#[tokio::test]
async fn kubernetes_cluster_inventory_pillar_reports_contract() {
    if let Some(harness) = TestHarness::try_new().await {
        let response = harness
            .client()
            .get(&harness.build_url("/api/kubernetes/inventory/clusters/pillars"))
            .header("Authorization", format!("Bearer {}", harness.auth_token()))
            .send()
            .await
            .expect("pillar report request failed");

        assert_eq!(response.status().as_u16(), 200);
        let body: Value = response.json().await.expect("invalid JSON body");
        assert_eq!(body["resource_type"], "KubernetesCluster");
        assert!(body["evaluated_at"].is_string());
        assert!(body["stale_after_hours"].is_number());
        assert!(body["resources_evaluated"].is_number());
        let reports = body["reports"].as_array().expect("reports array");
        assert_eq!(reports.len(), 3);
        for report in reports {
            assert!(report["pillar"].is_string());
            assert!(report["score"].is_number());
            assert!(report["findings"].is_array());
        }

        let response = harness
            .client()
            .get(&harness.build_url("/api/kubernetes/inventory/clusters/pillars?pillar=cost"))
            .header("Authorization", format!("Bearer {}", harness.auth_token()))
            .send()
            .await
            .expect("single pillar report request failed");
        assert_eq!(response.status().as_u16(), 200);
        let body: Value = response.json().await.expect("invalid JSON body");
        let reports = body["reports"].as_array().expect("reports array");
        assert_eq!(reports.len(), 1);
        assert_eq!(reports[0]["pillar"], "cost");

        let response = harness
            .client()
            .get(&harness.build_url("/api/kubernetes/inventory/clusters/pillars?pillar=bogus"))
            .header("Authorization", format!("Bearer {}", harness.auth_token()))
            .send()
            .await
            .expect("bad pillar request failed");
        assert_eq!(response.status().as_u16(), 400);
    } else {
        eprintln!("Skipping Kubernetes pillar contract: backend not healthy (likely DB down).");
    }
}

#[tokio::test]
async fn kubernetes_namespace_inventory_pillar_reports_contract() {
    if let Some(harness) = TestHarness::try_new().await {
        let response = harness
            .client()
            .get(&harness.build_url("/api/kubernetes/inventory/namespaces/pillars"))
            .header("Authorization", format!("Bearer {}", harness.auth_token()))
            .send()
            .await
            .expect("namespace pillar report request failed");

        assert_eq!(response.status().as_u16(), 200);
        let body: Value = response.json().await.expect("invalid JSON body");
        assert_eq!(body["resource_type"], "KubernetesNamespace");
        assert!(body["evaluated_at"].is_string());
        assert!(body["stale_after_hours"].is_number());
        assert!(body["resources_evaluated"].is_number());
        let reports = body["reports"].as_array().expect("reports array");
        assert_eq!(reports.len(), 3);
        for report in reports {
            assert!(report["pillar"].is_string());
            assert!(report["score"].is_number());
            assert!(report["findings"].is_array());
        }

        let response = harness
            .client()
            .get(&harness.build_url("/api/kubernetes/inventory/namespaces/pillars?pillar=security"))
            .header("Authorization", format!("Bearer {}", harness.auth_token()))
            .send()
            .await
            .expect("single namespace pillar report request failed");
        assert_eq!(response.status().as_u16(), 200);
        let body: Value = response.json().await.expect("invalid JSON body");
        let reports = body["reports"].as_array().expect("reports array");
        assert_eq!(reports.len(), 1);
        assert_eq!(reports[0]["pillar"], "security");

        let response = harness
            .client()
            .get(&harness.build_url("/api/kubernetes/inventory/namespaces/pillars?pillar=bogus"))
            .header("Authorization", format!("Bearer {}", harness.auth_token()))
            .send()
            .await
            .expect("bad namespace pillar request failed");
        assert_eq!(response.status().as_u16(), 400);
    } else {
        eprintln!(
            "Skipping Kubernetes namespace pillar contract: backend not healthy (likely DB down)."
        );
    }
}

#[tokio::test]
async fn kubernetes_node_inventory_pillar_reports_contract() {
    if let Some(harness) = TestHarness::try_new().await {
        let response = harness
            .client()
            .get(&harness.build_url("/api/kubernetes/inventory/nodes/pillars"))
            .header("Authorization", format!("Bearer {}", harness.auth_token()))
            .send()
            .await
            .expect("node pillar report request failed");

        assert_eq!(response.status().as_u16(), 200);
        let body: Value = response.json().await.expect("invalid JSON body");
        assert_eq!(body["resource_type"], "KubernetesNode");
        assert!(body["evaluated_at"].is_string());
        assert!(body["stale_after_hours"].is_number());
        assert!(body["resources_evaluated"].is_number());
        let reports = body["reports"].as_array().expect("reports array");
        assert_eq!(reports.len(), 3);
        for report in reports {
            assert!(report["pillar"].is_string());
            assert!(report["score"].is_number());
            assert!(report["findings"].is_array());
        }

        let response = harness
            .client()
            .get(&harness.build_url("/api/kubernetes/inventory/nodes/pillars?pillar=resilience"))
            .header("Authorization", format!("Bearer {}", harness.auth_token()))
            .send()
            .await
            .expect("single node pillar report request failed");
        assert_eq!(response.status().as_u16(), 200);
        let body: Value = response.json().await.expect("invalid JSON body");
        let reports = body["reports"].as_array().expect("reports array");
        assert_eq!(reports.len(), 1);
        assert_eq!(reports[0]["pillar"], "resilience");

        let response = harness
            .client()
            .get(&harness.build_url("/api/kubernetes/inventory/nodes/pillars?pillar=bogus"))
            .header("Authorization", format!("Bearer {}", harness.auth_token()))
            .send()
            .await
            .expect("bad node pillar request failed");
        assert_eq!(response.status().as_u16(), 400);
    } else {
        eprintln!(
            "Skipping Kubernetes node pillar contract: backend not healthy (likely DB down)."
        );
    }
}

#[tokio::test]
async fn test_kubernetes_list_namespaces_empty_when_no_clusters() {
    if let Some(harness) = TestHarness::try_new().await {
        let response = harness
            .client()
            .get(&harness.build_url("/api/kubernetes/clusters/default/namespaces"))
            .header("Authorization", format!("Bearer {}", harness.auth_token()))
            .send()
            .await
            .expect("request failed");

        assert_eq!(response.status().as_u16(), 404);
    } else {
        eprintln!(
            "Skipping namespaces test: backend not healthy (likely DB down). Set up test DB or run with Docker."
        );
    }
}

#[tokio::test]
async fn test_kubernetes_health_route_exists() {
    if let Some(harness) = TestHarness::try_new().await {
        let resp = harness
            .client()
            .get(&harness.build_url("/health"))
            .send()
            .await
            .expect("health check failed");

        assert!(resp.status().is_success());
    } else {
        eprintln!("Skipping health test: backend not healthy (likely DB down). Set up test DB or run with Docker.");
    }
}
