# Development environment for rust-tool-template
FROM rust:1.75

# Install system dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    git \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install additional development tools
RUN cargo install cargo-watch
RUN cargo install cargo-edit

# Set working directory
WORKDIR /workspace

# Create necessary directories
RUN mkdir -p /workspace/logs /workspace/data

# Environment variables for development
ENV RUST_LOG=rust_tool_template=debug
ENV RUST_TOOL_LANG=en
ENV RUST_BACKTRACE=1

# Default command (can be overridden)
CMD ["cargo", "run"] 