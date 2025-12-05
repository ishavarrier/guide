# Required Assets for MidMeet Mobile App

## App Icons (PWA)

To complete the mobile experience, you'll need to create the following icon files:

### Required Sizes
- **icon-192.png** - 192x192px (Android home screen, splash screen)
- **icon-512.png** - 512x512px (Android splash screen, app drawer)
- **apple-touch-icon.png** - 180x180px (iOS home screen)

### Design Guidelines
- Use the MidMeet logo with the orange (#c2410c) and blue (#2563eb) colors
- Include a location pin or map element to represent the app's purpose
- Ensure the icon works on both light and dark backgrounds
- Consider using a solid background color (white or orange)
- Keep it simple and recognizable at small sizes

### Icon Design Suggestions
1. **Option 1**: Orange circle with white location pin and "MM" text
2. **Option 2**: Gradient from orange to blue with white pin icon
3. **Option 3**: Map marker combining orange and blue colors

## Where to Place Icons
```
/public/
  ├── icon-192.png
  ├── icon-512.png
  └── apple-touch-icon.png
```

## Favicon
- **vite.svg** - Already exists, but can be replaced with custom favicon
- Consider creating a 32x32px version for the browser tab

## Splash Screens (Optional but Recommended)

For a more native feel, create splash screens for iOS:

### iPhone Sizes
- 1125x2436 - iPhone X, XS, 11 Pro
- 1242x2688 - iPhone XS Max, 11 Pro Max
- 828x1792 - iPhone XR, 11
- 1170x2532 - iPhone 12, 12 Pro, 13, 13 Pro
- 1284x2778 - iPhone 12 Pro Max, 13 Pro Max

### iPad Sizes
- 1536x2048 - iPad Mini, iPad Air
- 2048x2732 - iPad Pro 12.9"

### Design for Splash Screens
- Use the gradient background (from-blue-50 to-orange-50)
- Center the MidMeet logo
- Add the tagline "Find Your Perfect Meeting Spot"
- Keep it simple and clean

## HTML Link Tags for iOS Splash Screens

Add these to `index.html` after creating the splash screens:

```html
<!-- iPhone X, XS, 11 Pro -->
<link rel="apple-touch-startup-image" 
      media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" 
      href="/splash-1125x2436.png">

<!-- iPhone XS Max, 11 Pro Max -->
<link rel="apple-touch-startup-image" 
      media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" 
      href="/splash-1242x2688.png">

<!-- Add more as needed -->
```

## Tools for Creating Icons

### Online Tools
- [Favicon.io](https://favicon.io/) - Generate favicons
- [Canva](https://www.canva.com/) - Design icons
- [PWA Builder](https://www.pwabuilder.com/) - Generate all PWA assets
- [App Icon Generator](https://www.appicon.co/) - Generate multiple sizes

### Design Software
- Figma - Design the icon
- Adobe Illustrator - Vector icons
- Sketch - macOS icon design

## Quick Start

If you want to get started quickly:

1. **Use PWA Builder**: Upload a 512x512 PNG to [pwabuilder.com](https://www.pwabuilder.com/imageGenerator)
2. It will generate all required sizes
3. Download and place them in the `/public` folder
4. Update the manifest.json paths if needed

## Testing Icons

### On iOS
1. Add the icons to the public folder
2. Deploy the app or run locally with HTTPS
3. Open in Safari and "Add to Home Screen"
4. Check that the icon appears correctly

### On Android
1. Add the icons to the public folder
2. Open in Chrome
3. Install the PWA
4. Check home screen and app drawer

## Current Icon Status

⚠️ **Icons not yet created** - Using placeholders
- The app will work without icons but won't look professional when installed
- Create and add icons as soon as possible for production use

## Icon Checklist

- [ ] Create 512x512px master icon
- [ ] Generate icon-192.png
- [ ] Generate icon-512.png
- [ ] Generate apple-touch-icon.png (180x180)
- [ ] Create favicon (32x32)
- [ ] Test on iOS device
- [ ] Test on Android device
- [ ] (Optional) Create splash screens
- [ ] (Optional) Add iOS splash screen link tags

## Brand Colors Reference

Use these exact colors from the MidMeet brand:
- Primary Orange: `#c2410c`
- Secondary Blue: `#2563eb`
- Background Gradient Start: `#EFF6FF` (blue-50)
- Background Gradient End: `#FFF7ED` (orange-50)
