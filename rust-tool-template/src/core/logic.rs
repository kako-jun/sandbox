use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tracing::{debug, info, warn};

/// Sample data structure for the application
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct AppData {
    pub id: u32,
    pub name: String,
    pub value: i32,
    pub metadata: HashMap<String, String>,
}

impl AppData {
    /// Create a new AppData instance
    pub fn new(id: u32, name: String, value: i32) -> Self {
        Self {
            id,
            name,
            value,
            metadata: HashMap::new(),
        }
    }

    /// Add metadata to the data entry
    pub fn add_metadata(&mut self, key: String, value: String) {
        self.metadata.insert(key, value);
    }

    /// Get metadata value by key
    pub fn get_metadata(&self, key: &str) -> Option<&String> {
        self.metadata.get(key)
    }
}

/// Core application logic
pub struct AppLogic {
    data: Vec<AppData>,
    next_id: u32,
}

impl Default for AppLogic {
    fn default() -> Self {
        Self::new()
    }
}

impl AppLogic {
    /// Create a new instance of AppLogic
    pub fn new() -> Self {
        Self {
            data: Vec::new(),
            next_id: 1,
        }
    }

    /// Add new data entry
    pub fn add_data(&mut self, name: String, value: i32) -> u32 {
        let id = self.next_id;
        self.next_id += 1;

        let data = AppData {
            id,
            name: name.clone(),
            value,
            metadata: HashMap::new(),
        };

        self.data.push(data);
        debug!(
            "Added data entry: id={}, name='{}', value={}",
            id, name, value
        );
        id
    }

    /// Get all data entries
    pub fn get_all_data(&self) -> &[AppData] {
        &self.data
    }

    /// Get data by ID
    pub fn get_data_by_id(&self, id: u32) -> Option<&AppData> {
        self.data.iter().find(|d| d.id == id)
    }

    /// Update data entry
    pub fn update_data(&mut self, id: u32, name: Option<String>, value: Option<i32>) -> bool {
        if let Some(data) = self.data.iter_mut().find(|d| d.id == id) {
            let old_name = data.name.clone();
            let old_value = data.value;

            if let Some(name) = name {
                data.name = name;
            }
            if let Some(value) = value {
                data.value = value;
            }

            debug!(
                "Updated data entry: id={}, name: '{}' -> '{}', value: {} -> {}",
                id, old_name, data.name, old_value, data.value
            );
            true
        } else {
            warn!("Attempted to update non-existent data entry with id={}", id);
            false
        }
    }

    /// Delete data entry
    pub fn delete_data(&mut self, id: u32) -> bool {
        if let Some(pos) = self.data.iter().position(|d| d.id == id) {
            let removed_data = self.data.remove(pos);
            debug!(
                "Deleted data entry: id={}, name='{}', value={}",
                id, removed_data.name, removed_data.value
            );
            true
        } else {
            warn!("Attempted to delete non-existent data entry with id={}", id);
            false
        }
    }

    /// Get statistics
    pub fn get_statistics(&self) -> HashMap<String, serde_json::Value> {
        use serde_json::{Number, Value};

        let total_count = self.data.len();
        let mut stats = HashMap::from([(
            "total_count".to_string(),
            Value::Number(Number::from(total_count)),
        )]);

        if !self.data.is_empty() {
            let sum: i64 = self.data.iter().map(|d| d.value as i64).sum();
            let avg = sum as f64 / total_count as f64;

            stats.extend([
                ("sum_value".to_string(), Value::Number(Number::from(sum))),
                (
                    "avg_value".to_string(),
                    Value::Number(Number::from_f64(avg).unwrap_or(Number::from(0))),
                ),
            ]);

            // Find min and max values
            if let (Some(min_val), Some(max_val)) = (
                self.data.iter().map(|d| d.value).min(),
                self.data.iter().map(|d| d.value).max(),
            ) {
                stats.extend([
                    (
                        "min_value".to_string(),
                        Value::Number(Number::from(min_val)),
                    ),
                    (
                        "max_value".to_string(),
                        Value::Number(Number::from(max_val)),
                    ),
                ]);
            }
        }

        stats
    }

    /// Sample processing function - using anyhow::Result for better error handling
    pub fn process_data(&mut self) -> Result<String> {
        let entry_count = self.data.len();
        info!("Starting data processing for {} entries", entry_count);

        // Sample processing logic with overflow protection
        for data in &mut self.data {
            let old_value = data.value;
            data.value = data.value.checked_mul(2).ok_or_else(|| {
                let error_msg = format!("Integer overflow when processing data ID {}", data.id);
                warn!("{}", error_msg);
                anyhow::anyhow!(error_msg)
            })?;

            debug!(
                "Processed data entry: id={}, value: {} -> {}",
                data.id, old_value, data.value
            );
        }

        let result_msg = format!("Processed {} entries", entry_count);
        info!("{}", result_msg);
        Ok(result_msg)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add_data() {
        let mut logic = AppLogic::new();
        let id = logic.add_data("test".to_string(), 100);
        assert_eq!(id, 1);
        assert_eq!(logic.get_all_data().len(), 1);
    }

    #[test]
    fn test_get_data_by_id() {
        let mut logic = AppLogic::new();
        let id = logic.add_data("test".to_string(), 100);
        let data = logic.get_data_by_id(id);
        assert!(data.is_some());
        assert_eq!(data.unwrap().name, "test");
    }

    #[test]
    fn test_update_data() {
        let mut logic = AppLogic::new();
        let id = logic.add_data("test".to_string(), 100);
        let result = logic.update_data(id, Some("updated".to_string()), Some(200));
        assert!(result);

        let data = logic.get_data_by_id(id).unwrap();
        assert_eq!(data.name, "updated");
        assert_eq!(data.value, 200);
    }

    #[test]
    fn test_delete_data() {
        let mut logic = AppLogic::new();
        let id = logic.add_data("test".to_string(), 100);
        let result = logic.delete_data(id);
        assert!(result);
        assert_eq!(logic.get_all_data().len(), 0);
    }

    #[test]
    fn test_enhanced_statistics() {
        let mut logic = AppLogic::new();
        logic.add_data("item1".to_string(), 10);
        logic.add_data("item2".to_string(), 20);
        logic.add_data("item3".to_string(), 30);

        let stats = logic.get_statistics();

        assert_eq!(
            stats["total_count"],
            serde_json::Value::Number(serde_json::Number::from(3))
        );
        assert_eq!(
            stats["sum_value"],
            serde_json::Value::Number(serde_json::Number::from(60))
        );
        assert_eq!(
            stats["avg_value"],
            serde_json::Value::Number(serde_json::Number::from_f64(20.0).unwrap())
        );
        assert_eq!(
            stats["min_value"],
            serde_json::Value::Number(serde_json::Number::from(10))
        );
        assert_eq!(
            stats["max_value"],
            serde_json::Value::Number(serde_json::Number::from(30))
        );
    }

    #[test]
    fn test_process_data_overflow_protection() {
        let mut logic = AppLogic::new();
        logic.add_data("max_value".to_string(), i32::MAX);

        let result = logic.process_data();
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Integer overflow"));
    }

    #[test]
    fn test_app_data_methods() {
        let mut data = AppData::new(1, "test".to_string(), 100);

        data.add_metadata("key1".to_string(), "value1".to_string());
        data.add_metadata("key2".to_string(), "value2".to_string());

        assert_eq!(data.get_metadata("key1"), Some(&"value1".to_string()));
        assert_eq!(data.get_metadata("key2"), Some(&"value2".to_string()));
        assert_eq!(data.get_metadata("nonexistent"), None);
    }
}
