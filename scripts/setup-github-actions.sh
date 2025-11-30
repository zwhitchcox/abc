#!/bin/bash
set -e

# Check dependencies
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed."
    echo "Please install it: https://cli.github.com/manual/installation"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo "Error: You are not logged into GitHub CLI."
    echo "Please run: gh auth login"
    exit 1
fi

if [ ! -f .env.production ]; then
    echo "Error: .env.production file not found!"
    echo "Please ensure you have a .env.production file in the current directory."
    exit 1
fi

SERVER_IP="5.161.189.133"
SERVER_USER="root"
KEY_NAME="github-actions-key"

echo "=== 1. Generating SSH Key ==="
# Generate a new key pair without passphrase
rm -f "$KEY_NAME" "$KEY_NAME.pub"
ssh-keygen -t ed25519 -C "github-actions" -f "$KEY_NAME" -N "" -q
echo "Key generated."

echo ""
echo "=== 2. Adding Public Key to Server ==="
echo "Trying to copy SSH key to $SERVER_USER@$SERVER_IP..."
echo "You may be prompted for the server password."

# Attempt to copy the id using ssh-copy-id
if ssh-copy-id -i "$KEY_NAME.pub" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP"; then
    echo "Successfully added key to server."
else
    echo "Failed to add key automatically."
    echo "Please manually add the following content to ~/.ssh/authorized_keys on the server:"
    cat "$KEY_NAME.pub"
    read -p "Press Enter once you have added the key..."
fi

echo ""
echo "=== 3. Setting GitHub Secrets ==="

echo "Setting SSH_PRIVATE_KEY..."
gh secret set SSH_PRIVATE_KEY < "$KEY_NAME"

echo "Setting SSH_HOST..."
echo "$SERVER_IP" | gh secret set SSH_HOST

echo "Setting SSH_USER..."
echo "$SERVER_USER" | gh secret set SSH_USER

echo "Setting ENV_PRODUCTION..."
gh secret set ENV_PRODUCTION < .env.production

# Known hosts - fetch from server
echo "Setting SSH_KNOWN_HOSTS..."
ssh-keyscan -H "$SERVER_IP" 2>/dev/null | gh secret set SSH_KNOWN_HOSTS

echo ""
echo "=== 4. Cleanup ==="
rm -f "$KEY_NAME" "$KEY_NAME.pub"
echo "Temporary key files deleted."

echo ""
echo "✅ Setup complete! Your next push to master will deploy to Hetzner."
