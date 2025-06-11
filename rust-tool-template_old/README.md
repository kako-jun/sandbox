# Rust Tool Template

[![Tests](https://github.com/yourusername/rust-tool-template/actions/workflows/tests.yml/badge.svg)](https://github.com/yourusername/rust-tool-template/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/yourusername/rust-tool-template/branch/main/graph/badge.svg)](https://codecov.io/gh/yourusername/rust-tool-template)
[![Rust Version](https://img.shields.io/badge/rust-1.70.0+-blue.svg)](https://www.rust-lang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive template for Rust applications with the following features:

- Command-line interface with subcommand support
- Text-based user interface (TUI)
- Internationalization (i18n) support
- Logging system (with rotation and container support)
- Platform-specific features
- API server functionality
- Configuration management
- Error handling

## Requirements

- Rust 1.70.0 or higher
- Cargo
- Other dependencies (see Cargo.toml)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/rust-tool-template.git
cd rust-tool-template

# Build
cargo build --release

# Install (optional)
cargo install --path .
```

## Usage

### Command-line Interface

```bash
# Show help
rust-tool-template --help

# Show configuration
rust-tool-template config show

# Change configuration
rust-tool-template config set <key> <value>

# Start API server
rust-tool-template api start

# Stop API server
rust-tool-template api stop
```

### API Server

The API server provides the following endpoints:

- `GET /api/hello`: Health check
- `POST /api/echo`: Echo endpoint

## Logging System

- Logs are output to the standard directory for each OS by default.
- Log files are rotated (default: daily, max 10 files) to prevent excessive growth.
- In Docker or container environments, console output is automatically minimized to reduce log size.
- The following environment variables can be used to control behavior:

| Environment Variable | Description                          | Default Value |
|----------------------|--------------------------------------|---------------|
| LOG_ROTATION         | Log rotation interval (DAILY, etc.)  | DAILY         |
| LOG_MAX_FILES        | Number of log files to retain        | 10            |
| LOG_BUFFER_SIZE      | Log buffer size (bytes)              | 8192          |
| RUST_LOG             | Log level (info, debug, etc.)        | info          |

#### Docker Usage Example

```dockerfile
FROM rust:1.70 as builder
WORKDIR /usr/src/app
COPY . .
RUN cargo build --release

FROM debian:bullseye-slim
COPY --from=builder /usr/src/app/target/release/myapp /usr/local/bin/myapp
ENV LOG_ROTATION=HOURLY
ENV LOG_MAX_FILES=5
ENV LOG_BUFFER_SIZE=16384
ENV RUST_LOG=info
CMD ["myapp"]
```

## Development

### Testing

```bash
# Run all tests
cargo test

# Show detailed test output
cargo test -- --nocapture

# Run specific test
cargo test <test_name>

# Generate test coverage
cargo tarpaulin
```

### Linting

```bash
# Check code quality
cargo clippy

# Format code
cargo fmt
```

## Project Structure

```
src/
├── api.rs      # API server functionality
├── cli.rs      # Command-line interface
├── config.rs   # Configuration management
├── core.rs     # Core business logic
├── error.rs    # Error handling
├── i18n.rs     # Internationalization support
├── lib.rs      # Library entry point
├── logging.rs  # Logging system
├── main.rs     # Application entry point
├── platform.rs # Platform-specific features
└── utils.rs    # Utility functions
```

## Key Dependencies

- [tracing](https://crates.io/crates/tracing)
- [tracing-subscriber](https://crates.io/crates/tracing-subscriber)
- [tracing-appender](https://crates.io/crates/tracing-appender)
- [tempfile](https://crates.io/crates/tempfile)
- [clap](https://github.com/clap-rs/clap)
- [actix-web](https://actix.rs/)
- [serde](https://serde.rs/)
- [tokio](https://tokio.rs/)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork this repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## Author

Your Name <your.email@example.com>

## Acknowledgments

- [Rust](https://www.rust-lang.org/)
- [Cargo](https://doc.rust-lang.org/cargo/)
- [Clap](https://github.com/clap-rs/clap)
- [Actix Web](https://actix.rs/)
- [Serde](https://serde.rs/)
- [Tokio](https://tokio.rs/)
- [tracing](https://crates.io/crates/tracing)
- [tracing-subscriber](https://crates.io/crates/tracing-subscriber)
- [tracing-appender](https://crates.io/crates/tracing-appender)
- [tempfile](https://crates.io/crates/tempfile)
