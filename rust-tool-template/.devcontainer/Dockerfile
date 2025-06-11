# Ubuntu 22.04をベースとする
FROM ubuntu:22.04

# タイムゾーンの設定
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

# 必要なパッケージをインストール
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    pkg-config \
    libssl-dev \
    libgtk-3-dev \
    libwebkit2gtk-4.0-dev \
    libappindicator3-dev \
    librsvg2-dev \
    libsoup2.4-dev \
    libjavascriptcoregtk-4.0-dev \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# vscodeユーザーを作成
RUN useradd -m -s /bin/bash vscode && \
    echo "vscode ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Rustのインストール
USER vscode
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/home/vscode/.cargo/bin:${PATH}"

# Rustコンポーネントのインストール
RUN rustup component add clippy rustfmt

# Node.jsのインストール（Tauriに必要）
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && \
    sudo apt-get install -y nodejs

# Tauri CLIのインストール
RUN cargo install tauri-cli

# 作業ディレクトリの設定
WORKDIR /workspace

# ログローテーション設定
USER root
RUN echo "#!/bin/bash\nfind /var/log -name '*.log' -mtime +7 -delete" > /etc/cron.daily/log-cleanup && \
    chmod +x /etc/cron.daily/log-cleanup

USER vscode