//! Rust Tool Template
//! 
//! A template for building Rust command-line tools with the following features:
//! - Command-line interface with subcommands
//! - Text-based user interface (TUI)
//! - Internationalization (i18n) support
//! - Logging system
//! - Platform-specific functionality
//! - API server capabilities

/// API-related functionality for the application
pub mod api;

/// Command-line interface implementation
pub mod cli;

/// Core business logic
pub mod core;

/// Utility functions and helpers
pub mod utils;

pub use core::*;
