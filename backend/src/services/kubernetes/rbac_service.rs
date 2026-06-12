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

use crate::errors::AppError;
use crate::models::cluster::KubernetesClusterConfig;
use crate::services::kubernetes::client::ClientFactory;
use crate::services::kubernetes::role_inventory::{
    RoleInventoryItem, RoleOwnerReferenceInventoryItem, RoleRuleInventoryItem,
};
use chrono::{DateTime, Utc};
use k8s_openapi::api::rbac::v1::{ClusterRole, ClusterRoleBinding, PolicyRule, Role, RoleBinding};
use kube::api::{DeleteParams, ListParams, Patch, PatchParams};
use kube::{Api, ResourceExt};

pub struct RbacService;

fn convert_policy_rule_to_inventory(rule: &PolicyRule) -> RoleRuleInventoryItem {
    let mut api_groups = rule.api_groups.clone().unwrap_or_default();
    let mut resources = rule.resources.clone().unwrap_or_default();
    let mut verbs = rule.verbs.clone();
    let mut resource_names = rule.resource_names.clone().unwrap_or_default();
    let mut non_resource_urls = rule.non_resource_urls.clone().unwrap_or_default();
    api_groups.sort();
    resources.sort();
    verbs.sort();
    resource_names.sort();
    non_resource_urls.sort();

    RoleRuleInventoryItem {
        api_groups,
        resources,
        verbs,
        resource_names,
        non_resource_urls,
    }
}

