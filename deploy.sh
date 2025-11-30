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

echo "Building..."
pnpm run build

echo "Deploying to $HOST..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'data' \
  --exclude '.env*' \
  --exclude 'tests' \
  --exclude 'ansible' \
  --exclude '.DS_Store' \
  ./ "$USER@$HOST:$DIR"

echo "Uploading .env.production..."
rsync -avz .env.production "$USER@$HOST:$DIR/.env"

echo "Running remote setup..."
ssh "$USER@$HOST" "cd $DIR && \
  pnpm install --prod && \
  npx playwright install chromium && \
  echo 'Backing up database...' && \
  (cp data/data.db data/data.db.backup-\$(date +%s) 2>/dev/null || echo 'No database to backup') && \
  npx prisma migrate deploy && \
  npx prisma generate && \
  pm2 restart zephyr || pm2 start index.js --name zephyr --time"

echo "Deployment complete!"
