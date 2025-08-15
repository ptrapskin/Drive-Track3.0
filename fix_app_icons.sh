#!/bin/bash

# Script to remove alpha channel from PNG files
cd /Users/user943610/Desktop/Drive-Track3.0/ios/App/App/Assets.xcassets/AppIcon.appiconset

echo "Removing alpha channels from app icons..."

for file in AppIcon-*.png; do
    echo "Processing $file..."
    # Create temporary file with white background
    sips -s hasAlpha no -s format png "$file" --out "temp_$file"
    
    # Replace original with alpha-free version
    if [ -f "temp_$file" ]; then
        mv "temp_$file" "$file"
        echo "✓ Fixed $file"
    else
        echo "✗ Failed to process $file"
    fi
done

echo "Done removing alpha channels!"
