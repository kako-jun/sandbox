FROM mcr.microsoft.com/vscode/devcontainers/python:3.11

# システムの依存関係をインストール
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        git \
        build-essential \
        libsdl2-dev \
        libsdl2-image-dev \
        libsdl2-mixer-dev \
        libsdl2-ttf-dev \
        libfreetype6-dev \
        libportmidi-dev \
        libjpeg-dev \
        python3-dev \
        python3-numpy \
        cython3 \
    && apt-get autoremove -y && apt-get clean -y

# ユーザーをvscodに切り替え
USER vscode

# Poetryのインストール
RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="/home/vscode/.local/bin:$PATH"

# 作業ディレクトリの設定
WORKDIR /workspace

# ログローテーション設定（コンテナ内のログ制限）
RUN echo "*.* /dev/stdout" > /etc/rsyslog.d/50-default.conf \
    && echo "\$ModLoad imuxsock" >> /etc/rsyslog.conf \
    && echo "\$SystemLogRateLimitInterval 1" >> /etc/rsyslog.conf \
    && echo "\$SystemLogRateLimitBurst 50" >> /etc/rsyslog.conf