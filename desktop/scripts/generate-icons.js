/**
 * Generate app icons from SVG for electron-builder.
 *
 * Creates a 1024x1024 PNG that electron-builder converts to:
 *   - .icns for macOS
 *   - .ico for Windows
 *
 * Also creates a 16x16 and 32x32 tray icon PNG.
 *
 * Run: node scripts/generate-icons.js
 * Requires: sharp (npm install --save-dev sharp)
 */

const sharp = require('sharp')
const path = require('path')

const assetsDir = path.join(__dirname, '..', 'assets')

// ─── App Icon (1024x1024) ────────────────────────────────────
const appIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1024" y2="1024">
      <stop offset="0%" stop-color="#0d0d12"/>
      <stop offset="100%" stop-color="#0a0a0e"/>
    </linearGradient>
    <linearGradient id="glow" x1="512" y1="300" x2="512" y2="750" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#00f0ff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="220" fill="url(#bg)"/>
  <rect width="1024" height="1024" rx="220" fill="url(#glow)"/>
  <text x="512" y="520" text-anchor="middle" dominant-baseline="central"
        font-family="monospace, 'Courier New'" font-weight="bold" font-size="380">
    <tspan fill="white" opacity="0.95">48</tspan><tspan fill="#00f0ff">co</tspan>
  </text>
  <rect x="6" y="6" width="1012" height="1012" rx="217" fill="none" stroke="#00f0ff" stroke-opacity="0.15" stroke-width="2"/>
</svg>`

// ─── Tray Icon (microphone, high-contrast) ───────────────────
const trayIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <rect x="12" y="2" width="8" height="16" rx="4" fill="#00f0ff"/>
  <path d="M6 14a10 10 0 0020 0" stroke="#00f0ff" stroke-width="2.5" fill="none"/>
  <line x1="16" y1="24" x2="16" y2="30" stroke="#00f0ff" stroke-width="2.5"/>
  <line x1="11" y1="30" x2="21" y2="30" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
</svg>`

async function main() {
  // App icon — 1024x1024 PNG (electron-builder converts to .icns / .ico)
  await sharp(Buffer.from(appIconSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon.png'))
  console.log('Created: assets/icon.png (1024x1024)')

  // Tray icon — 32x32 PNG for system tray
  await sharp(Buffer.from(trayIconSvg))
    .resize(32, 32)
    .png()
    .toFile(path.join(assetsDir, 'tray-icon.png'))
  console.log('Created: assets/tray-icon.png (32x32)')

  // Tray icon — 16x16 PNG (macOS template image)
  await sharp(Buffer.from(trayIconSvg))
    .resize(16, 16)
    .png()
    .toFile(path.join(assetsDir, 'tray-iconTemplate.png'))
  console.log('Created: assets/tray-iconTemplate.png (16x16)')

  // Tray icon — 32x32 @2x for macOS Retina
  await sharp(Buffer.from(trayIconSvg))
    .resize(32, 32)
    .png()
    .toFile(path.join(assetsDir, 'tray-iconTemplate@2x.png'))
  console.log('Created: assets/tray-iconTemplate@2x.png (32x32)')

  console.log('\nDone. electron-builder will convert icon.png to .icns and .ico during build.')
}

main().catch(err => {
  console.error('Icon generation failed:', err)
  process.exit(1)
})
