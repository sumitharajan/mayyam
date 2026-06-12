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
use k8s_openapi::api::core::v1::{Event, Pod, PodSpec, PodStatus};
use kube::{
    api::{DeleteParams, ListParams, LogParams, ObjectMeta},
    Api, Client, ResourceExt,
};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use tracing::{debug, error, info};

use crate::services::kubernetes::client::ClientFactory;
use crate::services::kubernetes::event_inventory::EventInventoryItem;
use crate::services::kubernetes::pod_inventory::{PodContainerInventoryItem, PodInventoryItem};
use crate::{errors::AppError, models::cluster::KubernetesClusterConfig};
use kube::api::AttachParams;
use tokio::io::AsyncReadExt;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PodDetail {
    pub metadata: Option<ObjectMeta>,
    pub spec: Option<PodSpec>,
    pub status: Option<PodStatus>,
}

impl From<Pod> for PodDetail {
    fn from(pod: Pod) -> Self {
        PodDetail {
            metadata: Some(pod.metadata), // Corrected: Wrap with Some()
            spec: pod.spec,
            status: pod.status,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ExecOptions {
    pub command: Vec<String>,
    pub container: Option<String>,
    pub tty: Option<bool>,
    pub stdin: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ExecResult {
    pub stdout: String,
    pub stderr: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ContainerInfo {
    pub name: String,
    pub image: String,
    pub ready: bool,
    pub restarts: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PodInfo {
    pub name: String,
    pub namespace: String,
    pub status: String,
    pub age: String,
    pub ip: Option<String>,
    pub node_name: Option<String>,
    pub containers: Vec<ContainerInfo>,
    pub restart_count: i32,
    pub controlled_by: Option<String>,
    pub controller_kind: Option<String>,
    pub labels: Option<BTreeMap<String, String>>,
    pub annotations: Option<BTreeMap<String, String>>,
    pub qos_class: Option<String>,
}

// Helper function to convert Kubernetes Pod to our PodInfo struct
// This can be used by other services like DeploymentsService, StatefulSetsService, etc.
pub fn convert_kube_pod_to_pod_info(pod: &Pod, current_namespace: &str) -> PodInfo {
    let pod_name = pod.name_any();
    let pod_namespace = pod
        .namespace()
        .unwrap_or_else(|| current_namespace.to_string());

    let status_phase = pod
        .status
        .as_ref()
        .and_then(|s| s.phase.clone())
        .unwrap_or_else(|| "Unknown".to_string());
    let pod_ip = pod.status.as_ref().and_then(|s| s.pod_ip.clone());
    let node_name = pod.spec.as_ref().and_then(|s| s.node_name.clone());

    let age = pod.metadata.creation_timestamp.as_ref().map_or_else(
        || "Unknown".to_string(),
        |ts| {
            let creation_time = ts.0;
            let duration = Utc::now().signed_duration_since(creation_time);
            if duration.num_days() > 0 {
                format!("{}d", duration.num_days())
            } else if duration.num_hours() > 0 {
                format!("{}h", duration.num_hours())
            } else if duration.num_minutes() > 0 {
                format!("{}m", duration.num_minutes())
            } else {
                format!("{}s", duration.num_seconds().max(0))
            }
        },
    );

    let mut container_infos = Vec::new();
    let mut total_restarts: i32 = 0;
    if let Some(spec_containers) = pod.spec.as_ref().map(|s| &s.containers) {
        let k8s_container_statuses = pod
            .status
            .as_ref()
            .and_then(|s| s.container_statuses.as_ref());
        for container_spec in spec_containers {
            let status_opt = k8s_container_statuses
                .and_then(|statuses| statuses.iter().find(|cs| cs.name == container_spec.name));

            let ready = status_opt.map_or(false, |cs| cs.ready);
            let restarts = status_opt.map_or(0, |cs| cs.restart_count);
            total_restarts += restarts;

            container_infos.push(ContainerInfo {
                name: container_spec.name.clone(),
                image: container_spec.image.clone().unwrap_or_default(),
                ready,
                restarts,
            });
        }
    }

    let (controlled_by, controller_kind) = pod
        .metadata
        .owner_references
        .as_ref()
        .and_then(|owners| owners.first())
        .map_or((None, None), |owner_ref| {
            (Some(owner_ref.name.clone()), Some(owner_ref.kind.clone()))
        });

    PodInfo {
        name: pod_name,
        namespace: pod_namespace,
        status: status_phase,
        age,
        ip: pod_ip,
        node_name,
        containers: container_infos,
        restart_count: total_restarts,
        controlled_by,
        controller_kind,
        labels: pod.metadata.labels.clone(),
        annotations: pod.metadata.annotations.clone(),
        qos_class: pod.status.as_ref().and_then(|s| s.qos_class.clone()),
    }
}

fn convert_kube_pod_to_pod_inventory(
    pod: &Pod,
    cluster_id: &str,
    current_namespace: &str,
    collected_at: chrono::DateTime<Utc>,
) -> PodInventoryItem {
    let pod_name = pod.name_any();
    let pod_namespace = pod
        .namespace()
        .unwrap_or_else(|| current_namespace.to_string());
    let status = pod.status.as_ref();
    let spec = pod.spec.as_ref();
    let container_statuses = status.and_then(|status| status.container_statuses.as_ref());
    let containers = spec
        .map(|spec| {
            spec.containers
                .iter()
                .map(|container_spec| {
                    let status_opt = container_statuses.and_then(|statuses| {
                        statuses
                            .iter()
                            .find(|container_status| container_status.name == container_spec.name)
                    });
                    PodContainerInventoryItem {
                        name: container_spec.name.clone(),
                        image: container_spec.image.clone(),
                        ready: status_opt.map(|status| status.ready),
                        restart_count: status_opt.map_or(0, |status| status.restart_count),
                        privileged: container_spec
                            .security_context
                            .as_ref()
                            .and_then(|security_context| security_context.privileged),
                    }
                })
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();
    let restart_count = containers
        .iter()
        .map(|container| container.restart_count)
        .sum();
    let (controlled_by, controller_kind) = pod
        .metadata
        .owner_references
        .as_ref()
        .and_then(|owners| owners.first())
        .map_or((None, None), |owner_ref| {
            (Some(owner_ref.name.clone()), Some(owner_ref.kind.clone()))
        });

    PodInventoryItem {
        cluster_id: cluster_id.to_string(),
        namespace: pod_namespace,
        name: pod_name,
        phase: status.and_then(|status| status.phase.clone()),
        pod_ip: status.and_then(|status| status.pod_ip.clone()),
        node_name: spec.and_then(|spec| spec.node_name.clone()),
        labels: pod.metadata.labels.clone().unwrap_or_default(),
        annotations: pod.metadata.annotations.clone().unwrap_or_default(),
        containers,
        restart_count,
        controlled_by,
        controller_kind,
        qos_class: status.and_then(|status| status.qos_class.clone()),
        service_account_name: spec.and_then(|spec| spec.service_account_name.clone()),
        host_network: spec.and_then(|spec| spec.host_network).unwrap_or(false),
        created_at: pod
            .metadata
            .creation_timestamp
            .as_ref()
            .map(|timestamp| timestamp.0),
        collected_at,
    }
}

fn convert_kube_event_to_event_inventory(
    event: &Event,
    cluster_id: &str,
    fallback_namespace: &str,
    collected_at: DateTime<Utc>,
) -> EventInventoryItem {
    let involved_object = &event.involved_object;
    let related_object = event.related.as_ref();
    EventInventoryItem {
        cluster_id: cluster_id.to_string(),
        namespace: event
            .metadata
            .namespace
            .clone()
            .unwrap_or_else(|| fallback_namespace.to_string()),
        name: event.name_any(),
        event_type: event.type_.clone(),
        reason: event.reason.clone(),
        message: event.message.clone(),
        count: event.count.unwrap_or(1),
        action: event.action.clone(),
        reporting_component: event.reporting_component.clone(),
        reporting_instance: event.reporting_instance.clone(),
        involved_object_api_version: involved_object.api_version.clone(),
        involved_object_kind: involved_object.kind.clone(),
        involved_object_namespace: involved_object.namespace.clone(),
        involved_object_name: involved_object.name.clone(),
        related_object_kind: related_object.and_then(|object| object.kind.clone()),
        related_object_name: related_object.and_then(|object| object.name.clone()),
        first_timestamp: event.first_timestamp.as_ref().map(|timestamp| timestamp.0),
        last_timestamp: event.last_timestamp.as_ref().map(|timestamp| timestamp.0),
        event_time: event.event_time.as_ref().map(|timestamp| timestamp.0),
        created_at: event
            .metadata
            .creation_timestamp
            .as_ref()
            .map(|timestamp| timestamp.0),
        collected_at,
    }
}

#[derive(Clone)]
pub struct PodService;

impl PodService {
    pub fn new() -> Self {
        PodService
    }

    async fn get_kube_client(cluster_config: &KubernetesClusterConfig) -> Result<Client, AppError> {
        ClientFactory::get_client(cluster_config).await
    }

    pub async fn list_pods(
        &self,
        cluster_config: &KubernetesClusterConfig,
        namespace: &str,
    ) -> Result<Vec<PodInfo>, AppError> {
        debug!(target: "mayyam::services::kubernetes::pod", cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"), %namespace, "Listing pods");
        let client = Self::get_kube_client(cluster_config).await?;

        let api: Api<Pod> = if namespace.is_empty() || namespace == "all" {
            Api::all(client)
        } else {
            Api::namespaced(client, namespace)
        };
        let lp = ListParams::default();
        match api.list(&lp).await {
            Ok(pod_list) => {
                info!(target: "mayyam::services::kubernetes::pod", cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"), %namespace, count = pod_list.items.len(), "Successfully listed pods");
                let actual_namespace = if namespace.is_empty() || namespace == "all" {
                    ""
                } else {
                    namespace
                };
                let pod_infos = pod_list
                    .iter()
                    .map(|p| convert_kube_pod_to_pod_info(p, actual_namespace))
                    .collect();
                Ok(pod_infos)
            }
            Err(e) => {
                error!(target: "mayyam::services::kubernetes::pod", cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"), %namespace, error = %e, "Failed to list pods");
                Err(AppError::Kubernetes(e.to_string()))
            }
        }
    }

    pub async fn list_pod_inventory(
        &self,
        cluster_config: &KubernetesClusterConfig,
        cluster_id: &str,
        namespace: Option<&str>,
    ) -> Result<Vec<PodInventoryItem>, AppError> {
        let namespace = namespace
            .map(str::trim)
            .filter(|namespace| !namespace.is_empty());
        debug!(
            target: "mayyam::services::kubernetes::pod",
            cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"),
            namespace = namespace.unwrap_or("all"),
            "Listing pod inventory"
        );
        let client = Self::get_kube_client(cluster_config).await?;

        let api: Api<Pod> = match namespace {
            Some(namespace) if namespace != "all" => Api::namespaced(client, namespace),
            _ => Api::all(client),
        };
        let lp = ListParams::default();
        let collected_at = Utc::now();
        match api.list(&lp).await {
            Ok(pod_list) => {
                info!(
                    target: "mayyam::services::kubernetes::pod",
                    cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"),
                    namespace = namespace.unwrap_or("all"),
                    count = pod_list.items.len(),
                    "Successfully listed pod inventory"
                );
                let fallback_namespace = namespace
                    .filter(|namespace| *namespace != "all")
                    .unwrap_or("");
                Ok(pod_list
                    .iter()
                    .map(|pod| {
                        convert_kube_pod_to_pod_inventory(
                            pod,
                            cluster_id,
                            fallback_namespace,
                            collected_at,
                        )
                    })
                    .collect())
            }
            Err(e) => {
                error!(
                    target: "mayyam::services::kubernetes::pod",
                    cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"),
                    namespace = namespace.unwrap_or("all"),
                    error = %e,
                    "Failed to list pod inventory"
                );
                Err(AppError::Kubernetes(e.to_string()))
            }
        }
    }

    pub async fn list_event_inventory(
        &self,
        cluster_config: &KubernetesClusterConfig,
        cluster_id: &str,
        namespace: Option<&str>,
    ) -> Result<Vec<EventInventoryItem>, AppError> {
        let namespace = namespace
            .map(str::trim)
            .filter(|namespace| !namespace.is_empty());
        debug!(
            target: "mayyam::services::kubernetes::pod",
            cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"),
            namespace = namespace.unwrap_or("all"),
            "Listing Event inventory"
        );
        let client = Self::get_kube_client(cluster_config).await?;

        let api: Api<Event> = match namespace {
            Some(namespace) if namespace != "all" => Api::namespaced(client, namespace),
            _ => Api::all(client),
        };
        let lp = ListParams::default();
        let collected_at = Utc::now();
        match api.list(&lp).await {
            Ok(event_list) => {
                info!(
                    target: "mayyam::services::kubernetes::pod",
                    cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"),
                    namespace = namespace.unwrap_or("all"),
                    count = event_list.items.len(),
                    "Successfully listed Event inventory"
                );
                let fallback_namespace = namespace
                    .filter(|namespace| *namespace != "all")
                    .unwrap_or("");
                let mut events = event_list
                    .iter()
                    .map(|event| {
                        convert_kube_event_to_event_inventory(
                            event,
                            cluster_id,
                            fallback_namespace,
                            collected_at,
                        )
                    })
                    .collect::<Vec<_>>();
                events.sort_by(|left, right| {
                    left.namespace
                        .cmp(&right.namespace)
                        .then_with(|| left.name.cmp(&right.name))
                });
                Ok(events)
            }
            Err(e) => {
                error!(
                    target: "mayyam::services::kubernetes::pod",
                    cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"),
                    namespace = namespace.unwrap_or("all"),
                    error = %e,
                    "Failed to list Event inventory"
                );
                Err(AppError::Kubernetes(e.to_string()))
            }
        }
    }

    pub async fn get_pod_details(
        &self,
        cluster_config: &KubernetesClusterConfig,
        namespace: &str,
        pod_name: &str,
    ) -> Result<PodDetail, AppError> {
        debug!(target: "mayyam::services::kubernetes::pod", cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"), %namespace, %pod_name, "Getting pod details");
        let client = Self::get_kube_client(cluster_config).await?;
        let api: Api<Pod> = Api::namespaced(client, namespace);
        match api.get(pod_name).await {
            Ok(pod) => {
                info!(target: "mayyam::services::kubernetes::pod", cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"), %namespace, %pod_name, "Successfully retrieved pod details");
                Ok(PodDetail::from(pod))
            }
            Err(e) => {
                error!(target: "mayyam::services::kubernetes::pod", cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"), %namespace, %pod_name, error = %e, "Failed to get pod details");
                Err(AppError::Kubernetes(e.to_string()))
            }
        }
    }

    pub async fn get_pod_events(
        &self,
        cluster_config: &KubernetesClusterConfig,
        namespace: &str,
        pod_name: &str,
    ) -> Result<Vec<Event>, AppError> {
        debug!(target: "mayyam::services::kubernetes::pod", cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"), %namespace, %pod_name, "Getting pod events");
        let client = Self::get_kube_client(cluster_config).await?;

        let pod_api: Api<Pod> = Api::namespaced(client.clone(), namespace);
        let pod_object = pod_api.get(pod_name).await.map_err(|e| {
            error!(target: "mayyam::services::kubernetes::pod", cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"), %namespace, %pod_name, error = %e, "Failed to retrieve pod to get its UID for events");
            AppError::NotFound(format!("Could not retrieve pod '{}' to get its UID: {}", pod_name, e))
        })?;

        let pod_uid = pod_object.metadata.uid.ok_or_else(|| {
            error!(target: "mayyam::services::kubernetes::pod", cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"), %namespace, %pod_name, "Pod is missing UID, cannot fetch events.");
            AppError::Internal(format!("Pod '{}' in namespace '{}' does not have a UID, cannot fetch events.", pod_name, namespace))
        })?;

        let event_api: Api<Event> = Api::namespaced(client, namespace);
        let lp = ListParams::default()
            .fields(&format!("involvedObject.uid={}", pod_uid))
            .timeout(10);

        match event_api.list(&lp).await {
            Ok(event_list) => {
                info!(target: "mayyam::services::kubernetes::pod", cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"), %namespace, %pod_name, count = event_list.items.len(), "Successfully fetched pod events");
                Ok(event_list.items)
            }
            Err(e) => {
                error!(target: "mayyam::services::kubernetes::pod", cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"), %namespace, %pod_name, error = %e, "Error fetching pod events");
                Err(AppError::Kubernetes(e.to_string()))
            }
        }
    }

    pub async fn get_pod_logs(
        &self,
        cluster_config: &KubernetesClusterConfig,
        namespace: &str,
        pod_name: &str,
        container_name: Option<&str>,
        previous: bool,
        tail_lines: Option<i64>,
    ) -> Result<String, AppError> {
        debug!(target: "mayyam::services::kubernetes::pod", cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"), %namespace, %pod_name, "Getting pod logs");
        let client = Self::get_kube_client(cluster_config).await?;
        let api: Api<Pod> = Api::namespaced(client, namespace);
        let mut lp = LogParams::default();
        if let Some(c_name) = container_name {
            lp.container = Some(c_name.to_string());
        }
        lp.previous = previous;
        lp.tail_lines = tail_lines;

        match api.logs(pod_name, &lp).await {
            Ok(logs) => {
                info!(target: "mayyam::services::kubernetes::pod", cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"), %namespace, %pod_name, "Successfully fetched pod logs");
                Ok(logs)
            }
            Err(e) => {
                error!(target: "mayyam::services::kubernetes::pod", cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"), %namespace, %pod_name, error = %e, "Error fetching pod logs");
                Err(AppError::Kubernetes(e.to_string()))
            }
        }
    }

    pub async fn delete_pod(
        &self,
        cluster_config: &KubernetesClusterConfig,
        namespace: &str,
        pod_name: &str,
    ) -> Result<(), AppError> {
        debug!(target: "mayyam::services::kubernetes::pod", cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"), %namespace, %pod_name, "Deleting pod");
        let client = Self::get_kube_client(cluster_config).await?;
        let api: Api<Pod> = Api::namespaced(client, namespace);
        let dp = DeleteParams::default();
        match api.delete(pod_name, &dp).await {
            Ok(_) => {
                info!(target: "mayyam::services::kubernetes::pod", cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"), %namespace, %pod_name, "Successfully deleted pod");
                Ok(())
            }
            Err(e) => {
                error!(target: "mayyam::services::kubernetes::pod", cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"), %namespace, %pod_name, error = %e, "Error deleting pod");
                Err(AppError::Kubernetes(e.to_string()))
            }
        }
    }

    pub async fn exec_command(
        &self,
        cluster_config: &KubernetesClusterConfig,
        namespace: &str,
        pod_name: &str,
        opts: ExecOptions,
    ) -> Result<ExecResult, AppError> {
        let client = Self::get_kube_client(cluster_config).await?;
        let api: Api<Pod> = Api::namespaced(client, namespace);

        let mut ap = AttachParams::default()
            .stdout(true)
            .stderr(true)
            .stdin(opts.stdin.unwrap_or(false))
            .tty(opts.tty.unwrap_or(false));
        if let Some(c) = opts.container.clone() {
            ap = ap.container(c.as_str());
        }

        let cmd: Vec<String> = opts.command.clone();
        let mut attached = api
            .exec(pod_name, cmd.as_slice(), &ap)
            .await
            .map_err(|e| AppError::Kubernetes(e.to_string()))?;

        let mut stdout_buf: Vec<u8> = Vec::new();
        let mut stderr_buf: Vec<u8> = Vec::new();

        if let Some(mut out) = attached.stdout().take() {
            out.read_to_end(&mut stdout_buf)
                .await
                .map_err(|e| AppError::Kubernetes(format!("Failed reading stdout: {}", e)))?;
        }
        if let Some(mut err) = attached.stderr().take() {
            err.read_to_end(&mut stderr_buf)
                .await
                .map_err(|e| AppError::Kubernetes(format!("Failed reading stderr: {}", e)))?;
        }

        Ok(ExecResult {
            stdout: String::from_utf8_lossy(&stdout_buf).to_string(),
            stderr: String::from_utf8_lossy(&stderr_buf).to_string(),
        })
    }

    pub async fn stream_pod_logs(
        &self,
        cluster_config: &KubernetesClusterConfig,
        namespace: &str,
        pod_name: &str,
        container_name: Option<&str>,
        previous: bool,
        tail_lines: Option<i64>,
    ) -> Result<impl futures::Stream<Item = Result<bytes::Bytes, kube::Error>>, AppError> {
        use futures::StreamExt;
        use futures_util::TryStreamExt;
        debug!(target: "mayyam::services::kubernetes::pod", cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"), %namespace, %pod_name, "Streaming pod logs");
        let client = Self::get_kube_client(cluster_config).await?;
        let api: Api<Pod> = Api::namespaced(client, namespace);

        let mut lp = LogParams::default();
        if let Some(c_name) = container_name {
            lp.container = Some(c_name.to_string());
        }
        lp.previous = previous;
        lp.tail_lines = tail_lines;
        lp.follow = true; // Essential for streaming

        let log_reader = api.log_stream(pod_name, &lp).await.map_err(|e| {
            error!(target: "mayyam::services::kubernetes::pod", cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"), %namespace, %pod_name, error = %e, "Error streaming pod logs");
            AppError::Kubernetes(e.to_string())
        })?;

        use tokio_util::compat::FuturesAsyncReadCompatExt;
        let compat_reader = log_reader.compat();

        let stream =
            tokio_util::io::ReaderStream::new(compat_reader).map_err(|e: std::io::Error| {
                kube::Error::Api(kube::error::ErrorResponse {
                    status: "Failure".to_string(),
                    message: e.to_string(),
                    reason: "InternalError".to_string(),
                    code: 500,
                })
            });

        Ok(stream)
    }

    pub async fn watch_pods(
        &self,
        cluster_config: &KubernetesClusterConfig,
        namespace: &str,
    ) -> Result<
        impl futures::Stream<
            Item = Result<kube::runtime::watcher::Event<Pod>, kube::runtime::watcher::Error>,
        >,
        AppError,
    > {
        debug!(target: "mayyam::services::kubernetes::pod", cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"), %namespace, "Watching pods");
        let client = Self::get_kube_client(cluster_config).await?;
        let api: Api<Pod> = Api::namespaced(client, namespace);
        let watcher = kube::runtime::watcher(api, kube::runtime::watcher::Config::default());
        Ok(watcher)
    }

    pub async fn watch_events(
        &self,
        cluster_config: &KubernetesClusterConfig,
        namespace: &str,
    ) -> Result<
        impl futures::Stream<
            Item = Result<kube::runtime::watcher::Event<Event>, kube::runtime::watcher::Error>,
        >,
        AppError,
    > {
        debug!(target: "mayyam::services::kubernetes::pod", cluster_name = cluster_config.api_server_url.as_deref().unwrap_or("unknown"), %namespace, "Watching events");
        let client = Self::get_kube_client(cluster_config).await?;
        let api: Api<Event> = Api::namespaced(client, namespace);
        let watcher = kube::runtime::watcher(api, kube::runtime::watcher::Config::default());
        Ok(watcher)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;
    use k8s_openapi::api::core::v1::ObjectReference;
    use k8s_openapi::apimachinery::pkg::apis::meta::v1::{MicroTime, Time};

    #[test]
    fn event_inventory_conversion_preserves_metadata_involved_related_and_timestamps() {
        let collected_at = Utc.with_ymd_and_hms(2026, 6, 10, 0, 0, 0).unwrap();
        let created_at = Utc.with_ymd_and_hms(2026, 6, 9, 23, 0, 0).unwrap();
        let first_timestamp = Utc.with_ymd_and_hms(2026, 6, 9, 23, 5, 0).unwrap();
        let last_timestamp = Utc.with_ymd_and_hms(2026, 6, 9, 23, 10, 0).unwrap();
        let event_time = Utc.with_ymd_and_hms(2026, 6, 9, 23, 4, 0).unwrap();
        let event = Event {
            metadata: ObjectMeta {
                name: Some("pod-a.started".to_string()),
                namespace: Some("apps".to_string()),
                creation_timestamp: Some(Time(created_at)),
                ..Default::default()
            },
            type_: Some("Warning".to_string()),
            reason: Some("FailedScheduling".to_string()),
            message: Some("0/3 nodes are available".to_string()),
            count: Some(50),
            action: Some("Scheduling".to_string()),
            reporting_component: Some("default-scheduler".to_string()),
            reporting_instance: Some("scheduler-a".to_string()),
            involved_object: ObjectReference {
                api_version: Some("v1".to_string()),
                kind: Some("Pod".to_string()),
                namespace: Some("apps".to_string()),
                name: Some("pod-a".to_string()),
                ..Default::default()
            },
            related: Some(ObjectReference {
                kind: Some("Node".to_string()),
                name: Some("node-a".to_string()),
                ..Default::default()
            }),
            first_timestamp: Some(Time(first_timestamp)),
            last_timestamp: Some(Time(last_timestamp)),
            event_time: Some(MicroTime(event_time)),
            ..Default::default()
        };

        let inventory =
            convert_kube_event_to_event_inventory(&event, "cluster-a", "fallback", collected_at);

        assert_eq!(inventory.cluster_id, "cluster-a");
        assert_eq!(inventory.namespace, "apps");
        assert_eq!(inventory.name, "pod-a.started");
        assert_eq!(inventory.event_type.as_deref(), Some("Warning"));
        assert_eq!(inventory.reason.as_deref(), Some("FailedScheduling"));
        assert_eq!(
            inventory.message.as_deref(),
            Some("0/3 nodes are available")
        );
        assert_eq!(inventory.count, 50);
        assert_eq!(inventory.action.as_deref(), Some("Scheduling"));
        assert_eq!(
            inventory.reporting_component.as_deref(),
            Some("default-scheduler")
        );
        assert_eq!(inventory.reporting_instance.as_deref(), Some("scheduler-a"));
        assert_eq!(inventory.involved_object_api_version.as_deref(), Some("v1"));
        assert_eq!(inventory.involved_object_kind.as_deref(), Some("Pod"));
        assert_eq!(inventory.involved_object_namespace.as_deref(), Some("apps"));
        assert_eq!(inventory.involved_object_name.as_deref(), Some("pod-a"));
        assert_eq!(inventory.related_object_kind.as_deref(), Some("Node"));
        assert_eq!(inventory.related_object_name.as_deref(), Some("node-a"));
        assert_eq!(inventory.first_timestamp, Some(first_timestamp));
        assert_eq!(inventory.last_timestamp, Some(last_timestamp));
        assert_eq!(inventory.event_time, Some(event_time));
        assert_eq!(inventory.created_at, Some(created_at));
        assert_eq!(inventory.collected_at, collected_at);
    }

    #[test]
    fn event_inventory_conversion_handles_missing_optional_state() {
        let collected_at = Utc.with_ymd_and_hms(2026, 6, 10, 0, 0, 0).unwrap();
        let event = Event {
            metadata: ObjectMeta {
                name: Some("pod-a.normal".to_string()),
                ..Default::default()
            },
            involved_object: ObjectReference::default(),
            ..Default::default()
        };

        let inventory =
            convert_kube_event_to_event_inventory(&event, "cluster-a", "fallback", collected_at);

        assert_eq!(inventory.namespace, "fallback");
        assert_eq!(inventory.name, "pod-a.normal");
        assert_eq!(inventory.count, 1);
        assert_eq!(inventory.event_type, None);
        assert_eq!(inventory.reason, None);
        assert_eq!(inventory.message, None);
        assert_eq!(inventory.related_object_kind, None);
        assert_eq!(inventory.related_object_name, None);
        assert_eq!(inventory.first_timestamp, None);
        assert_eq!(inventory.last_timestamp, None);
        assert_eq!(inventory.event_time, None);
        assert_eq!(inventory.created_at, None);
    }
}

impl Default for PodService {
    fn default() -> Self {
        Self::new()
    }
}
