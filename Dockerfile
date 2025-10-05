# React Web Development Environment
FROM node:20-bookworm-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    python3 \
    build-essential \
    ca-certificates \
    curl \
    dos2unix \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install global development tools
RUN npm install -g serve npm-check-updates

# Set environment variables
ENV NODE_ENV=development \
    CHOKIDAR_USEPOLLING=1 \
    WATCHPACK_POLLING=true \
    WDS_SOCKET_PORT=3000

# Expose React development server ports
EXPOSE 3000 3001

# Keep container running
CMD ["tail", "-f", "/dev/null"]