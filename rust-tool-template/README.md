# Rust Tool Template

[![CI](https://github.com/kako-jun/rust-tool-template/actions/workflows/ci.yml/badge.svg)](https://github.com/kako-jun/rust-tool-template/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A template for creating Rust CLI/GUI applications with Tauri and TUI support.

## Features

- **Dual Interface**: Support both CLI (TUI-based) and GUI (Tauri-based) modes
- **Cross-platform**: Works on Linux, Windows, and macOS
- **Internationalization**: English and Japanese language support
- **Configuration Management**: Persistent settings with TOML format
- **Logging System**: Structured logging with daily rotation
- **Error Handling**: Comprehensive error management
- **Development Ready**: DevContainer, VS Code, and CI/CD configured

## Getting Started

### Prerequisites

- Rust 1.60+
- Node.js 18+ (for Tauri GUI mode)
- System dependencies for GUI development (see DevContainer setup)

### Installation

1. Clone this repository:
```bash
git clone https://github.com/kako-jun/rust-tool-template.git
cd rust-tool-template
```

2. Build the project:
```bash
cargo build
```

### Usage

#### CLI Mode (Default)
```bash
# Run in CLI mode
cargo run -- --cli

# Or force CLI mode
cargo run -- --cli --lang ja --log-level debug
```

#### GUI Mode (Tauri)
```bash
# Development mode
cargo tauri dev

# Build for production
cargo tauri build
```

#### Command Line Options

- `--cli`, `-c`: Force CLI mode instead of GUI
- `--lang <LANG>`, `-l <LANG>`: Set language (en, ja)
- `--log-level <LEVEL>`: Set log level (debug, info, warn, error)

## Development

### DevContainer Setup

This project includes a complete DevContainer setup for consistent development environment:

1. Open in VS Code
2. Install the "Dev Containers" extension
3. Open Command Palette and select "Dev Containers: Reopen in Container"

### VS Code Integration

#### Keyboard Shortcuts
- **F5**: Launch Tauri development server (Default)
- **Ctrl+F5**: Run Demo Mode  
- **Shift+F5**: Run CLI/TUI Mode

#### Debug Configurations (F5 Menu)
- 🚀 **Launch Tauri Dev (F5 Default)**: Main Tauri development server
- 🖥️ **Launch CLI (TUI)**: Terminal-based interface with debugger
- 🎮 **Launch Demo Mode**: Quick demo with debugger
- 🌐 **Launch GUI (Direct)**: Direct GUI launch with debugger

#### Tasks (Ctrl+Shift+P → "Tasks: Run Task")
- 🚀 **Tauri: dev (Default)**: Launch development server
- 🎮 **Run Demo Mode**: Demo mode execution
- 🖥️ **Run CLI (TUI)**: CLI mode execution
- 🔨 **Cargo: build**: Standard build
- 🧪 **Cargo: test**: Run tests
- 📎 **Cargo: clippy**: Linting
- 📦 **Tauri: build**: Production build

### Project Structure

```
src/
├── core/           # Shared application logic
├── cli/            # TUI-based CLI interface
├── tauri/          # Tauri GUI commands
├── utils/          # Utility modules (logging, i18n, platform)
├── error.rs        # Error handling
├── lib.rs          # Library root
└── main.rs         # Application entry point

locales/            # Internationalization files
├── en/messages.ftl # English messages
└── ja/messages.ftl # Japanese messages

tests/              # Test files
├── integration_tests.rs
└── unit_tests.rs

.devcontainer/      # DevContainer configuration
.github/workflows/  # CI/CD workflows
.vscode/           # VS Code settings
```

### Architecture

The application follows a modular architecture:

- **Core Module**: Contains shared business logic between CLI and GUI
- **CLI Module**: Implements TUI-based interface using ratatui
- **Tauri Module**: Provides commands for GUI frontend
- **Utils Module**: Platform-specific utilities, logging, and i18n

### Configuration

Application settings are stored in:
- **Linux**: `~/.config/rust-tool-template/settings.toml`
- **Windows**: `%APPDATA%/kako-jun/rust-tool-template/config/settings.toml`
- **macOS**: `~/Library/Application Support/com.kako-jun.rust-tool-template/settings.toml`

Logs are stored in:
- **Linux**: `~/.local/share/rust-tool-template/logs/`
- **Windows**: `%APPDATA%/kako-jun/rust-tool-template/data/logs/`
- **macOS**: `~/Library/Application Support/com.kako-jun.rust-tool-template/logs/`

## Testing

Run all tests:
```bash
cargo test
```

Run specific test:
```bash
cargo test unit_tests
cargo test integration_tests
```

## Internationalization

The application supports multiple languages using Fluent:

- Add new language files in `locales/<lang>/messages.ftl`
- Update the i18n module to load the new language
- Use the `get_localized_text()` function to retrieve translated strings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run `cargo clippy` and `cargo fmt`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

- **kako-jun** - [GitHub](https://github.com/kako-jun)

## Acknowledgments

- [Tauri](https://tauri.app/) for the GUI framework
- [ratatui](https://github.com/ratatui-org/ratatui) for the TUI interface
- [Fluent](https://projectfluent.org/) for internationalization