#!/bin/bash
set -e

HOST="${SSH_HOST:-5.161.189.133}"
USER="${SSH_USER:-root}"
DIR="/opt/zephyr"
APP_NAME="zephyr"
BACKUP_DIR="$DIR/backups"
LOCAL_DB="prisma/data.db"
REMOTE_DB="$DIR/prisma/data.db"
SANITIZED_ENV=""
APP_STOPPED=0

cleanup() {
  if [ "$APP_STOPPED" = "1" ]; then
    echo "Deploy interrupted; starting $APP_NAME back up..."
    ssh "$USER@$HOST" "cd '$DIR' && NODE_ENV=production pm2 restart '$APP_NAME' --update-env" || true
  fi
  if [ -n "$SANITIZED_ENV" ]; then
    rm -f "$SANITIZED_ENV"
  fi
}

trap cleanup EXIT

# Check for .env.production
if [ ! -f .env.production ]; then
    echo "Error: .env.production file not found!"
    echo "Please copy env.production.template to .env.production and fill in your secrets."
    exit 1
fi

if [ ! -f "$LOCAL_DB" ]; then
    echo "Error: $LOCAL_DB file not found!"
    exit 1
fi

echo "Deploying source to $HOST..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'data' \
  --exclude 'backups' \
  --exclude '.env*' \
  --exclude 'ansible' \
  --exclude '.DS_Store' \
  --exclude 'prisma/data.db' \
  --exclude 'prisma/data.db-wal' \
  --exclude 'prisma/data.db-shm' \
  --exclude '.playwright-mcp' \
  --exclude 'my-remix-app' \
  --exclude 'remix' \
  --exclude 'dev.log' \
  --exclude 'server.log' \
  --exclude 'tests/e2e' \
  --exclude 'tests/prisma' \
  --exclude 'build' \
  --exclude 'public/build' \
  --exclude 'server-build' \
  ./ "$USER@$HOST:$DIR"

echo "Uploading .env.production..."
SANITIZED_ENV="$(mktemp)"
grep -Ev '^(OPENAI_API_KEY|GROQ_API_KEY|ALLOW_SERVER_AI_GENERATION)=' .env.production > "$SANITIZED_ENV"
rsync -avz "$SANITIZED_ENV" "$USER@$HOST:$DIR/.env"

echo "Running remote setup and build..."
ssh "$USER@$HOST" "set -e; \
  cd $DIR && \
  pnpm install && \
  pnpm run build && \
  npx playwright install chromium && \
  npx prisma generate"

if ssh "$USER@$HOST" "pm2 describe '$APP_NAME' >/dev/null"; then
  echo "Stopping $APP_NAME before database sync..."
  ssh "$USER@$HOST" "pm2 stop '$APP_NAME'"
  APP_STOPPED=1
else
  echo "No running PM2 app named $APP_NAME to stop."
fi

echo "Backing up remote database..."
ssh "$USER@$HOST" "mkdir -p '$BACKUP_DIR' && \
  if [ -f '$REMOTE_DB' ]; then \
    cp '$REMOTE_DB' '$BACKUP_DIR/data.db.before-deploy-$(date +%Y%m%d-%H%M%S)'; \
  else \
    echo 'No remote prisma/data.db to backup'; \
  fi"

echo "Syncing content database with rsync delta..."
rsync -avz --inplace --no-whole-file --stats "$LOCAL_DB" "$USER@$HOST:$REMOTE_DB"

echo "Applying database schema and starting app..."
ssh "$USER@$HOST" "set -e; \
  cd $DIR && \
  npx prisma db push && \
  npx prisma generate && \
  if pm2 describe '$APP_NAME' >/dev/null; then \
    NODE_ENV=production pm2 restart '$APP_NAME' --update-env; \
  else \
    NODE_ENV=production pm2 start index.js --name '$APP_NAME' --time; \
  fi"
APP_STOPPED=0

echo "Deployment complete!"
