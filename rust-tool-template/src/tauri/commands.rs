use crate::core::{AppData, AppLogic};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tauri::{command, State};
use tracing::{info, warn};

// Tauriアプリケーションの状態を管理する構造体
pub struct AppState {
    pub logic: Arc<Mutex<AppLogic>>,
    pub api_port: Option<u16>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            logic: Arc::new(Mutex::new(AppLogic::new())),
            api_port: None,
        }
    }

    pub fn set_api_port(&mut self, port: u16) {
        self.api_port = Some(port);
        info!("Tauri app can access API server on port {}", port);
    }
}

#[command]
pub fn get_all_data(state: State<AppState>) -> Vec<AppData> {
    let logic = state.logic.lock().unwrap();
    logic.get_all_data().to_vec()
}

#[command]
pub fn add_data(state: State<AppState>, name: String, value: i32) -> u32 {
    let mut logic = state.logic.lock().unwrap();
    let id = logic.add_data(name.clone(), value);
    info!(
        "Tauri: Added data entry via command - name: {}, value: {}, id: {}",
        name, value, id
    );
    id
}

#[command]
pub fn update_data(
    state: State<AppState>,
    id: u32,
    name: Option<String>,
    value: Option<i32>,
) -> bool {
    let mut logic = state.logic.lock().unwrap();
    let result = logic.update_data(id, name.clone(), value);
    if result {
        info!("Tauri: Updated data entry {} via command", id);
    } else {
        warn!("Tauri: Failed to update non-existent data entry {}", id);
    }
    result
}

#[command]
pub fn delete_data(state: State<AppState>, id: u32) -> bool {
    let mut logic = state.logic.lock().unwrap();
    let result = logic.delete_data(id);
    if result {
        info!("Tauri: Deleted data entry {} via command", id);
    } else {
        warn!("Tauri: Failed to delete non-existent data entry {}", id);
    }
    result
}

#[command]
pub fn get_statistics(state: State<AppState>) -> HashMap<String, serde_json::Value> {
    let logic = state.logic.lock().unwrap();
    logic.get_statistics()
}

#[command]
pub fn process_data(state: State<AppState>) -> Result<String, String> {
    let mut logic = state.logic.lock().unwrap();
    match logic.process_data() {
        Ok(result) => {
            info!("Tauri: Data processing completed successfully via command");
            Ok(result)
        }
        Err(e) => {
            warn!("Tauri: Data processing failed via command: {}", e);
            Err(e.to_string())
        }
    }
}

#[command]
pub fn get_api_info(state: State<AppState>) -> Option<String> {
    state
        .api_port
        .map(|port| format!("http://localhost:{}", port))
}

#[command]
pub fn interactive_add_data(
    state: State<AppState>,
    name: Option<String>,
    value: Option<i32>,
    category: Option<String>,
) -> Result<u32, String> {
    let mut logic = state.logic.lock().unwrap();

    // Use provided values or defaults
    let final_name = name.unwrap_or_else(|| "default-item".to_string());
    let final_value = value.unwrap_or(100);

    let id = logic.add_data(final_name.clone(), final_value);

    // Add metadata if category is provided
    if let Some(cat) = category {
        if !cat.is_empty() {
            // Note: This would require extending AppData to support metadata
            info!("Tauri: Would add category '{}' to entry {}", cat, id);
        }
    }

    info!(
        "Tauri: Interactive add - name: {}, value: {}, id: {}",
        final_name, final_value, id
    );

    Ok(id)
}

#[command]
pub fn batch_add_data(
    state: State<AppState>,
    base_name: Option<String>,
    base_value: Option<i32>,
    count: Option<usize>,
) -> Result<Vec<u32>, String> {
    let mut logic = state.logic.lock().unwrap();

    // Use provided values or defaults
    let final_base_name = base_name.unwrap_or_else(|| "item".to_string());
    let final_base_value = base_value.unwrap_or(10);
    let final_count = count.unwrap_or(5);

    let mut added_ids = Vec::new();

    for i in 1..=final_count {
        let name = format!("{}-{}", final_base_name, i);
        let value = final_base_value * i as i32;
        let id = logic.add_data(name.clone(), value);
        added_ids.push(id);

        info!(
            "Tauri: Batch add entry {}: name={}, value={}, id={}",
            i, name, value, id
        );
    }

    info!("Tauri: Batch add completed, {} entries added", final_count);
    Ok(added_ids)
}

#[command]
pub fn example_command(param: String) -> String {
    // Legacy example command for compatibility
    format!("Received parameter: {}", param)
}
