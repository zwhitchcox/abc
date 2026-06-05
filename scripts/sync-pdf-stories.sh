#!/bin/bash
set -euo pipefail

DIRECTION="${1:-}"
HOST="${SSH_HOST:-5.161.189.133}"
USER="${SSH_USER:-root}"
DIR="${SSH_DIR:-/opt/zephyr}"
LOCAL_DIR="data/processed-pdfs/"
REMOTE_DIR="$USER@$HOST:$DIR/data/processed-pdfs/"

if [[ "$DIRECTION" != "up" && "$DIRECTION" != "down" ]]; then
  echo "Usage: $0 <up|down>"
  echo "  up   sync local processed stories to the server"
  echo "  down sync processed stories from the server to local"
  exit 1
fi

mkdir -p "$LOCAL_DIR"

if [[ "$DIRECTION" == "up" ]]; then
  echo "Syncing local stories to $REMOTE_DIR"
  ssh "$USER@$HOST" "mkdir -p '$DIR/data/processed-pdfs'"
  rsync -avz --delete "$LOCAL_DIR" "$REMOTE_DIR"
else
  echo "Syncing stories from $REMOTE_DIR"
  rsync -avz --delete "$REMOTE_DIR" "$LOCAL_DIR"
fi
