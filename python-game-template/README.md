# Python Game Template

[![Tests](https://github.com/kako-jun/python-game-template/actions/workflows/test.yml/badge.svg)](https://github.com/kako-jun/python-game-template/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/kako-jun/python-game-template/branch/main/graph/badge.svg)](https://codecov.io/gh/kako-jun/python-game-template)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A cross-platform Python game template that supports both CLI and GUI modes. Built with PyGame for GUI and a custom cross-platform terminal library for CLI mode.

## Features

- **Dual Interface Support**: Run games in both CLI (terminal-based) and GUI (PyGame) modes
- **Cross-Platform**: Works on Windows, Linux, and macOS without modifications
- **Shared Game Logic**: Core game mechanics are shared between CLI and GUI versions
- **Type Safety**: Uses Pydantic models for robust data handling and validation
- **Internationalization**: Built-in support for multiple languages (English/Japanese)
- **Persistent Storage**: Configuration and save data management with automatic rotation
- **Comprehensive Logging**: Structured logging with file rotation and performance monitoring
- **Error Handling**: Robust error management to prevent application crashes
- **Development Ready**: Pre-configured with devcontainer, VS Code settings, and CI/CD

## Quick Start

### Prerequisites

- Python 3.11 or higher
- Poetry (for dependency management)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kako-jun/python-game-template.git
cd python-game-template
```

2. Install dependencies with Poetry:
```bash
poetry install
```

3. Run the game:

**GUI Mode (Default):**
```bash
poetry run python src/main.py
```

**CLI Mode:**
```bash
poetry run python src/main.py --mode cli
```

### VS Code Development

1. Open the project in VS Code
2. Install the recommended extensions
3. Press `F5` to run the game (multiple launch configurations available)

### Using devcontainer

1. Open in VS Code
2. Click "Reopen in Container" when prompted
3. The development environment will be automatically set up

## Usage

### Command Line Options

```bash
poetry run python src/main.py [OPTIONS]

Options:
  --mode {gui,cli}           Game mode (default: gui)
  --language {en,ja}         Language (default: from config or en)
  --debug                    Enable debug mode
  --fullscreen               Start in fullscreen mode (GUI only)
  --fps N                    Target FPS (default: 60)
  --width N                  Window width (GUI only, default: 800)
  --height N                 Window height (GUI only, default: 600)
  --log-level LEVEL          Log level (DEBUG/INFO/WARNING/ERROR/CRITICAL)
  --no-console-log          Disable console logging
  --no-file-log             Disable file logging
```

### Controls

**GUI Mode:**
- `ESC`: Quit
- `SPACE`: Pause/Resume
- `R`: Restart

**CLI Mode:**
- `Q` or `ESC`: Quit
- `P` or `SPACE`: Pause/Resume
- `R`: Restart

## Project Structure

```
python-game-template/
├── src/
│   ├── game/              # Game core logic
│   │   ├── core.py        # Shared game engine
│   │   ├── models.py      # Pydantic data models
│   │   ├── gui.py         # PyGame implementation
│   │   └── cli.py         # CLI implementation
│   ├── utils/             # Utility modules
│   │   ├── terminal.py    # Cross-platform terminal control
│   │   ├── logging.py     # Logging system
│   │   ├── storage.py     # Data persistence
│   │   ├── i18n.py        # Internationalization
│   │   └── error_handler.py # Error handling
│   ├── locales/           # Translation files
│   └── main.py            # Application entry point
├── tests/                 # Test suite
├── .devcontainer/         # Development container config
├── .vscode/               # VS Code settings
├── .github/workflows/     # CI/CD configuration
└── pyproject.toml         # Project configuration
```

## Development

### Running Tests

```bash
# Run all tests
poetry run pytest

# Run with coverage
poetry run pytest --cov=src --cov-report=html

# Run specific test file
poetry run pytest tests/test_models.py -v
```

### Code Quality

```bash
# Format code
poetry run black src tests

# Check imports
poetry run isort src tests

# Lint code
poetry run flake8 src tests

# Type checking
poetry run mypy src
```

### Adding New Games

This template is designed to be the foundation for multiple games. To create a new game:

1. Extend the `GameEngine` class in `src/game/core.py`
2. Override methods like `_update_object()` and `_handle_collision()`
3. Add game-specific models to `src/game/models.py`
4. Customize the rendering in both `gui.py` and `cli.py`

## Configuration

### Persistent Settings

The application automatically saves configuration to:
- **Windows**: `%APPDATA%/PythonGameTemplate/config/`
- **Linux/macOS**: `~/.local/share/python-game-template/config/`

### Logs

Logs are stored in the same directory structure under `logs/` with automatic rotation.

## Internationalization

Add new languages by:

1. Creating a new JSON file in `src/locales/` (e.g., `fr.json`)
2. Adding the language to the `Language` enum in `src/game/models.py`
3. Using the `t()` function for translatable strings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass and code quality checks succeed
6. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

kako-jun

## Acknowledgments

- Built with [PyGame](https://www.pygame.org/) for GUI functionality
- Uses [Pydantic](https://pydantic-docs.helpmanual.io/) for data validation
- Inspired by cross-platform game development best practices