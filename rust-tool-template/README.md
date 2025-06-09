# Rust Tool Template (Enhanced)

A comprehensive CLI tool template built with modern Rust patterns, featuring enhanced error handling, internationalization, logging with rotation, and Docker support.

## Features

- **Enhanced Error Handling**: Robust error handling with anyhow, preventing application crashes
- **Internationalization**: Support for English and Japanese languages
- **Structured Logging**: Comprehensive logging with automatic rotation for Docker environments
- **Multi-Mode Operation**: CLI, TUI, and Web API interfaces with embedded API server
- **Embedded API Server**: Automatic background API server startup (no manual setup required)
- **Docker Support**: Ready for containerized deployment with proper log management
- **Modular Architecture**: Clean separation of concerns with dedicated modules

## Quick Start

### Prerequisites

- Rust 1.75 or later
- Docker (optional, for containerized deployment)

### Installation

1. Clone this repository:

```bash
git clone <repository-url>
cd rust-tool-template
```

2. Build the project:

```bash
cargo build --release
```

3. Run the application:

```bash
# Show usage examples (no arguments)
./target/release/rust-tool-template

# TUI mode (default)
./target/release/rust-tool-template -m tui

# CLI mode with Japanese language
./target/release/rust-tool-template -m cli -l ja -c list
```

## Usage

### Language Support

Set language using command line argument or environment variable:

```bash
# Command line argument
./target/release/rust-tool-template -l ja

# Environment variable
export RUST_TOOL_LANG=ja
./target/release/rust-tool-template

# Or using LANG environment variable (detects ja*)
export LANG=ja_JP.UTF-8
./target/release/rust-tool-template
```

### CLI Mode

The CLI mode supports various commands for data management:

```bash
# Add data entry (all arguments required)
./target/release/rust-tool-template -m cli -c add -n "item1" -v 100

# Interactive add (arguments optional, prompts for missing values)
./target/release/rust-tool-template -m cli -c interactive-add
./target/release/rust-tool-template -m cli -c interactive-add -n "preset-name"
./target/release/rust-tool-template -m cli -c interactive-add -v 200

# Batch add with defaults (creates 5 entries with incremental names/values)
./target/release/rust-tool-template -m cli -c batch-add
./target/release/rust-tool-template -m cli -c batch-add -n "product" -v 50

# List all entries
./target/release/rust-tool-template -m cli -c list

# Process data (with overflow protection)
./target/release/rust-tool-template -m cli -c process

# Show statistics
./target/release/rust-tool-template -m cli -c stats

# Show log directory information
./target/release/rust-tool-template -m cli -c log-info

# Show platform information
./target/release/rust-tool-template -m cli -c platform-info

# Japanese interface
./target/release/rust-tool-template -m cli -l ja -c list
```

### TUI Mode

Launch the interactive terminal interface:

```bash
./target/release/rust-tool-template -m tui
```

### Available Options

- `-m, --mode <MODE>`: Execution mode (cli, tui) [default: tui]
- `-c, --command <COMMAND>`: Command to execute (add, list, process, stats, interactive-add, batch-add)
- `-n, --name <NAME>`: Name for data entry (or base name for batch operations)
- `-v, --value <VALUE>`: Value for data entry (or base value for batch operations)
- `-l, --lang <LANG>`: Language (en, ja)
- `-h, --help`: Show help information

### Command Types

**Standard Commands (all arguments required):**

- `add`: Add single entry with specified name and value
- `list`: List all data entries
- `process`: Process all data with overflow protection
- `stats`: Display statistics

**Interactive Commands (arguments optional with defaults/prompts):**

- `interactive-add`: Add entry with interactive prompts for missing arguments
- `batch-add`: Add multiple entries with incremental names/values

### Embedded API Server

The application automatically starts an embedded API server in the background on available ports (3030-3034). This means:

- **No manual setup required**: API is available immediately when the app starts
- **Automatic port selection**: Finds the first available port in the range
- **Shared data access**: Both CLI/TUI and API access the same data
- **Graceful shutdown**: API server shuts down when the main application exits

API endpoints are available at `http://localhost:<port>/api/`:

- `GET /api/data` - List all data entries
- `POST /api/data` - Add new data entry
- `PUT /api/data/{id}` - Update data entry
- `DELETE /api/data/{id}` - Delete data entry
- `POST /api/process` - Process all data
- `GET /api/stats` - Get statistics

Example API usage:

```bash
# Add data via API (while app is running)
curl -X POST http://localhost:3030/api/data \
  -H "Content-Type: application/json" \
  -d '{"name": "test", "value": 123}'

# Get all data
curl http://localhost:3030/api/data

# Get statistics
curl http://localhost:3030/api/stats
```

## Error Handling & Logging

### Enhanced Error Handling

The application features comprehensive error handling that prevents crashes:

