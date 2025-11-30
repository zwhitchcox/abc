#!/bin/bash
set -e

ENV_FILE=".env.production"

if ! command -v gh &> /dev/null; then
    echo "GitHub CLI (gh) is not installed. Please install it first:"
    echo "brew install gh"
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found."
    exit 1
fi

echo "Syncing secrets from $ENV_FILE to GitHub Actions..."

# Read the file line by line
while IFS='=' read -r key value || [ -n "$key" ]; do
  # Skip comments and empty lines
  if [[ $key =~ ^#.* ]] || [[ -z $key ]]; then
    continue
  fi

  # Remove surrounding quotes from value if present
  value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")

  echo "Setting secret: $key"
  gh secret set "$key" --body "$value"

done < "$ENV_FILE"

echo "All secrets synced successfully!"

