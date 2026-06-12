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
use crate::services::kubernetes::custom_resource_definition_inventory::{
    CustomResourceDefinitionConditionInventoryItem, CustomResourceDefinitionInventoryItem,
    CustomResourceDefinitionVersionInventoryItem,
};
use chrono::{DateTime, Utc};
use k8s_openapi::apiextensions_apiserver::pkg::apis::apiextensions::v1::CustomResourceDefinition;
use kube::{
    api::{Api, DynamicObject, GroupVersionKind, ListParams},
    discovery::{ApiResource, Discovery, Scope},
    ResourceExt,
};
use serde_json::Value;

pub struct CrdsService;

fn convert_kube_crd_to_inventory(
    crd: &CustomResourceDefinition,
    cluster_id: &str,
    collected_at: DateTime<Utc>,
) -> CustomResourceDefinitionInventoryItem {
    let versions = crd
        .spec
        .versions
        .iter()
        .map(|version| {
            let subresources = version.subresources.as_ref();
            CustomResourceDefinitionVersionInventoryItem {
                name: version.name.clone(),
                served: version.served,
                storage: version.storage,
                deprecated: version.deprecated.unwrap_or(false),
                has_schema: version
                    .schema
                    .as_ref()
                    .and_then(|schema| schema.open_api_v3_schema.as_ref())
                    .is_some(),
                has_status_subresource: subresources
                    .and_then(|subresource| subresource.status.as_ref())
                    .is_some(),
                has_scale_subresource: subresources
                    .and_then(|subresource| subresource.scale.as_ref())
                    .is_some(),
                additional_printer_columns_count: version
                    .additional_printer_columns
                    .as_ref()
                    .map(Vec::len)
                    .unwrap_or_default(),
            }
        })
        .collect();
    let stored_versions = crd
        .status
        .as_ref()
        .and_then(|status| status.stored_versions.clone())
        .unwrap_or_default();
    let conditions = crd
        .status
        .as_ref()
        .and_then(|status| status.conditions.clone())
        .unwrap_or_default()
        .into_iter()
        .map(|condition| CustomResourceDefinitionConditionInventoryItem {
            condition_type: condition.type_,
            status: condition.status,
            reason: condition.reason,
            message: condition.message,
        })
        .collect();

    CustomResourceDefinitionInventoryItem {
        cluster_id: cluster_id.to_string(),
        name: crd.name_any(),
        labels: crd.metadata.labels.clone().unwrap_or_default(),
        annotations: crd.metadata.annotations.clone().unwrap_or_default(),
        group: crd.spec.group.clone(),
        scope: crd.spec.scope.clone(),
        kind: crd.spec.names.kind.clone(),
        plural: crd.spec.names.plural.clone(),
        singular: crd.spec.names.singular.clone(),
        short_names: crd.spec.names.short_names.clone().unwrap_or_default(),
        categories: crd.spec.names.categories.clone().unwrap_or_default(),
        preserve_unknown_fields: crd.spec.preserve_unknown_fields,
        versions,
        stored_versions,
        conditions,
        created_at: crd
            .metadata
            .creation_timestamp
            .as_ref()
            .map(|timestamp| timestamp.0),
        collected_at,
    }
}

impl CrdsService {
    pub fn new() -> Self {
        Self
    }

    pub async fn list_crds(
        &self,
        cluster_config: &KubernetesClusterConfig,
    ) -> Result<Vec<Value>, AppError> {
        let client = ClientFactory::get_client(cluster_config).await?;
        let crds: Api<CustomResourceDefinition> = Api::all(client);

        let crd_list = crds
            .list(&ListParams::default())
            .await
            .map_err(|e| AppError::ExternalService(format!("Failed to list CRDs: {}", e)))?;

        let mut formatted_crds = Vec::new();
        for crd in crd_list {
            if let Ok(value) = serde_json::to_value(&crd) {
                formatted_crds.push(value);
            }
        }

        Ok(formatted_crds)
    }

    pub async fn list_inventory(
        &self,
        cluster_config: &KubernetesClusterConfig,
        cluster_id: &str,
    ) -> Result<Vec<CustomResourceDefinitionInventoryItem>, AppError> {
        let client = ClientFactory::get_client(cluster_config).await?;
        let crds: Api<CustomResourceDefinition> = Api::all(client);
        let collected_at = Utc::now();
        let crd_list = crds.list(&ListParams::default()).await.map_err(|e| {
            AppError::ExternalService(format!(
                "Failed to list CustomResourceDefinition inventory: {}",
                e
            ))
        })?;

        let mut inventory = crd_list
            .items
            .iter()
            .map(|crd| convert_kube_crd_to_inventory(crd, cluster_id, collected_at))
            .collect::<Vec<_>>();
        inventory.sort_by(|left, right| left.name.cmp(&right.name));
        Ok(inventory)
    }