- **Overflow Protection**: Safe arithmetic operations with checked math
- **Input Validation**: Robust validation of user inputs
- **Graceful Degradation**: Fallback behaviors for error conditions
- **Error Chain Logging**: Full error context preservation

### Logging Features

- **Structured Logging**: Using tracing for detailed, structured logs
- **Automatic Rotation**: Daily log rotation with configurable retention
- **Docker-Optimized**: Proper log management for containerized environments
- **Multiple Outputs**: Both console and file logging
- **Log Levels**: Configurable via `RUST_LOG` environment variable

## Log Directory Locations

The application uses OS-specific standard directories for log storage:

**Linux:**

- Primary: `~/.local/share/rust-tool-template/logs` (XDG_DATA_HOME)
- Fallback: `~/.cache/rust-tool-template/logs` (XDG_CACHE_HOME)
- Config fallback: `~/.config/rust-tool-template/logs` (XDG_CONFIG_HOME)
- Legacy: `~/.rust-tool-template/logs`
- Final fallback: `./logs`

**macOS:**

- Primary: `~/Library/Application Support/rust-tool-template/logs`
- Fallback: `~/Library/Caches/rust-tool-template/logs`
- Config fallback: `~/Library/Preferences/rust-tool-template/logs`
- Legacy: `~/.rust-tool-template/logs`
- Final fallback: `./logs`

**Windows:**

- Primary: `%LOCALAPPDATA%\rust-tool-template\logs`
- Fallback: `%APPDATA%\rust-tool-template\logs`
- Legacy: `%USERPROFILE%\.rust-tool-template\logs`
- Final fallback: `.\logs`

**Docker containers:** `./logs` (inside container)

You can check your specific log directory with:

```bash
./target/release/rust-tool-template -m cli -c log-info
```

```bash
# Set log level
export RUST_LOG=rust_tool_template=debug
./target/release/rust-tool-template

# View logs
tail -f ~/.rust-tool-template/logs/rust-tool-template.*.log
```

## Docker Support

### Building and Running

```bash
# Build Docker image
docker build -t rust-tool-template .

# Run with English interface
docker run --rm rust-tool-template

# Run with Japanese interface
docker run --rm -e RUST_TOOL_LANG=ja rust-tool-template

# Run CLI mode
docker run --rm rust-tool-template /app/rust-tool-template -m cli -c stats

# Run with persistent logs
docker run --rm -v rust_logs:/app/logs rust-tool-template
```

### Docker Compose

Use the provided `compose.yaml` for easier management:

```bash
# Run English version
docker compose up rust-tool-template

# Run Japanese version
docker compose --profile japanese up rust-tool-template-ja

# Run in background
docker compose up -d

# View logs
docker compose logs -f rust-tool-template
```

### Log Management

The Docker setup includes comprehensive logging management:

#### Application Log Management

- **Persistent volumes** for application logs and data
- **Automatic log rotation** (daily, max 10 files)
- **Structured logging** with tracing framework
- **Configurable log levels** via environment variables

#### Docker Container Log Management

- **Container log rotation** (max 10MB per file, 5 files retained)
- **Log compression** to save disk space
- **JSON-file driver** for structured container logs
- **Prevents log disk exhaustion** in production environments

#### Security & Monitoring

- **Health checks** for container monitoring
- **Non-root user** for security
- **Graceful shutdown** handling

#### Global Docker Log Configuration

For system-wide container log management, configure Docker daemon:

1. Create or edit `/etc/docker/daemon.json` (Linux) or `~/.docker/daemon.json` (Docker Desktop):

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "5",
    "compress": "true"
  }
}
```

2. Restart Docker daemon:

```bash
sudo systemctl restart docker
```

See `docker-daemon-config-example.json` for a complete example.

#### Log Commands

```bash
# View application logs (inside container)
docker compose exec rust-tool-template tail -f /app/logs/rust-tool-template.*.log

# View Docker container logs
docker compose logs -f rust-tool-template

# View Docker container logs with timestamps
docker compose logs -f -t rust-tool-template

