# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Workspace Package Names

This is a Cargo workspace with two packages:
- **Main package**: `rust-tool-template` (library: `rust_tool_template`)
- **Tauri package**: `rust-tool-template-app` (in `src-tauri/`)

⚠️ **Known Issue**: Tauri package has dependency conflicts with `indexmap` versions. Build main package individually.

## Build Commands

```bash
# Build main package (recommended)
cargo build -p rust-tool-template                # Debug build
cargo build -p rust-tool-template --release      # Release build
cargo build -p rust-tool-template --features web # Build with web features

# Run the application
cargo run -p rust-tool-template                      # Run in default TUI mode
cargo run -p rust-tool-template -- -m cli           # Run in CLI mode
cargo run -p rust-tool-template -- -m cli -c list   # Run specific CLI command

# Testing
cargo test -p rust-tool-template                     # Run all tests
cargo test -p rust-tool-template unit_tests          # Run unit tests only
cargo test -p rust-tool-template integration_tests   # Run integration tests only
cargo test -p rust-tool-template -- --nocapture     # Show print statements during tests

# Code quality
cargo clippy -p rust-tool-template   # Run linter on main package
cargo fmt                           # Format code

# Tauri desktop application (currently has dependency conflicts)
cargo build -p rust-tool-template-app  # May fail due to indexmap conflict
# Workaround: Update Tauri version or resolve dependency conflicts
```

## Architecture Overview

This is a multi-interface Rust application with a **layered architecture**:

```
Interfaces Layer:     CLI/TUI ←→ Web API ←→ Tauri GUI
                             ↓
Core Logic Layer:     AppLogic (business logic)
                             ↓
Infrastructure:       Config, Logging, I18n, Platform Utils
```

**Key modules:**
- `src/core/logic.rs` - Main business logic with CRUD operations and statistics
- `src/cli/mod.rs` - Command-line interface with argument parsing
- `src/api/handlers.rs` - HTTP API endpoints
- `src/tauri/commands.rs` - Desktop app commands
- `src/i18n.rs` - Internationalization support (English/Japanese)

## Application Modes

The application supports three execution modes:
1. **TUI Mode** (default): Interactive terminal interface using `ratatui`
2. **CLI Mode**: Command-line with subcommands (add, list, process, stats)
3. **API Server Mode**: RESTful HTTP API on ports 3030-3034

## Key Features

- **Multi-platform support**: Windows, macOS, Linux with platform-specific utilities
- **Internationalization**: Fluent-based i18n with English/Japanese support
- **Comprehensive logging**: Structured logging with rotation and filtering
- **Error handling**: Uses `anyhow` for error propagation and `thiserror` for error definitions
- **Async runtime**: Built on `tokio` for async operations

## Configuration

- **Clippy**: MSRV 1.70.0, complexity threshold 30, 7 function arguments max
- **Coverage target**: 80% as configured in `codecov.yml`
- **Feature flags**: `tui` (default), `gui`, `web`

## Development Notes

- **Main entry point**: `src/main.rs` with async main function that calls `rust_tool_template::cli::run().await`
- **Business logic**: Centralized in `AppLogic` struct in `src/core/logic.rs`
- **Architecture pattern**: All interfaces (CLI, TUI, API, GUI) delegate to the same core logic
- **Thread safety**: Uses `Arc<Mutex<AppLogic>>` for shared state across interfaces
- **Package naming**: Library uses underscores (`rust_tool_template`), package uses hyphens (`rust-tool-template`)
- **Language setting**: Controlled via `RUST_TOOL_LANG` or `LANG` environment variables
- **Logging**: Level controlled via `RUST_LOG` environment variable

## VSCode Debug Setup

Three debug configurations are available:
1. **"Rust CLI"** - Main application (F5 default)
2. **"Tauri Dev"** - Desktop app (currently broken due to dependency conflict)
3. **"Debug Rust Tool Template"** - Alternative cargo-based debug

Tasks are configured to build appropriate packages before debugging.

## Testing Strategy

- Unit tests in individual modules using `#[cfg(test)]`
- Integration tests in `tests/` directory
- API testing uses mock data and temporary files
- Async tests use `tokio-test` for proper async testing