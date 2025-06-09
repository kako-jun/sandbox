FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# Set up the working directory
WORKDIR /workspace

# Install Python dependencies
COPY pyproject.toml .
RUN pip install --no-cache-dir -e .

# Set environment variables
ENV PYTHONPATH=/workspace
ENV PYTHONUNBUFFERED=1

# Switch to non-root user
USER $USERNAME

# Default command
CMD ["python", "-m", "src.cli.main"] 