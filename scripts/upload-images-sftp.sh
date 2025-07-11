#!/bin/bash

echo "📤 Uploading Images to Fly.io via SFTP"
echo "======================================"
echo ""

APP="${1:-abc-8bad}"

# Check if images directory exists
if [ ! -d "images" ]; then
    echo "❌ No images directory found"
    exit 1
fi

# Count total files
TOTAL_FILES=$(find images -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" \) | wc -l)
echo "📊 Found $TOTAL_FILES images to upload"
echo ""

# Create SFTP batch file
BATCH_FILE=$(mktemp)
echo "cd /data/images" > "$BATCH_FILE"

# Process each topic
UPLOADED=0
for topic_dir in images/*/; do
    if [ -d "$topic_dir" ]; then
        topic=$(basename "$topic_dir")
        echo "📁 Processing $topic..."
        
        # Create topic directory
        echo "mkdir $topic" >> "$BATCH_FILE"
        echo "cd $topic" >> "$BATCH_FILE"
        
        # Process each item
        for item_dir in "$topic_dir"*/; do
            if [ -d "$item_dir" ]; then
                item=$(basename "$item_dir")
                
                # Create item directory
                echo "mkdir $item" >> "$BATCH_FILE"
                echo "cd $item" >> "$BATCH_FILE"
                
                # Add put commands for each image
                for ext in jpg jpeg png gif webp; do
                    for image in "$item_dir"*.$ext; do
                        if [ -f "$image" ]; then
                        filename=$(basename "$image")
                        echo "put \"$image\" \"$filename\"" >> "$BATCH_FILE"
                        UPLOADED=$((UPLOADED + 1))
                        
                        # Show progress
                        PERCENT=$((UPLOADED * 100 / TOTAL_FILES))
                        printf "\r   📤 Progress: %d/%d (%d%%)" "$UPLOADED" "$TOTAL_FILES" "$PERCENT"
                    fi
                    done
                done
                
                # Go back to topic directory
                echo "cd .." >> "$BATCH_FILE"
            fi
        done
        
        # Go back to images directory
        echo "cd .." >> "$BATCH_FILE"
    fi
done

echo ""
echo ""
echo "🚀 Starting SFTP upload..."
echo ""

# Execute SFTP batch
flyctl ssh sftp shell -a "$APP" < "$BATCH_FILE" 2>/dev/null | grep -E "bytes written|transferred" || true

# Clean up
rm -f "$BATCH_FILE"

echo ""
echo "🔍 Verifying upload..."
REMOTE_COUNT=$(flyctl ssh console -a "$APP" -C "find /data/images -type f | wc -l" 2>/dev/null | head -1)
echo "📊 Files on server: $REMOTE_COUNT"

if [ "$REMOTE_COUNT" -eq "$TOTAL_FILES" ]; then
    echo "✅ All images uploaded successfully!"
else
    echo "⚠️  Some files may have failed to upload"
    echo "   Local: $TOTAL_FILES | Remote: $REMOTE_COUNT"
fi