#!/bin/bash
set -e

if [ ! -f .env.production ]; then
    echo "Error: .env.production file not found!"
    exit 1
fi

if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed."
    echo "Install it with: brew install gh"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo "Error: Not logged into GitHub CLI. Run: gh auth login"
    exit 1
fi

echo "Syncing .env.production to GitHub secret ENV_PRODUCTION..."
gh secret set ENV_PRODUCTION < .env.production

echo "Done! The ENV_PRODUCTION secret has been updated."
echo "Next CI deploy will use the new values."

