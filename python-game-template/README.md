# Python Game Template

[![codecov](https://codecov.io/gh/your-username/python-game-template/branch/main/graph/badge.svg)](https://codecov.io/gh/your-username/python-game-template)

A template for creating Python games with a modern architecture.

## Features

- Modern Python project structure
- FastAPI-based API server
- Game state management
- Multi-language support
- Testing framework
- Documentation

## Project Structure

```
.
├── src/
│   ├── api/          # API server
│   ├── game/         # Game logic
│   └── utils/        # Utilities
├── tests/            # Test files
├── docs/             # Documentation
└── README.md         # This file
```

## Getting Started

1. Install dependencies:
   ```bash
   poetry install
   ```

2. Run the development server:
   ```bash
   poetry run uvicorn src.api.main:app --reload
   ```

3. Run tests:
   ```bash
   poetry run pytest
   ```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

The project uses pytest for testing. Run tests with:

```bash
poetry run pytest
```

### Test Coverage

```bash
poetry run pytest --cov=src --cov-report=term-missing
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

- kako-jun