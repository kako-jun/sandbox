# Python Game Template

A flexible and extensible game template that supports both CLI and Web interfaces, with multilingual support and comprehensive error handling.

## Features

- **Dual Interface Support**
  - Command Line Interface (CLI)
  - Web Interface (FastAPI + Flask)
- **Multilingual Support**
  - English (default)
  - Japanese
- **Flexible Configuration**
  - Command-line arguments
  - Interactive prompts
  - Web form inputs
- **Robust Error Handling**
  - Comprehensive logging
  - User-friendly error messages
  - Graceful fallbacks

## Development Environments

### Local Development (Windows/Linux/macOS)

1. Clone the repository:
```bash
git clone https://github.com/yourusername/python-game-template.git
cd python-game-template
```

2. Install dependencies:
```bash
pip install -e .
```

### WSL Development

1. Install WSL and your preferred Linux distribution
2. Clone the repository in your WSL environment
3. Follow the Local Development steps above

### VS Code Dev Container (Recommended)

1. Install VS Code and the Remote - Containers extension
2. Clone the repository
3. Open the project in VS Code
4. Click "Reopen in Container" when prompted

The dev container provides:
- Pre-configured development environment
- All necessary dependencies
- Debugging support
- Hot reloading
- Integrated terminal

## Usage

### CLI Mode

Basic usage:
```bash
python -m src.cli.main
```

With command-line arguments:
```bash
# Set language
python -m src.cli.main --lang ja

# Set player name and difficulty
python -m src.cli.main --player-name "John" --difficulty hard

# Set game mode and board size
python -m src.cli.main --mode time_attack --width 15 --height 15

# Disable interactive mode
python -m src.cli.main --no-interactive
```

Available options:
- `--lang`: Set language (en/ja)
- `--player-name`: Set player name
- `--difficulty`: Set difficulty (easy/normal/hard)
- `--mode`: Set game mode (classic/time_attack/puzzle)
- `--width`: Set board width
- `--height`: Set board height
- `--time-limit`: Set time limit in seconds
- `--no-interactive`: Disable interactive mode

### Web Mode

1. Start the services:
```bash
# Development (using VS Code dev container)
# The services will start automatically when you open the project in the dev container

# Local development
python -m src.web.app
```

2. Access the web interface at `http://localhost:5000`

## Development

### Project Structure
```
python-game-template/
├── src/
│   ├── cli/          # CLI implementation
│   ├── web/          # Web interface
│   ├── api/          # API server
│   ├── game/         # Game core logic
│   └── utils/        # Utility functions
├── tests/            # Test files
├── logs/             # Log files
├── .devcontainer/    # VS Code dev container config
│   ├── Dockerfile    # Development container image
│   └── compose.yaml  # Development services
└── pyproject.toml    # Python package config
```

### Running Tests
```bash
pytest
```

### Logging

Logs are stored in the `logs` directory:
- `app.log`: Application logs
- `error.log`: Error logs

Log rotation is configured to:
- Maximum size: 10MB
- Backup count: 5

## Deployment

The `deploy` directory contains all necessary files for production deployment:

1. Build and run the production containers:
```bash
cd deploy
docker-compose up -d
```

2. Monitor the services:
```bash
docker-compose ps
docker-compose logs -f
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.