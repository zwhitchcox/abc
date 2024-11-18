# This file is moved to the root directory before building the image

FROM node:22-bookworm-slim

ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV FLY="true"
ENV LITEFS_DIR="/litefs/data"
ENV DATABASE_FILENAME="sqlite.db"
ENV DATABASE_PATH="$LITEFS_DIR/$DATABASE_FILENAME"
ENV DATABASE_URL="file:$DATABASE_PATH"
ENV CACHE_DATABASE_FILENAME="cache.db"
ENV CACHE_DATABASE_PATH="$LITEFS_DIR/$CACHE_DATABASE_FILENAME"
ENV INTERNAL_PORT="8080"
ENV PORT="8081"
# For WAL support: https://github.com/prisma/prisma-engines/issues/4675#issuecomment-1914383246
ENV PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK="1"

# Install system dependencies
RUN apt-get update && apt-get install -y \
    fuse3 \
    openssl \
    sqlite3 \
    ca-certificates

# Enable pnpm
RUN corepack enable

WORKDIR /myapp

# Install all dependencies
COPY package.json package-lock.json .npmrc ./
RUN pnpm install --include=dev

# Generate Prisma client
COPY prisma .
RUN npx prisma generate

# Copy application code
COPY . .

# Build the app
RUN pnpm run build

# Generate random value for internal command token
RUN INTERNAL_COMMAND_TOKEN=$(openssl rand -hex 32) && \
    echo "INTERNAL_COMMAND_TOKEN=$INTERNAL_COMMAND_TOKEN" > .env

# Add database CLI shortcut
RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/database-cli && chmod +x /usr/local/bin/database-cli

# Setup LiteFS
COPY --from=flyio/litefs:0.5.11 /usr/local/bin/litefs /usr/local/bin/litefs
ADD other/litefs.yml /etc/litefs.yml
RUN mkdir -p /data ${LITEFS_DIR}

CMD ["litefs", "mount"]
