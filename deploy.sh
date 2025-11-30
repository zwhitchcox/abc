#!/bin/bash
set -e

HOST="5.161.189.133"
USER="root"
DIR="/opt/zephyr"

# Check for .env.production
if [ ! -f .env.production ]; then
    echo "Error: .env.production file not found!"
    echo "Please copy env.production.template to .env.production and fill in your secrets."
    exit 1
fi

echo "Deploying source to $HOST..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'data' \
  --exclude '.env*' \
  --exclude 'ansible' \
  --exclude '.DS_Store' \
  --exclude 'tests/e2e' \
  --exclude 'tests/prisma' \
  --exclude 'build' \
  --exclude 'public/build' \
  --exclude 'server-build' \
  ./ "$USER@$HOST:$DIR"

echo "Uploading .env.production..."
rsync -avz .env.production "$USER@$HOST:$DIR/.env"

echo "Running remote setup and build..."
ssh "$USER@$HOST" "cd $DIR && \
  pnpm install && \
  pnpm run build && \
  npx playwright install chromium && \
  echo 'Backing up database...' && \
  (cp data/data.db data/data.db.backup-\$(date +%s) 2>/dev/null || echo 'No database to backup') && \
  npx prisma db push && \
  npx prisma generate && \
  pm2 restart zephyr || pm2 start index.js --name zephyr --time"

echo "Deployment complete!"