fn convert_kube_role_to_inventory(
    role: &Role,
    cluster_id: &str,
    current_namespace: &str,
    collected_at: DateTime<Utc>,
) -> RoleInventoryItem {
    let namespace = role
        .namespace()
        .unwrap_or_else(|| current_namespace.to_string());
    let rules = role
        .rules
        .as_ref()
        .map(|rules| {
            rules
                .iter()
                .map(convert_policy_rule_to_inventory)
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();
    let owner_references = role
        .metadata
        .owner_references
        .as_ref()
        .map(|owners| {
            owners
                .iter()
                .map(|owner| RoleOwnerReferenceInventoryItem {
                    kind: Some(owner.kind.clone()),
                    name: owner.name.clone(),
                    controller: owner.controller,
                })
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();

    RoleInventoryItem {
        cluster_id: cluster_id.to_string(),
        namespace,
        name: role.name_any(),
        labels: role.metadata.labels.clone().unwrap_or_default(),
        annotations: role.metadata.annotations.clone().unwrap_or_default(),
        rules,
        owner_references,
        created_at: role
            .metadata
            .creation_timestamp
            .as_ref()
            .map(|timestamp| timestamp.0),
        collected_at,
    }
}

impl RbacService {
    pub fn new() -> Self {
        Self
    }

    // Roles
    async fn roles_api(
        cluster: &KubernetesClusterConfig,
        namespace: &str,
    ) -> Result<Api<Role>, AppError> {
        let client = ClientFactory::get_client(cluster).await?;
        Ok(if namespace.is_empty() || namespace == "all" {
            Api::all(client)
        } else {
            Api::namespaced(client, namespace)
        })
    }
    pub async fn list_roles(
        &self,
        cluster: &KubernetesClusterConfig,
        namespace: &str,
    ) -> Result<Vec<Role>, AppError> {
        let api = Self::roles_api(cluster, namespace).await?;
        Ok(api
            .list(&ListParams::default())
            .await
            .map_err(|e| AppError::Kubernetes(e.to_string()))?
            .items)
    }
    pub async fn list_role_inventory(
        &self,
        cluster: &KubernetesClusterConfig,
        cluster_id: &str,
        namespace: Option<&str>,
    ) -> Result<Vec<RoleInventoryItem>, AppError> {
        let namespace = namespace
            .map(str::trim)
            .filter(|namespace| !namespace.is_empty());
        let namespace_arg = namespace.unwrap_or("");
        let fallback_namespace = namespace
            .filter(|namespace| *namespace != "all")
            .unwrap_or("");
        let collected_at = Utc::now();

        let api = Self::roles_api(cluster, namespace_arg).await?;
        let list = api
            .list(&ListParams::default())
            .await
            .map_err(|e| AppError::Kubernetes(e.to_string()))?;
        let mut inventory = list
            .items
            .iter()
            .map(|role| {
                convert_kube_role_to_inventory(role, cluster_id, fallback_namespace, collected_at)
            })
            .collect::<Vec<_>>();
        inventory.sort_by(|left, right| {
            (left.namespace.as_str(), left.name.as_str())
                .cmp(&(right.namespace.as_str(), right.name.as_str()))
        });
        Ok(inventory)
    }
    pub async fn get_role(
        &self,
        cluster: &KubernetesClusterConfig,
        namespace: &str,
        name: &str,
    ) -> Result<Role, AppError> {
        let api: Api<Role> = Api::namespaced(ClientFactory::get_client(cluster).await?, namespace);
        api.get(name)
            .await
            .map_err(|e| AppError::Kubernetes(e.to_string()))
    }
    pub async fn upsert_role(
        &self,
        cluster: &KubernetesClusterConfig,
        namespace: &str,
        item: &Role,
    ) -> Result<Role, AppError> {
        let api: Api<Role> = Api::namespaced(ClientFactory::get_client(cluster).await?, namespace);
        let pp = PatchParams::apply("mayyam").force();
        api.patch(
            item.metadata
                .name
                .as_ref()
                .ok_or_else(|| AppError::BadRequest("Role.metadata.name required".into()))?,
            &pp,
            &Patch::Apply(item),
        )
        .await
        .map_err(|e| AppError::Kubernetes(e.to_string()))
    }
    pub async fn delete_role(
        &self,
        cluster: &KubernetesClusterConfig,
        namespace: &str,
        name: &str,
    ) -> Result<(), AppError> {
        let api: Api<Role> = Api::namespaced(ClientFactory::get_client(cluster).await?, namespace);
        api.delete(name, &DeleteParams::default())
            .await
            .map_err(|e| AppError::Kubernetes(e.to_string()))?;
        Ok(())
    }

    // RoleBindings
    async fn role_bindings_api(
        cluster: &KubernetesClusterConfig,
        namespace: &str,
    ) -> Result<Api<RoleBinding>, AppError> {
        let client = ClientFactory::get_client(cluster).await?;
        Ok(if namespace.is_empty() || namespace == "all" {
            Api::all(client)
        } else {
            Api::namespaced(client, namespace)
        })
    }
    pub async fn list_role_bindings(
        &self,
        cluster: &KubernetesClusterConfig,
        namespace: &str,
    ) -> Result<Vec<RoleBinding>, AppError> {
        let api = Self::role_bindings_api(cluster, namespace).await?;
        Ok(api
            .list(&ListParams::default())
            .await
            .map_err(|e| AppError::Kubernetes(e.to_string()))?
            .items)
    }
    pub async fn get_role_binding(
        &self,
        cluster: &KubernetesClusterConfig,
        namespace: &str,
        name: &str,
    ) -> Result<RoleBinding, AppError> {
        let api: Api<RoleBinding> =
            Api::namespaced(ClientFactory::get_client(cluster).await?, namespace);
        api.get(name)
            .await
            .map_err(|e| AppError::Kubernetes(e.to_string()))
    }
    pub async fn upsert_role_binding(
        &self,
        cluster: &KubernetesClusterConfig,
        namespace: &str,
        item: &RoleBinding,
    ) -> Result<RoleBinding, AppError> {
        let api: Api<RoleBinding> =
            Api::namespaced(ClientFactory::get_client(cluster).await?, namespace);
        let pp = PatchParams::apply("mayyam").force();
        api.patch(
            item.metadata
                .name
                .as_ref()
                .ok_or_else(|| AppError::BadRequest("RoleBinding.metadata.name required".into()))?,
            &pp,
            &Patch::Apply(item),
        )
        .await
        .map_err(|e| AppError::Kubernetes(e.to_string()))
    }
    pub async fn delete_role_binding(
        &self,
        cluster: &KubernetesClusterConfig,
        namespace: &str,
        name: &str,
    ) -> Result<(), AppError> {
        let api: Api<RoleBinding> =
            Api::namespaced(ClientFactory::get_client(cluster).await?, namespace);
        api.delete(name, &DeleteParams::default())
            .await
            .map_err(|e| AppError::Kubernetes(e.to_string()))?;
        Ok(())
    }

    // ClusterRoles (cluster-scoped)
    async fn cluster_roles_api(
        cluster: &KubernetesClusterConfig,
    ) -> Result<Api<ClusterRole>, AppError> {
        let client = ClientFactory::get_client(cluster).await?;
        Ok(Api::all(client))
    }
    pub async fn list_cluster_roles(
        &self,
        cluster: &KubernetesClusterConfig,
    ) -> Result<Vec<ClusterRole>, AppError> {
        let api: Api<ClusterRole> = Self::cluster_roles_api(cluster).await?;
        Ok(api
            .list(&ListParams::default())
            .await
            .map_err(|e| AppError::Kubernetes(e.to_string()))?
            .items)
    }
    pub async fn get_cluster_role(
        &self,
        cluster: &KubernetesClusterConfig,
        name: &str,
    ) -> Result<ClusterRole, AppError> {
        let api: Api<ClusterRole> = Self::cluster_roles_api(cluster).await?;
        api.get(name)
            .await
            .map_err(|e| AppError::Kubernetes(e.to_string()))
    }
    pub async fn upsert_cluster_role(
        &self,
        cluster: &KubernetesClusterConfig,
        item: &ClusterRole,
    ) -> Result<ClusterRole, AppError> {
        let api = Self::cluster_roles_api(cluster).await?;
        let pp = PatchParams::apply("mayyam").force();
        api.patch(
            item.metadata
                .name
                .as_ref()
                .ok_or_else(|| AppError::BadRequest("ClusterRole.metadata.name required".into()))?,
            &pp,
            &Patch::Apply(item),
        )
        .await
        .map_err(|e| AppError::Kubernetes(e.to_string()))
    }
    pub async fn delete_cluster_role(
        &self,
        cluster: &KubernetesClusterConfig,
        name: &str,
    ) -> Result<(), AppError> {
        let api = Self::cluster_roles_api(cluster).await?;
        api.delete(name, &DeleteParams::default())
            .await
            .map_err(|e| AppError::Kubernetes(e.to_string()))?;
        Ok(())
    }

    // ClusterRoleBindings (cluster-scoped)
    async fn cluster_role_bindings_api(
        cluster: &KubernetesClusterConfig,
    ) -> Result<Api<ClusterRoleBinding>, AppError> {
        let client = ClientFactory::get_client(cluster).await?;
        Ok(Api::all(client))
    }
    pub async fn list_cluster_role_bindings(
        &self,
        cluster: &KubernetesClusterConfig,
    ) -> Result<Vec<ClusterRoleBinding>, AppError> {
        let api: Api<ClusterRoleBinding> = Self::cluster_role_bindings_api(cluster).await?;
        Ok(api
            .list(&ListParams::default())
            .await
            .map_err(|e| AppError::Kubernetes(e.to_string()))?
            .items)
    }
    pub async fn get_cluster_role_binding(
        &self,
        cluster: &KubernetesClusterConfig,
        name: &str,
    ) -> Result<ClusterRoleBinding, AppError> {
        let api: Api<ClusterRoleBinding> = Self::cluster_role_bindings_api(cluster).await?;
        api.get(name)
            .await
            .map_err(|e| AppError::Kubernetes(e.to_string()))
    }
    pub async fn upsert_cluster_role_binding(
        &self,
        cluster: &KubernetesClusterConfig,
        item: &ClusterRoleBinding,
    ) -> Result<ClusterRoleBinding, AppError> {
        let api = Self::cluster_role_bindings_api(cluster).await?;
        let pp = PatchParams::apply("mayyam").force();
        api.patch(
            item.metadata.name.as_ref().ok_or_else(|| {
                AppError::BadRequest("ClusterRoleBinding.metadata.name required".into())
            })?,
            &pp,
            &Patch::Apply(item),
        )
        .await
        .map_err(|e| AppError::Kubernetes(e.to_string()))
    }
    pub async fn delete_cluster_role_binding(
        &self,
        cluster: &KubernetesClusterConfig,
        name: &str,
    ) -> Result<(), AppError> {
        let api = Self::cluster_role_bindings_api(cluster).await?;
        api.delete(name, &DeleteParams::default())
            .await
            .map_err(|e| AppError::Kubernetes(e.to_string()))?;
        Ok(())
    }
}