# Check log file sizes
docker compose exec rust-tool-template du -sh /app/logs/*

# Check Docker container log sizes
docker system df
docker inspect rust-tool-template | grep LogPath
```

## Architecture

### Project Structure

```
src/
├── main.rs              # Application entry point with error handling
├── lib.rs               # Library root
├── core/                # Core business logic
│   ├── mod.rs
│   └── logic.rs         # Enhanced with logging and error handling
├── cli/                 # Command-line interface
│   ├── mod.rs           # Multi-language support, usage examples
│   └── tui.rs
├── api/                 # Web API components
│   ├── mod.rs
│   └── handlers.rs
├── utils/               # Utility modules
│   ├── mod.rs
│   ├── i18n.rs          # Internationalization support
│   └── logging.rs       # Logging configuration and rotation
└── tauri/               # Desktop app integration
    ├── mod.rs
    └── commands.rs

locales/                 # Internationalization files
├── en/
│   └── messages.ftl     # English messages
└── ja/
    └── messages.ftl     # Japanese messages

Dockerfile               # Multi-stage Docker build
compose.yaml             # Container orchestration
```

### Core Components

- **Enhanced AppLogic**: Business logic with comprehensive logging and error handling
- **I18n Module**: Fluent-based internationalization with fallback support
- **Logging Module**: Structured logging with rotation and cleanup
- **CLI Module**: Multi-language command-line interface with usage examples
- **Docker Support**: Production-ready containerization

## Development

### Running Tests

```bash
# Run all tests
cargo test

# Run with logging output
RUST_LOG=debug cargo test -- --nocapture

# Test specific components
cargo test logging
cargo test i18n
```

### Adding New Languages

1. Create a new locale file: `locales/<lang>/messages.ftl`
2. Add message translations following the Fluent format
3. Update the language parser in `src/utils/i18n.rs`

Example for French (`locales/fr/messages.ftl`):

```fluent
app-name = Modèle d'Outil Rust
app-description = Un modèle d'outil CLI construit avec Rust
# ... add more translations
```

### Code Quality

```bash
# Format code
cargo fmt

# Run clippy
cargo clippy

# Check without building
cargo check
```

## Environment Variables

- `RUST_LOG`: Set logging level (e.g., `rust_tool_template=debug`)
- `RUST_TOOL_LANG`: Set language (en, ja)
- `LANG`: System language (detected for ja\* locales)
- `RUST_BACKTRACE`: Enable backtrace on panic (1 or full)

## Production Deployment

### Binary Deployment

```bash
# Build optimized binary
cargo build --release

# The binary includes all locale files
./target/release/rust-tool-template
```

### Docker Deployment

The included Dockerfile provides:

- **Multi-stage build** for optimal image size
- **Security hardening** with non-root user
- **Health checks** for monitoring
- **Persistent volumes** for data and logs
- **Proper signal handling** for graceful shutdown

```bash
# Production deployment
docker compose up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with appropriate tests
4. Add translations for new user-facing strings
5. Ensure all tests pass and logging is appropriate
6. Submit a pull request

## License

This project is provided as a template. Choose an appropriate license for your use case.

## Multi-Platform Support

This application is designed to work seamlessly across multiple platforms:

### Supported Platforms

- **Windows** (x86_64, ARM64)
- **macOS** (Intel, Apple Silicon)
- **Linux** (x86_64, ARM64, ARM)
- **Other Unix-like systems**

### Platform-Specific Features

**Windows:**

- Native Windows Console API integration
- Windows Registry access (when needed)
- Windows Services support
- Proper handling of Windows paths and separators

**macOS:**

- macOS Frameworks integration
- Cocoa support for native functionality
- Proper Apple Silicon (M1/M2) support
- Standard macOS directory structures

**Linux:**

- XDG Base Directory specification compliance
- systemd integration capabilities
- Unix signals handling
- File permissions management

**Cross-Platform:**

- Unicode support in all platforms
- Cross-platform TUI using ratatui/crossterm
- Consistent behavior across platforms
- Platform-appropriate file paths and configurations

### Build Targets

The project supports multiple build targets:

```bash
# Windows
cargo build --target x86_64-pc-windows-msvc
cargo build --target aarch64-pc-windows-msvc

# macOS
cargo build --target x86_64-apple-darwin
cargo build --target aarch64-apple-darwin

# Linux
cargo build --target x86_64-unknown-linux-gnu
cargo build --target aarch64-unknown-linux-gnu
cargo build --target arm-unknown-linux-gnueabihf
```

### Platform Information

You can check platform-specific information:

```bash
# Show detailed platform information
./target/release/rust-tool-template -m cli -c platform-info
```

This displays:

- Operating system and architecture
- Platform-specific features available
- Recommended file locations
- Platform capabilities

### Directory Conventions

The application follows platform-specific conventions for file storage:

- **Logs**: Platform-appropriate logging directories
- **Config**: Standard configuration locations per OS
- **Data**: Application data in OS-standard locations
- **Cache**: Temporary data in platform cache directories

## Features Checklist

- ✅ Enhanced error handling preventing crashes
- ✅ Internationalization (English/Japanese)
- ✅ Structured logging with rotation
- ✅ Docker support with volume management
- ✅ Usage examples when no arguments provided
- ✅ Multi-language CLI interface
- ✅ Comprehensive test coverage
- ✅ Production-ready containerization
- ✅ Security best practices
- ✅ Performance optimizations
- ✅ **Multi-platform support (Windows/macOS/Linux)**
- ✅ **Platform-specific optimizations**
- ✅ **Cross-platform TUI interface**

## Roadmap

- [ ] Additional language support
- [ ] Configuration file support
- [ ] Metrics and monitoring integration
- [ ] Advanced TUI features
- [ ] API authentication
- [ ] Plugin system
- [ ] CI/CD pipeline templates
