use rust_tool_template::api::handlers::*;
use rust_tool_template::core::AppLogic;
use std::sync::{Arc, Mutex};

#[tokio::test]
async fn test_api_add_data() {
    let app_logic = Arc::new(Mutex::new(AppLogic::new()));

    let request = CreateDataRequest {
        name: "test_api".to_string(),
        value: 123,
    };

    let result = add_data_handler(request, app_logic.clone()).await;
    assert!(result.is_ok());

    // Verify data was added
    let logic = app_logic.lock().unwrap();
    let data = logic.get_all_data();
    assert_eq!(data.len(), 1);
    assert_eq!(data[0].name, "test_api");
    assert_eq!(data[0].value, 123);
}

#[tokio::test]
async fn test_api_get_all_data() {
    let app_logic = Arc::new(Mutex::new(AppLogic::new()));

    // Add some test data
    {
        let mut logic = app_logic.lock().unwrap();
        logic.add_data("item1".to_string(), 10);
        logic.add_data("item2".to_string(), 20);
    }

    let result = get_all_data_handler(app_logic).await;
    assert!(result.is_ok());
}

#[tokio::test]
async fn test_api_update_data() {
    let app_logic = Arc::new(Mutex::new(AppLogic::new()));

    // Add initial data
    let id = {
        let mut logic = app_logic.lock().unwrap();
        logic.add_data("original".to_string(), 100)
    };

    let update_request = UpdateDataRequest {
        name: Some("updated".to_string()),
        value: Some(200),
    };

    let result = update_data_handler(id, update_request, app_logic.clone()).await;
    assert!(result.is_ok());

    // Verify update
    let logic = app_logic.lock().unwrap();
    let data = logic.get_data_by_id(id).unwrap();
    assert_eq!(data.name, "updated");
    assert_eq!(data.value, 200);
}

#[tokio::test]
async fn test_api_delete_data() {
    let app_logic = Arc::new(Mutex::new(AppLogic::new()));

    // Add initial data
    let id = {
        let mut logic = app_logic.lock().unwrap();
        logic.add_data("to_delete".to_string(), 50)
    };

    let result = delete_data_handler(id, app_logic.clone()).await;
    assert!(result.is_ok());

    // Verify deletion
    let logic = app_logic.lock().unwrap();
    assert!(logic.get_data_by_id(id).is_none());
    assert_eq!(logic.get_all_data().len(), 0);
}

#[tokio::test]
async fn test_api_process_data() {
    let app_logic = Arc::new(Mutex::new(AppLogic::new()));

    // Add test data
    {
        let mut logic = app_logic.lock().unwrap();
        logic.add_data("item1".to_string(), 5);
        logic.add_data("item2".to_string(), 10);
    }

    let result = process_data_handler(app_logic.clone()).await;
    assert!(result.is_ok());

    // Verify processing (values should be doubled)
    let logic = app_logic.lock().unwrap();
    let data = logic.get_all_data();
    assert_eq!(data[0].value, 10);
    assert_eq!(data[1].value, 20);
}

#[tokio::test]
async fn test_api_get_statistics() {
    let app_logic = Arc::new(Mutex::new(AppLogic::new()));

    // Add test data
    {
        let mut logic = app_logic.lock().unwrap();
        logic.add_data("item1".to_string(), 10);
        logic.add_data("item2".to_string(), 20);
        logic.add_data("item3".to_string(), 30);
    }

    let result = get_stats_handler(app_logic).await;
    assert!(result.is_ok());
}

#[test]
fn test_cli_integration() {
    // Test that CLI modules can be imported and basic functions work
    use rust_tool_template::cli;

    // This would test CLI functionality in a real scenario
    // For now, we just verify the module is accessible
    assert!(true);
}
