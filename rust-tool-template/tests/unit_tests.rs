//! Unit tests for the Rust tool template.
//! 
//! These tests verify the functionality of individual components
//! in isolation.

use rust_tool_template::core::AppLogic;

#[test]
fn test_app_logic_creation() {
    let logic = AppLogic::new();
    assert_eq!(logic.get_all_data().len(), 0);
}

#[test]
fn test_add_and_get_data() {
    let mut logic = AppLogic::new();
    let id = logic.add_data("test_item".to_string(), 42);

    let data = logic.get_data_by_id(id);
    assert!(data.is_some());

    let data = data.unwrap();
    assert_eq!(data.id, id);
    assert_eq!(data.name, "test_item");
    assert_eq!(data.value, 42);
}

#[test]
fn test_update_data() {
    let mut logic = AppLogic::new();
    let id = logic.add_data("original".to_string(), 100);

    let success = logic.update_data(id, Some("updated".to_string()), Some(200));
    assert!(success);

    let data = logic.get_data_by_id(id).unwrap();
    assert_eq!(data.name, "updated");
    assert_eq!(data.value, 200);
}

#[test]
fn test_delete_data() {
    let mut logic = AppLogic::new();
    let id = logic.add_data("to_delete".to_string(), 50);

    assert!(logic.get_data_by_id(id).is_some());

    let success = logic.delete_data(id);
    assert!(success);

    assert!(logic.get_data_by_id(id).is_none());
    assert_eq!(logic.get_all_data().len(), 0);
}

#[test]
fn test_statistics() {
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
}

#[test]
fn test_process_data() {
    let mut logic = AppLogic::new();
    logic.add_data("item1".to_string(), 5);
    logic.add_data("item2".to_string(), 10);

    let result = logic.process_data();
    assert!(result.is_ok());

    // Values should be doubled after processing
    let data = logic.get_all_data();
    assert_eq!(data[0].value, 10);
    assert_eq!(data[1].value, 20);
}
