# PWA Icons

This directory should contain the following icon files for PWA functionality:

## Required Icons

- `icon-16x16.png` - 16x16 pixels
- `icon-32x32.png` - 32x32 pixels  
- `icon-72x72.png` - 72x72 pixels
- `icon-96x96.png` - 96x96 pixels
- `icon-128x128.png` - 128x128 pixels
- `icon-144x144.png` - 144x144 pixels
- `icon-152x152.png` - 152x152 pixels
- `icon-192x192.png` - 192x192 pixels
- `icon-384x384.png` - 384x384 pixels
- `icon-512x512.png` - 512x512 pixels

## Optional Icons

- `dashboard-96x96.png` - Dashboard shortcut icon
- `vault-96x96.png` - Vault shortcut icon

## Icon Requirements

- **Format**: PNG
- **Purpose**: Should support both "any" and "maskable" purposes
- **Design**: Should work well on both light and dark backgrounds
- **Branding**: Should include the Nesto logo/identity

## Generation Tools

You can use tools like:
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [Real Favicon Generator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)

## Example Command

```bash
# Using PWA Asset Generator
npx pwa-asset-generator logo.png ./public/icons --icon-only --favicon --opaque false
```

## Current Status

⚠️ **Placeholder icons needed** - Replace with actual Nesto-branded icons for production use.
