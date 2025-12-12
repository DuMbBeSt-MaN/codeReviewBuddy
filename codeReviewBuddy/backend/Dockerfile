# Multi-language sandbox environment
FROM ubuntu:22.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    vim \
    nano \
    python3 \
    python3-pip \
    nodejs \
    npm \
    openjdk-11-jdk \
    gcc \
    g++ \
    make \
    && rm -rf /var/lib/apt/lists/*

# Create workspace directory
WORKDIR /workspace

# Create non-root user for security
RUN useradd -m -s /bin/bash codeuser && \
    chown -R codeuser:codeuser /workspace

# Switch to non-root user
USER codeuser

# Set up shell environment
ENV HOME=/home/codeuser
ENV PATH=$PATH:/home/codeuser/.local/bin

# Keep container running
CMD ["tail", "-f", "/dev/null"]