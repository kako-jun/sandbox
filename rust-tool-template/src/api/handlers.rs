use crate::core::AppLogic;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use warp::{Rejection, Reply};

/// 新しいデータを作成するリクエスト用構造体
#[derive(Deserialize)]
pub struct CreateDataRequest {
    /// データ名
    pub name: String,
    /// データの値
    pub value: i32,
}

/// データの更新リクエスト用構造体
#[derive(Deserialize)]
pub struct UpdateDataRequest {
    /// データ名（オプション）
    pub name: Option<String>,
    /// データの値（オプション）
    pub value: Option<i32>,
}

/// APIレスポンスの共通構造体
#[derive(Serialize)]
pub struct ApiResponse<T> {
    /// 成功フラグ
    pub success: bool,
    /// レスポンスデータ
    pub data: Option<T>,
    /// メッセージ
    pub message: Option<String>,
}

impl<T> ApiResponse<T> {
    /// 成功時のレスポンスを生成
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            message: None,
        }
    }

    /// エラー時のレスポンスを生成
    pub fn error(message: String) -> Self {
        Self {
            success: false,
            data: None,
            message: Some(message),
        }
    }
}

/// すべてのデータを取得するハンドラ
pub async fn get_all_data_handler(
    app_logic: Arc<Mutex<AppLogic>>,
) -> Result<impl Reply, Rejection> {
    let logic = app_logic.lock().unwrap();
    let data = logic.get_all_data().to_vec();
    Ok(warp::reply::json(&ApiResponse::success(data)))
}

/// データを追加するハンドラ
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

/// データを更新するハンドラ
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

/// データを削除するハンドラ
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

/// データを処理するハンドラ
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

/// 統計情報を取得するハンドラ
pub async fn get_stats_handler(app_logic: Arc<Mutex<AppLogic>>) -> Result<impl Reply, Rejection> {
    let logic = app_logic.lock().unwrap();
    let stats = logic.get_statistics();
    Ok(warp::reply::json(&ApiResponse::success(stats)))
}
