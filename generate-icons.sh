#!/bin/bash

# PWA Icon Generator Script for PayMeFans
# This script generates all required icon sizes from the SVG source files

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo "ImageMagick is required to generate PNG icons from SVG files."
    echo "Install it with: brew install imagemagick"
    exit 1
fi

# Create icons directory if it doesn't exist
mkdir -p public/icons

echo "Generating PWA icons from SVG sources..."

# Standard icon sizes
sizes=(72 96 128 144 152 192 384 512)

# Generate standard icons
for size in "${sizes[@]}"; do
    echo "Generating ${size}x${size} icon..."
    magick public/icons/icon.svg -resize ${size}x${size} public/icons/icon-${size}x${size}.png
done

# Generate maskable icons
echo "Generating maskable icons..."
magick public/icons/icon-maskable.svg -resize 192x192 public/icons/icon-maskable-192x192.png
magick public/icons/icon-maskable.svg -resize 512x512 public/icons/icon-maskable-512x512.png

# Generate Apple touch icon (180x180)
echo "Generating Apple touch icon..."
magick public/icons/icon.svg -resize 180x180 public/icons/apple-touch-icon.png

# Generate favicon sizes
echo "Generating favicon..."
magick public/icons/favicon.svg -resize 16x16 public/icons/favicon-16x16.png
magick public/icons/favicon.svg -resize 32x32 public/icons/favicon-32x32.png
magick public/icons/favicon.svg public/icons/favicon.ico

# Generate shortcut icons (for manifest shortcuts)
echo "Generating shortcut icons..."
# These would need custom designs, for now we'll use the main icon
magick public/icons/icon.svg -resize 96x96 public/icons/shortcut-explore.png
magick public/icons/icon.svg -resize 96x96 public/icons/shortcut-profile.png
magick public/icons/icon.svg -resize 96x96 public/icons/shortcut-messages.png

echo "Icon generation complete!"
echo ""
echo "Generated files:"
echo "- Standard icons: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512"
echo "- Maskable icons: 192x192, 512x512"
echo "- Apple touch icon: 180x180"
echo "- Favicon: 16x16, 32x32, .ico"
echo "- Shortcut icons: 96x96 (explore, profile, messages)"
echo ""
echo "Next steps:"
echo "1. Add the web manifest to your HTML head:"
echo '   <link rel="manifest" href="/webmanifest.json">'
echo "2. Add favicon links:"
echo '   <link rel="icon" type="image/svg+xml" href="/icons/favicon.svg">'
echo '   <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png">'
echo '   <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png">'
echo '   <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">'
echo "3. Add theme color meta tag:"
echo '   <meta name="theme-color" content="#CC0DF8">'
