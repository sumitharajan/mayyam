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
use actix_web::{dev::Service as _, http::StatusCode, test, web, App, HttpMessage};
use mayyam::controllers::kubernetes::{
    get_deployment_inventory_pillar_reports_controller,
    get_node_inventory_pillar_reports_controller, get_pod_inventory_pillar_reports_controller,
    get_replicaset_inventory_pillar_reports_controller,
    get_statefulset_inventory_pillar_reports_controller,
};
use mayyam::middleware::auth::Claims;
use mayyam::services::kubernetes::deployments_service::DeploymentsService;
use mayyam::services::kubernetes::nodes_service::NodesService;
use mayyam::services::kubernetes::pod::PodService;
use mayyam::services::kubernetes::replica_sets_service::ReplicaSetsService;
use mayyam::services::kubernetes::stateful_sets_service::StatefulSetsService;
use sea_orm::DatabaseConnection;
use serde_json::Value;
use std::sync::Arc;

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
    let claims = Claims {
        sub: "test-user".to_string(),
        username: "test-user".to_string(),
        email: None,
        roles: vec!["admin".to_string()],
        exp: i64::MAX,
        iat: 0,
    };
    let db = Arc::new(DatabaseConnection::default());
    let nodes_service = Arc::new(NodesService::new());
    let app = test::init_service(
        App::new()
            .wrap_fn(move |req, srv| {
                req.extensions_mut().insert(claims.clone());
                srv.call(req)
            })
            .app_data(web::Data::new(db))
            .app_data(web::Data::new(nodes_service))
            .route(
                "/api/kubernetes/inventory/nodes/pillars",
                web::get().to(get_node_inventory_pillar_reports_controller),
            ),
    )
    .await;

    let request = test::TestRequest::get()
        .uri("/api/kubernetes/inventory/nodes/pillars")
        .to_request();
    let response = test::call_service(&app, request).await;
    assert_eq!(response.status(), StatusCode::OK);

    let body: Value = test::read_body_json(response).await;
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

    let request = test::TestRequest::get()
        .uri("/api/kubernetes/inventory/nodes/pillars?pillar=resilience")
        .to_request();
    let response = test::call_service(&app, request).await;
    assert_eq!(response.status(), StatusCode::OK);
    let body: Value = test::read_body_json(response).await;
    let reports = body["reports"].as_array().expect("reports array");
    assert_eq!(reports.len(), 1);
    assert_eq!(reports[0]["pillar"], "resilience");

    let request = test::TestRequest::get()
        .uri("/api/kubernetes/inventory/nodes/pillars?pillar=bogus")
        .to_request();
    let response = test::call_service(&app, request).await;
    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn kubernetes_pod_inventory_pillar_reports_contract() {
    let claims = Claims {
        sub: "test-user".to_string(),
        username: "test-user".to_string(),
        email: None,
        roles: vec!["admin".to_string()],
        exp: i64::MAX,
        iat: 0,
    };
    let db = Arc::new(DatabaseConnection::default());
    let pod_service = Arc::new(PodService::new());
    let app = test::init_service(
        App::new()
            .wrap_fn(move |req, srv| {
                req.extensions_mut().insert(claims.clone());
                srv.call(req)
            })
            .app_data(web::Data::new(db))
            .app_data(web::Data::new(pod_service))
            .route(
                "/api/kubernetes/inventory/pods/pillars",
                web::get().to(get_pod_inventory_pillar_reports_controller),
            ),
    )
    .await;

    let request = test::TestRequest::get()
        .uri("/api/kubernetes/inventory/pods/pillars")
        .to_request();
    let response = test::call_service(&app, request).await;
    assert_eq!(response.status(), StatusCode::OK);

    let body: Value = test::read_body_json(response).await;
    assert_eq!(body["resource_type"], "KubernetesPod");
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

    let request = test::TestRequest::get()
        .uri("/api/kubernetes/inventory/pods/pillars?pillar=security")
        .to_request();
    let response = test::call_service(&app, request).await;
    assert_eq!(response.status(), StatusCode::OK);
    let body: Value = test::read_body_json(response).await;
    let reports = body["reports"].as_array().expect("reports array");
    assert_eq!(reports.len(), 1);
    assert_eq!(reports[0]["pillar"], "security");

    let request = test::TestRequest::get()
        .uri("/api/kubernetes/inventory/pods/pillars?pillar=bogus")
        .to_request();
    let response = test::call_service(&app, request).await;
    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn kubernetes_deployment_inventory_pillar_reports_contract() {
    let claims = Claims {
        sub: "test-user".to_string(),
        username: "test-user".to_string(),
        email: None,
        roles: vec!["admin".to_string()],
        exp: i64::MAX,
        iat: 0,
    };
    let db = Arc::new(DatabaseConnection::default());
    let deployments_service = Arc::new(DeploymentsService::new());
    let app = test::init_service(
        App::new()
            .wrap_fn(move |req, srv| {
                req.extensions_mut().insert(claims.clone());
                srv.call(req)
            })
            .app_data(web::Data::new(db))
            .app_data(web::Data::new(deployments_service))
            .route(
                "/api/kubernetes/inventory/deployments/pillars",
                web::get().to(get_deployment_inventory_pillar_reports_controller),
            ),
    )
    .await;

    let request = test::TestRequest::get()
        .uri("/api/kubernetes/inventory/deployments/pillars")
        .to_request();
    let response = test::call_service(&app, request).await;
    assert_eq!(response.status(), StatusCode::OK);

    let body: Value = test::read_body_json(response).await;
    assert_eq!(body["resource_type"], "KubernetesDeployment");
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

    let request = test::TestRequest::get()
        .uri("/api/kubernetes/inventory/deployments/pillars?pillar=resilience")
        .to_request();
    let response = test::call_service(&app, request).await;
    assert_eq!(response.status(), StatusCode::OK);
    let body: Value = test::read_body_json(response).await;
    let reports = body["reports"].as_array().expect("reports array");
    assert_eq!(reports.len(), 1);
    assert_eq!(reports[0]["pillar"], "resilience");

    let request = test::TestRequest::get()
        .uri("/api/kubernetes/inventory/deployments/pillars?pillar=bogus")
        .to_request();
    let response = test::call_service(&app, request).await;
    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn kubernetes_replicaset_inventory_pillar_reports_contract() {
    let claims = Claims {
        sub: "test-user".to_string(),
        username: "test-user".to_string(),
        email: None,
        roles: vec!["admin".to_string()],
        exp: i64::MAX,
        iat: 0,
    };
    let db = Arc::new(DatabaseConnection::default());
    let replica_sets_service = Arc::new(ReplicaSetsService);
    let app = test::init_service(
        App::new()
            .wrap_fn(move |req, srv| {
                req.extensions_mut().insert(claims.clone());
                srv.call(req)
            })
            .app_data(web::Data::new(db))
            .app_data(web::Data::new(replica_sets_service))
            .route(
                "/api/kubernetes/inventory/replicasets/pillars",
                web::get().to(get_replicaset_inventory_pillar_reports_controller),
            ),
    )
    .await;

    let request = test::TestRequest::get()
        .uri("/api/kubernetes/inventory/replicasets/pillars")
        .to_request();
    let response = test::call_service(&app, request).await;
    assert_eq!(response.status(), StatusCode::OK);

    let body: Value = test::read_body_json(response).await;
    assert_eq!(body["resource_type"], "KubernetesReplicaSet");
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

    let request = test::TestRequest::get()
        .uri("/api/kubernetes/inventory/replicasets/pillars?pillar=security")
        .to_request();
    let response = test::call_service(&app, request).await;
    assert_eq!(response.status(), StatusCode::OK);
    let body: Value = test::read_body_json(response).await;
    let reports = body["reports"].as_array().expect("reports array");
    assert_eq!(reports.len(), 1);
    assert_eq!(reports[0]["pillar"], "security");

    let request = test::TestRequest::get()
        .uri("/api/kubernetes/inventory/replicasets/pillars?pillar=bogus")
        .to_request();
    let response = test::call_service(&app, request).await;
    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn kubernetes_statefulset_inventory_pillar_reports_contract() {
    let claims = Claims {
        sub: "test-user".to_string(),
        username: "test-user".to_string(),
        email: None,
        roles: vec!["admin".to_string()],
        exp: i64::MAX,
        iat: 0,
    };
    let db = Arc::new(DatabaseConnection::default());
    let stateful_sets_service = Arc::new(StatefulSetsService::new());
    let app = test::init_service(
        App::new()
            .wrap_fn(move |req, srv| {
                req.extensions_mut().insert(claims.clone());
                srv.call(req)
            })
            .app_data(web::Data::new(db))
            .app_data(web::Data::new(stateful_sets_service))
            .route(
                "/api/kubernetes/inventory/statefulsets/pillars",
                web::get().to(get_statefulset_inventory_pillar_reports_controller),
            ),
    )
    .await;

    let request = test::TestRequest::get()
        .uri("/api/kubernetes/inventory/statefulsets/pillars")
        .to_request();
    let response = test::call_service(&app, request).await;
    assert_eq!(response.status(), StatusCode::OK);

    let body: Value = test::read_body_json(response).await;
    assert_eq!(body["resource_type"], "KubernetesStatefulSet");
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

    let request = test::TestRequest::get()
        .uri("/api/kubernetes/inventory/statefulsets/pillars?pillar=resilience")
        .to_request();
    let response = test::call_service(&app, request).await;
    assert_eq!(response.status(), StatusCode::OK);
    let body: Value = test::read_body_json(response).await;
    let reports = body["reports"].as_array().expect("reports array");
    assert_eq!(reports.len(), 1);
    assert_eq!(reports[0]["pillar"], "resilience");

    let request = test::TestRequest::get()
        .uri("/api/kubernetes/inventory/statefulsets/pillars?pillar=bogus")
        .to_request();
    let response = test::call_service(&app, request).await;
    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
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
