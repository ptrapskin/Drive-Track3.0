#!/usr/bin/env python3

from PIL import Image
import os
import glob

# Change to the app icon directory
icon_dir = "/Users/user943610/Desktop/Drive-Track3.0/ios/App/App/Assets.xcassets/AppIcon.appiconset"
os.chdir(icon_dir)

print("Removing alpha channels from app icons...")

# Process all AppIcon PNG files
for filepath in glob.glob("AppIcon-*.png"):
    try:
        print(f"Processing {filepath}...")
        
        # Open the image
        img = Image.open(filepath)
        
        # If it has an alpha channel, remove it
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            # Create a white background
            background = Image.new('RGB', img.size, (255, 255, 255))
            
            # Paste the image onto the white background
            if img.mode == 'RGBA':
                background.paste(img, mask=img.split()[-1])  # Use alpha channel as mask
            elif img.mode == 'LA':
                background.paste(img, mask=img.split()[-1])
            else:
                background.paste(img)
            
            # Save without alpha channel
            background.save(filepath, 'PNG', optimize=True)
            print(f"✓ Fixed {filepath}")
        else:
            print(f"- {filepath} already has no alpha channel")
            
    except Exception as e:
        print(f"✗ Error processing {filepath}: {e}")

print("Done removing alpha channels!")
