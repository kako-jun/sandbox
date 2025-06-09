use crate::core::{AppData, AppLogic};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use warp::{Rejection, Reply};

#[derive(Deserialize)]
pub struct CreateDataRequest {
    pub name: String,
    pub value: i32,
}

#[derive(Deserialize)]
pub struct UpdateDataRequest {
    pub name: Option<String>,
    pub value: Option<i32>,
}

#[derive(Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub message: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            message: None,
        }
    }

    pub fn error(message: String) -> Self {
        Self {
            success: false,
            data: None,
            message: Some(message),
        }
    }
}

pub async fn get_all_data_handler(
    app_logic: Arc<Mutex<AppLogic>>,
) -> Result<impl Reply, Rejection> {
    let logic = app_logic.lock().unwrap();
    let data = logic.get_all_data().to_vec();
    Ok(warp::reply::json(&ApiResponse::success(data)))
}

pub async fn add_data_handler(
    request: CreateDataRequest,
    app_logic: Arc<Mutex<AppLogic>>,
) -> Result<impl Reply, Rejection> {
    let mut logic = app_logic.lock().unwrap();
    let id = logic.add_data(request.name, request.value);

    let response = HashMap::from([(
        "id".to_string(),
        serde_json::Value::Number(serde_json::Number::from(id)),
    )]);

    Ok(warp::reply::json(&ApiResponse::success(response)))
}

pub async fn update_data_handler(
    id: u32,
    request: UpdateDataRequest,
    app_logic: Arc<Mutex<AppLogic>>,
) -> Result<impl Reply, Rejection> {
    let mut logic = app_logic.lock().unwrap();
    let success = logic.update_data(id, request.name, request.value);

    if success {
        if let Some(data) = logic.get_data_by_id(id) {
            Ok(warp::reply::json(&ApiResponse::success(data.clone())))
        } else {
            Ok(warp::reply::json(&ApiResponse::<()>::error(
                "Data not found after update".to_string(),
            )))
        }
    } else {
        Ok(warp::reply::json(&ApiResponse::<()>::error(
            "Data not found".to_string(),
        )))
    }
}

pub async fn delete_data_handler(
    id: u32,
    app_logic: Arc<Mutex<AppLogic>>,
) -> Result<impl Reply, Rejection> {
    let mut logic = app_logic.lock().unwrap();
    let success = logic.delete_data(id);

    if success {
        let response = HashMap::from([(
            "deleted_id".to_string(),
            serde_json::Value::Number(serde_json::Number::from(id)),
        )]);
        Ok(warp::reply::json(&ApiResponse::success(response)))
    } else {
        Ok(warp::reply::json(&ApiResponse::<()>::error(
            "Data not found".to_string(),
        )))
    }
}

pub async fn process_data_handler(
    app_logic: Arc<Mutex<AppLogic>>,
) -> Result<impl Reply, Rejection> {
    let mut logic = app_logic.lock().unwrap();
    match logic.process_data() {
        Ok(result) => {
            let response =
                HashMap::from([("message".to_string(), serde_json::Value::String(result))]);
            Ok(warp::reply::json(&ApiResponse::success(response)))
        }
        Err(e) => Ok(warp::reply::json(&ApiResponse::<()>::error(e.to_string()))),
    }
}

pub async fn get_stats_handler(app_logic: Arc<Mutex<AppLogic>>) -> Result<impl Reply, Rejection> {
    let logic = app_logic.lock().unwrap();
    let stats = logic.get_statistics();
    Ok(warp::reply::json(&ApiResponse::success(stats)))
}
