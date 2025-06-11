/*! 
 * Rust Tool Template
 * 
 * CUIとGUIの両方をサポートするRustアプリケーションのテンプレート
 */

pub mod core;
pub mod cli;
pub mod error;
pub mod utils;

#[cfg(feature = "gui")]
pub mod tauri;

// よく使用される型をre-export
pub use crate::core::AppCore;
pub use crate::error::{AppError, Result};