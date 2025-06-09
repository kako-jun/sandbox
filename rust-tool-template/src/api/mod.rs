pub mod handlers;

pub use handlers::*;

use crate::core::AppLogic;
use std::sync::{Arc, Mutex};
use warp::Filter;

pub async fn start_server(port: u16) -> Result<(), Box<dyn std::error::Error>> {
    let app_logic = Arc::new(Mutex::new(AppLogic::new()));
    let cors = warp::cors()
        .allow_any_origin()
        .allow_headers(vec!["content-type"])
        .allow_methods(vec!["GET", "POST", "PUT", "DELETE"]);

    let api = warp::path("api");

    let app_logic_filter = warp::any().map(move || app_logic.clone());

    let get_data = api
        .and(warp::path("data"))
        .and(warp::get())
        .and(app_logic_filter.clone())
        .and_then(get_all_data_handler);

    let add_data = api
        .and(warp::path("data"))
        .and(warp::post())
        .and(warp::body::json())
        .and(app_logic_filter.clone())
        .and_then(add_data_handler);

    let update_data = api
        .and(warp::path("data"))
        .and(warp::path::param::<u32>())
        .and(warp::put())
        .and(warp::body::json())
        .and(app_logic_filter.clone())
        .and_then(update_data_handler);

    let delete_data = api
        .and(warp::path("data"))
        .and(warp::path::param::<u32>())
        .and(warp::delete())
        .and(app_logic_filter.clone())
        .and_then(delete_data_handler);

    let process_data = api
        .and(warp::path("process"))
        .and(warp::post())
        .and(app_logic_filter.clone())
        .and_then(process_data_handler);

    let get_stats = api
        .and(warp::path("stats"))
        .and(warp::get())
        .and(app_logic_filter.clone())
        .and_then(get_stats_handler);

    let routes = get_data
        .or(add_data)
        .or(update_data)
        .or(delete_data)
        .or(process_data)
        .or(get_stats)
        .with(cors);

    println!("Starting server at http://localhost:{}", port);
    warp::serve(routes).run(([127, 0, 0, 1], port)).await;

    Ok(())
}
