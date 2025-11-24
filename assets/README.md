# App Assets

This directory contains all the app icons and splash screen assets for MyAccounts.

## Files

- **icon.png** (1024x1024) - Main app icon for iOS and Android
- **adaptive-icon.png** (1024x1024) - Android adaptive icon foreground (transparent background)
- **favicon.png** (48x48) - Web favicon
- **splash-icon.png** (1024x1024) - Splash screen icon

## Design

All icons are based on the app's Logo component (`src/ui/lib/Logo.tsx`) which features:
- A circular coin-like shape with a coral-orange gradient ring (#FF7F50 to #FF4500)
- An abstract upward trending chart line representing financial growth
- A blue dot at the peak (#4A90E2)

## Regenerating Icons

If you need to regenerate the icons:

```bash
node scripts/generate-icons.js
```

This will create SVG versions, which can then be converted to PNG using ImageMagick:

```bash
magick -background white -resize 1024x1024 assets/icon.svg assets/icon.png
magick -background none -resize 1024x1024 assets/adaptive-icon.svg assets/adaptive-icon.png
magick -background white -resize 48x48 assets/favicon.svg assets/favicon.png
magick -background white -resize 1024x1024 assets/splash-icon.svg assets/splash-icon.png
```

## Configuration

The icons are configured in `app.json`:
- iOS: Uses `icon.png`
- Android: Uses `adaptive-icon.png` with white background
- Web: Uses `favicon.png`
- Splash: Uses `splash-icon.png` with white background