    pub async fn get_crd_details(
        &self,
        cluster_config: &KubernetesClusterConfig,
        crd_name: &str,
    ) -> Result<Value, AppError> {
        let client = ClientFactory::get_client(cluster_config).await?;
        let crds: Api<CustomResourceDefinition> = Api::all(client);

        let crd = crds
            .get(crd_name)
            .await
            .map_err(|e| AppError::ExternalService(format!("Failed to get CRD details: {}", e)))?;

        serde_json::to_value(&crd)
            .map_err(|e| AppError::Internal(format!("Failed to serialize CRD details: {}", e)))
    }

    /// Generic fallback for dynamically dealing with custom resources based on their GroupVersionKind
    pub async fn list_custom_resources(
        &self,
        cluster_config: &KubernetesClusterConfig,
        group: &str,
        version: &str,
        plural: &str,
        namespace: Option<&str>,
    ) -> Result<Vec<Value>, AppError> {
        let client = ClientFactory::get_client(cluster_config).await?;
        let discovery = Discovery::new(client.clone())
            .run()
            .await
            .map_err(|e| AppError::ExternalService(format!("Discovery failed: {}", e)))?;

        let gvk = GroupVersionKind::gvk(group, version, "");

        // Use discovery to find the exact APIResource matching the requested group/version/plural
        let _api_group = discovery.resolve_gvk(&gvk).ok_or_else(|| {
            AppError::NotFound(format!("ApiGroup {}/{} not found", group, version))
        })?;

        // Fallback or explicit check for resource by plural if gvk resolution doesn't match perfectly.
        // We really want the resource by plural name since that maps to the REST endpoint.
        let mut target_ar: Option<(ApiResource, kube::discovery::ApiCapabilities)> = None;
        if let Some(group_info) = discovery.get(group) {
            for (ar, caps) in group_info.recommended_resources() {
                if ar.plural == plural && ar.version == version && ar.group == group {
                    target_ar = Some((ar, caps));
                    break;
                }
            }
        }

        let (ar, caps) = target_ar.ok_or_else(|| {
            AppError::NotFound(format!(
                "Resource {} not found in {}/{}",
                plural, group, version
            ))
        })?;

        let api: Api<DynamicObject> = match namespace {
            Some(ns) if caps.scope == Scope::Namespaced => {
                Api::namespaced_with(client.clone(), ns, &ar)
            }
            _ => Api::all_with(client.clone(), &ar),
        };

        let list = api.list(&ListParams::default()).await.map_err(|e| {
            AppError::ExternalService(format!("Failed to list CustomResources: {}", e))
        })?;

        let mut items = Vec::new();
        for item in list {
            if let Ok(value) = serde_json::to_value(&item) {
                items.push(value);
            }
        }

        Ok(items)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;
    use k8s_openapi::apiextensions_apiserver::pkg::apis::apiextensions::v1::{
        CustomResourceColumnDefinition, CustomResourceDefinitionCondition,
        CustomResourceDefinitionNames, CustomResourceDefinitionSpec,
        CustomResourceDefinitionStatus, CustomResourceDefinitionVersion,
        CustomResourceSubresourceStatus, CustomResourceSubresources, CustomResourceValidation,
        JSONSchemaProps,
    };
    use k8s_openapi::apimachinery::pkg::apis::meta::v1::{ObjectMeta, Time};
    use serde_json::json;
    use std::collections::BTreeMap;

    fn map(values: &[(&str, &str)]) -> BTreeMap<String, String> {
        values
            .iter()
            .map(|(key, value)| ((*key).to_string(), (*value).to_string()))
            .collect()
    }

    #[test]
    fn custom_resource_definition_inventory_conversion_preserves_metadata_spec_versions_status() {
        let created_at = Utc.with_ymd_and_hms(2026, 6, 1, 12, 0, 0).unwrap();
        let collected_at = Utc.with_ymd_and_hms(2026, 6, 10, 0, 0, 0).unwrap();
        let crd = CustomResourceDefinition {
            metadata: ObjectMeta {
                name: Some("widgets.example.com".to_string()),
                labels: Some(map(&[("team", "platform")])),
                annotations: Some(map(&[("cost-center", "cc-42")])),
                creation_timestamp: Some(Time(created_at)),
                ..Default::default()
            },
            spec: CustomResourceDefinitionSpec {
                group: "example.com".to_string(),
                names: CustomResourceDefinitionNames {
                    kind: "Widget".to_string(),
                    plural: "widgets".to_string(),
                    singular: Some("widget".to_string()),
                    short_names: Some(vec!["wdg".to_string()]),
                    categories: Some(vec!["all".to_string()]),
                    ..Default::default()
                },
                preserve_unknown_fields: Some(false),
                scope: "Namespaced".to_string(),
                versions: vec![CustomResourceDefinitionVersion {
                    additional_printer_columns: Some(vec![CustomResourceColumnDefinition {
                        json_path: ".spec.size".to_string(),
                        name: "Size".to_string(),
                        type_: "string".to_string(),
                        ..Default::default()
                    }]),
                    name: "v1".to_string(),
                    schema: Some(CustomResourceValidation {
                        open_api_v3_schema: Some(JSONSchemaProps {
                            type_: Some("object".to_string()),
                            ..Default::default()
                        }),
                    }),
                    served: true,
                    storage: true,
                    subresources: Some(CustomResourceSubresources {
                        status: Some(CustomResourceSubresourceStatus(json!({}))),
                        ..Default::default()
                    }),
                    ..Default::default()
                }],
                ..Default::default()
            },
            status: Some(CustomResourceDefinitionStatus {
                conditions: Some(vec![
                    CustomResourceDefinitionCondition {
                        type_: "Established".to_string(),
                        status: "True".to_string(),
                        reason: Some("InitialNamesAccepted".to_string()),
                        ..Default::default()
                    },
                    CustomResourceDefinitionCondition {
                        type_: "NamesAccepted".to_string(),
                        status: "True".to_string(),
                        reason: Some("NoConflicts".to_string()),
                        message: Some("names are accepted".to_string()),
                        ..Default::default()
                    },
                ]),
                stored_versions: Some(vec!["v1".to_string()]),
                ..Default::default()
            }),
        };

        let item = convert_kube_crd_to_inventory(&crd, "cluster-a", collected_at);

        assert_eq!(item.cluster_id, "cluster-a");
        assert_eq!(item.name, "widgets.example.com");
        assert_eq!(item.labels["team"], "platform");
        assert_eq!(item.annotations["cost-center"], "cc-42");
        assert_eq!(item.group, "example.com");
        assert_eq!(item.scope, "Namespaced");
        assert_eq!(item.kind, "Widget");
        assert_eq!(item.plural, "widgets");
        assert_eq!(item.singular.as_deref(), Some("widget"));
        assert_eq!(item.short_names, vec!["wdg".to_string()]);
        assert_eq!(item.categories, vec!["all".to_string()]);
        assert_eq!(item.preserve_unknown_fields, Some(false));
        assert_eq!(item.created_at, Some(created_at));
        assert_eq!(item.collected_at, collected_at);
        assert_eq!(item.stored_versions, vec!["v1".to_string()]);
        assert_eq!(item.conditions.len(), 2);
        assert_eq!(item.conditions[0].condition_type, "Established");
        assert_eq!(
            item.conditions[1].message.as_deref(),
            Some("names are accepted")
        );
        assert_eq!(item.versions.len(), 1);
        assert_eq!(item.versions[0].name, "v1");
        assert!(item.versions[0].served);
        assert!(item.versions[0].storage);
        assert!(!item.versions[0].deprecated);
        assert!(item.versions[0].has_schema);
        assert!(item.versions[0].has_status_subresource);
        assert!(!item.versions[0].has_scale_subresource);
        assert_eq!(item.versions[0].additional_printer_columns_count, 1);
    }

    #[test]
    fn custom_resource_definition_inventory_conversion_handles_missing_optional_state() {
        let collected_at = Utc.with_ymd_and_hms(2026, 6, 10, 0, 0, 0).unwrap();
        let crd = CustomResourceDefinition {
            metadata: ObjectMeta {
                name: Some("gadgets.example.com".to_string()),
                ..Default::default()
            },
            spec: CustomResourceDefinitionSpec {
                group: "example.com".to_string(),
                names: CustomResourceDefinitionNames {
                    kind: "Gadget".to_string(),
                    plural: "gadgets".to_string(),
                    ..Default::default()
                },
                preserve_unknown_fields: Some(true),
                scope: "Cluster".to_string(),
                versions: vec![CustomResourceDefinitionVersion {
                    name: "v1alpha1".to_string(),
                    served: true,
                    storage: true,
                    ..Default::default()
                }],
                ..Default::default()
            },
            status: None,
        };

        let item = convert_kube_crd_to_inventory(&crd, "cluster-a", collected_at);

        assert_eq!(item.cluster_id, "cluster-a");
        assert_eq!(item.name, "gadgets.example.com");
        assert!(item.labels.is_empty());
        assert!(item.annotations.is_empty());
        assert_eq!(item.group, "example.com");
        assert_eq!(item.scope, "Cluster");
        assert_eq!(item.kind, "Gadget");
        assert_eq!(item.plural, "gadgets");
        assert!(item.singular.is_none());
        assert!(item.short_names.is_empty());
        assert!(item.categories.is_empty());
        assert_eq!(item.preserve_unknown_fields, Some(true));
        assert!(item.stored_versions.is_empty());
        assert!(item.conditions.is_empty());
        assert!(item.created_at.is_none());
        assert_eq!(item.versions.len(), 1);
        assert_eq!(item.versions[0].name, "v1alpha1");
        assert!(item.versions[0].served);
        assert!(item.versions[0].storage);
        assert!(!item.versions[0].has_schema);
        assert!(!item.versions[0].has_status_subresource);
        assert_eq!(item.versions[0].additional_printer_columns_count, 0);
    }
}
