# y4m2d2

A powerful tool for renaming and organizing photo and video files based on their metadata.

## Features

- Automatic detection of photo and video files
- Date retrieval from EXIF data and video metadata
- Automatic orientation detection and correction
- Directory structure creation based on dates
- Burst photo grouping
- Backup functionality
- Parallel processing for speed
- Interactive orientation confirmation
- Cleanup features

## Required Dependencies

### FFmpeg

FFmpeg is required for reading video metadata. This tool uses FFmpeg to extract creation dates and other metadata from video files.

#### Windows
1. Download FFmpeg from the [official website](https://ffmpeg.org/download.html)
2. Extract the downloaded zip file
3. Add the `bin` directory to your system's PATH environment variable

#### Linux
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# CentOS/RHEL
sudo yum install ffmpeg
```

#### macOS
```bash
brew install ffmpeg
```

## Installation

```bash
cargo install y4m2d2
```

## Usage

Basic usage:
```bash
y4m2d2 -i input_dir -o output_dir
```

Options:
- `-i, --input <DIR>`: Input directory
- `-o, --output <DIR>`: Output directory
- `-b, --backup <DIR>`: Backup directory
- `--orientation <MODE>`: Orientation mode (auto/interactive/skip)
- `--cleanup`: Clean up temporary files
- `--parallel`: Enable parallel processing
- `--timezone <TZ>`: Timezone for date processing
- `--language <LANG>`: Language (en/ja)
- `-V, --version`: Show version information
- `-h, --help`: Show help message

## Project Structure

```
src/
├── core/
│   ├── processor.rs    # Core processing logic
│   └── renamer.rs      # File renaming logic
├── media/
│   ├── date.rs         # Date handling
│   └── orientation.rs  # Orientation detection
├── utils/
│   ├── fs.rs           # File system operations
│   └── display.rs      # User interface
└── args.rs             # Command line arguments
```

## Error Handling

The application uses a custom error type that implements `std::error::Error` and provides detailed error messages in the selected language.

## Logging

Logging is implemented using the `log` crate with the following levels:
- ERROR: Critical errors that prevent operation
- WARN: Non-critical issues
- INFO: General information
- DEBUG: Detailed debugging information
- TRACE: Very detailed tracing information

## Development

### Dependencies

- Rust 1.70.0 or later
- Cargo
- FFmpeg (required for video metadata)

### Building

```bash
cargo build --release
```

### Testing

```bash
cargo test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request