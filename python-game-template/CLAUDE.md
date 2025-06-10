# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Dependencies & Environment:**
```bash
poetry install                    # Install dependencies
poetry shell                     # Activate virtual environment
```

**Run Applications:**
```bash
# API server (port 10400)
poetry run uvicorn src.api.main:app --reload

# Web server (port 10500)  
poetry run python -m src.web.main

# CLI game
poetry run python -m src.cli.main start --width 20 --height 20
```

**Testing:**
```bash
poetry run pytest                 # Run all tests
poetry run pytest tests/game/     # Run specific test directory
poetry run pytest --cov=src --cov-report=term-missing  # With coverage
poetry run mypy src/              # Type checking
```

## Architecture Overview

This is a multi-interface Python game template implementing a Snake game with three distinct interfaces:

**Core Game Architecture:**
- `src/game/core.py` - Contains two game classes:
  - `SnakeGame` - Full-featured game with multiplayer support, callbacks, and board management
  - `Game` - Simplified game class used by API/web interfaces
- `src/game/models.py` - Pydantic models for game state, configuration, and data structures

**Interface Layers:**
- **API** (`src/api/`) - FastAPI REST API server with game endpoints
- **Web** (`src/web/`) - FastAPI web server with HTML templates and static files  
- **CLI** (`src/cli/`) - Rich-based command line interface with interactive display

**Supporting Systems:**
- `src/utils/i18n.py` - Multi-language support (English/Japanese)
- `src/utils/logging.py` - Centralized logging configuration
- `src/utils/performance.py` - Performance monitoring utilities
- `src/utils/security.py` - Security validation functions

**Key Integration Points:**
- Games are managed as in-memory instances keyed by player name/ID
- State synchronization between interfaces happens through the core game classes
- API and web interfaces use the simplified `Game` class
- CLI interface uses the full-featured `SnakeGame` class

**Data Flow:**
- Game state flows: Core models → Game classes → Interface endpoints → Client responses
- Configuration flows: Command line args/API requests → `GameConfig` → Game initialization
- User actions flow: Interface input → Game action processing → State updates → Response

## Language & Localization

The codebase supports Japanese and English through `src/locales/` JSON files and the i18n utility system.