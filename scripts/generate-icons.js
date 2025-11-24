const fs = require('fs');
const path = require('path');

// SVG template based on the Logo component
const generateSVG = (size, withBackground = true) => {
    const bgRect = withBackground
        ? `<rect width="${size}" height="${size}" fill="#ffffff"/>`
        : '';

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  ${bgRect}
  <defs>
    <linearGradient id="grad1" x1="0" y1="0" x2="120" y2="120">
      <stop offset="0" stop-color="#FF7F50" />
      <stop offset="1" stop-color="#FF4500" />
    </linearGradient>
    <linearGradient id="grad2" x1="120" y1="0" x2="0" y2="120">
      <stop offset="0" stop-color="#4A90E2" />
      <stop offset="1" stop-color="#0056b3" />
    </linearGradient>
  </defs>
  
  <!-- Outer Ring / Coin Shape -->
  <circle cx="60" cy="60" r="50" stroke="url(#grad1)" stroke-width="8" stroke-opacity="0.2" />
  
  <!-- Abstract Chart / Graph Lines -->
  <path
    d="M35 75 L55 55 L70 70 L90 40"
    stroke="url(#grad1)"
    stroke-width="8"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  
  <!-- Dot at the peak -->
  <circle cx="90" cy="40" r="6" fill="url(#grad2)" />
</svg>`;
};

const assetsDir = path.join(__dirname, '..', 'assets');

// Generate icon.png (1024x1024)
fs.writeFileSync(
    path.join(assetsDir, 'icon.svg'),
    generateSVG(1024, true)
);

// Generate adaptive-icon.png (1024x1024, transparent background)
fs.writeFileSync(
    path.join(assetsDir, 'adaptive-icon.svg'),
    generateSVG(1024, false)
);

// Generate favicon (48x48)
fs.writeFileSync(
    path.join(assetsDir, 'favicon.svg'),
    generateSVG(48, true)
);

// Generate splash-icon (1024x1024)
fs.writeFileSync(
    path.join(assetsDir, 'splash-icon.svg'),
    generateSVG(1024, true)
);

console.log('✅ SVG files generated successfully!');
console.log('\nNext steps:');
console.log('1. Convert SVG files to PNG using an online tool or ImageMagick');
console.log('2. Or use the SVG files directly (Expo supports SVG for some assets)');
console.log('\nGenerated files:');
console.log('  - assets/icon.svg');
console.log('  - assets/adaptive-icon.svg');
console.log('  - assets/favicon.svg');
console.log('  - assets/splash-icon.svg');
