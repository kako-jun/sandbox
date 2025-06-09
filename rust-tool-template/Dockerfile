# Multi-stage build for optimized production image
FROM rust:1.75 as builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN useradd -m -u 1001 appuser

# Set working directory
WORKDIR /app

# Copy dependency files first for better cache utilization
COPY Cargo.toml Cargo.lock ./

# Create dummy source files to build dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs && echo "" > src/lib.rs
RUN cargo build --release && rm -rf src

# Copy actual source code
COPY src ./src
COPY locales ./locales

# Build the application
RUN cargo build --release

# Production stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

# Create app user and directories
RUN useradd -m -u 1001 appuser
RUN mkdir -p /app/logs /app/data && chown -R appuser:appuser /app

# Copy binary and locales from builder
COPY --from=builder /app/target/release/rust-tool-template /app/
COPY --from=builder /app/locales /app/locales

# Set working directory and user
WORKDIR /app
USER appuser

# Environment variables for container
ENV RUST_LOG=rust_tool_template=info
ENV RUST_TOOL_LANG=en
ENV RUST_BACKTRACE=1

# Create volume for persistent logs
VOLUME ["/app/logs", "/app/data"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD /app/rust-tool-template -m cli -c stats || exit 1

# Default command (can be overridden)
CMD ["/app/rust-tool-template"]
