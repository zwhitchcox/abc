#!/bin/bash

echo "📤 Uploading Images to Fly.io (Compressed)"
echo "=========================================="
echo ""

APP="${1:-abc-8bad}"

# Check if images directory exists
if [ ! -d "images" ]; then
    echo "❌ No images directory found"
    exit 1
fi

# Create a timestamp for unique filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE_NAME="images_${TIMESTAMP}.tar.gz"

echo "📦 Compressing images..."
# Use --no-xattrs to avoid macOS extended attributes
tar --no-xattrs -czf "$ARCHIVE_NAME" images/ 2>/dev/null || tar -czf "$ARCHIVE_NAME" images/

# Get file size in MB
SIZE=$(du -h "$ARCHIVE_NAME" | cut -f1)
echo "✅ Compressed to $ARCHIVE_NAME ($SIZE)"
echo ""

echo "📤 Uploading to server..."
# Create a temporary SFTP batch file
BATCH_FILE=$(mktemp)
cat > "$BATCH_FILE" << EOF
cd /data
put $ARCHIVE_NAME
EOF

# Upload the archive
flyctl ssh sftp shell -a "$APP" < "$BATCH_FILE" > /tmp/upload_output.txt 2>&1

# Check if upload was successful
if grep -q "bytes written" /tmp/upload_output.txt; then
    BYTES=$(grep "bytes written" /tmp/upload_output.txt | awk '{print $1}')
    echo "✅ Uploaded successfully ($BYTES bytes)"
else
    echo "❌ Upload failed"
    cat /tmp/upload_output.txt
    rm -f "$ARCHIVE_NAME" "$BATCH_FILE" /tmp/upload_output.txt
    exit 1
fi

# Clean up local files
rm -f "$BATCH_FILE" /tmp/upload_output.txt

echo ""
echo "📂 Extracting on server..."

# Extract on the server (warnings about macOS extended attributes are normal)
echo "Extracting archive..."
flyctl ssh console -a "$APP" -C "tar -xzf /data/$ARCHIVE_NAME -C /data" 2>&1 | grep -v "Ignoring unknown extended header" || true

# Check if extraction was successful by verifying images directory exists
if flyctl ssh console -a "$APP" -C "test -d /data/images" 2>/dev/null; then
    echo "✅ Extraction successful"
    echo "Removing archive..."
    flyctl ssh console -a "$APP" -C "rm /data/$ARCHIVE_NAME" 2>/dev/null
else
    echo "❌ Extraction failed"
    exit 1
fi

echo "✅ Extraction complete"
echo ""

# Clean up macOS metadata files
echo "🧹 Cleaning up macOS metadata files..."
flyctl ssh console -a "$APP" -C "find /data/images -name '._*' -type f -delete" 2>/dev/null
flyctl ssh console -a "$APP" -C "find /data/images -name '.DS_Store' -type f -delete" 2>/dev/null
echo "✅ Cleanup complete"
echo ""

# Clean up local archive
rm -f "$ARCHIVE_NAME"

echo "🔍 Verifying upload..."
# Use a simpler command that works with Fly SSH
REMOTE_COUNT=$(flyctl ssh console -a "$APP" -C "ls -la /data/images/*/* | grep -E '\.(jpg|jpeg|png|gif|webp)$' | wc -l" 2>/dev/null | head -1 | tr -d ' ')
LOCAL_COUNT=$(find images -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" \) | wc -l | tr -d ' ')

echo "📊 Files on server: $REMOTE_COUNT"
echo "📊 Files locally: $LOCAL_COUNT"

if [ "$REMOTE_COUNT" = "$LOCAL_COUNT" ]; then
    echo ""
    echo "✅ All images uploaded successfully!"
else
    echo ""
    echo "⚠️  File count mismatch - some files may have failed to upload"
fi