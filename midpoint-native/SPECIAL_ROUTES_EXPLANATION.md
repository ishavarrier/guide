# Expo Router Special Routes Explanation

This document explains the special route files in the `app/` directory and how Expo Router uses them.

## Overview

Expo Router uses file-based routing, where files in the `app/` directory become routes. Some files have special prefixes (like `+`) or names that give them special behavior.

---

## 1. `+not-found.tsx` - 404 Error Screen

### Purpose
This is the **catch-all error screen** that displays when a user navigates to a route that doesn't exist.

### How It Works
- The `+` prefix is a special Expo Router convention for special routes
- Expo Router automatically shows this screen when:
  - User navigates to a non-existent route (e.g., `/invalid-route`)
  - Programmatically navigating to a route that doesn't exist
  - Deep linking to a route that was removed

### Current Implementation
- **Updated** to use your app's design system (colors, Button component)
- Shows an alert icon and error message
- Provides a "Go to Home" button to navigate back
- Uses theme colors from `constants/theme.ts`

### Usage
You don't need to call this screen directly - Expo Router handles it automatically:
```tsx
// This will trigger the not-found screen
router.push('/non-existent-route');
```

### When You'll See It
- Navigate to `/invalid` or any route that doesn't exist
- Typo in route name: `router.push('/locatons')` instead of `/locations`
- Route was deleted but still referenced somewhere

---

## 2. `+html.tsx` - Web HTML Template

### Purpose
This file **only runs on web builds** and configures the root HTML document for your web app.

### How It Works
- The `+` prefix marks it as a special route
- **Only executes on web** (iOS/Android ignore this file)
- Runs during **static rendering** (server-side/Node.js environment)
- Does NOT have access to browser APIs or DOM

### What It Does
1. **Sets up HTML structure**: Creates `<html>`, `<head>`, and `<body>` tags
2. **Adds meta tags**: 
   - Character encoding (`utf-8`)
   - Viewport settings (responsive design)
   - Browser compatibility
3. **Configures ScrollView**: Disables body scrolling so React Native `ScrollView` works properly on web
4. **Sets background colors**: 
   - Light mode: Cream (`#FFF0DD`) - matches your app theme
   - Dark mode: Dark gray (`#1e293b`)

### Current Implementation
- **Updated** to use your app's cream background color
- Prevents body scroll flickering
- Supports dark mode

### When It's Used
- **Web builds only** (expo start --web)
- When building static HTML for web deployment
- Does NOT affect iOS or Android builds

### Customization
You can add:
- Global CSS styles
- Font imports
- Analytics scripts
- SEO meta tags
- Favicon links

Example:
```tsx
<head>
  <meta name="description" content="Find the perfect midpoint for your meetup" />
  <link rel="icon" href="/favicon.ico" />
  {/* Add more head elements */}
</head>
```

---

## 3. `modal.tsx` - Modal Screen Template

### Purpose
This is a **template file** for creating modal/overlay screens. Currently **not configured** as a modal in your app.

### How It Works
- By default, it's just a regular route (not a modal)
- To make it a modal, you need to configure it in `_layout.tsx`
- Modals typically slide up from the bottom (iOS) or fade in (Android)

### Current Status
- **Not registered** in `_layout.tsx`, so it won't appear in navigation
- Uses old template code (`EditScreenInfo`, `Themed` components)
- Not currently used in your app

### To Use It as a Modal

#### Step 1: Update `_layout.tsx`
```tsx
function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="locations" />
      <Stack.Screen name="map" />
      <Stack.Screen name="poll" />
      {/* Add modal configuration */}
      <Stack.Screen 
        name="modal" 
        options={{ 
          presentation: 'modal',  // Makes it a modal!
          headerShown: true,
          title: 'Modal Screen'
        }} 
      />
    </Stack>
  );
}
```

#### Step 2: Navigate to it
```tsx
// From any screen
router.push('/modal');
```

#### Step 3: Update the component
Replace the template code with your actual modal content using your design system.

### Modal Presentation Styles
- `'modal'`: Slides up from bottom (iOS) or fades in (Android)
- `'transparentModal'`: Transparent overlay
- `'fullScreenModal'`: Full screen modal
- `'formSheet'`: Form sheet style (iOS only)

### Example Use Cases
- Settings screen
- User profile editor
- Confirmation dialogs
- Filters/options panel
- Help/About screen

### Should You Keep It?
**Options:**
1. **Delete it** if you don't need modals
2. **Keep and update it** if you want to use modals later
3. **Configure it now** if you have a use case (like a settings screen)

---

## Special File Prefixes in Expo Router

### `+` Prefix
Files with `+` prefix are special routes:
- `+not-found.tsx`: 404 screen
- `+html.tsx`: Web HTML template
- `+layout.tsx`: Layout wrapper (you have `_layout.tsx` which is similar)
- `+error.tsx`: Error boundary screen (optional)

### `_` Prefix
Files with `_` prefix are ignored by routing:
- `_layout.tsx`: Layout file (not a route)
- Files starting with `_` won't become routes

### Regular Files
Files without special prefixes become routes:
- `index.tsx` → `/`
- `locations.tsx` → `/locations`
- `map.tsx` → `/map`
- `poll.tsx` → `/poll`

---

## Summary

| File | Purpose | Status | Action Needed |
|------|---------|--------|---------------|
| `+not-found.tsx` | 404 error screen | ✅ Updated | None - working correctly |
| `+html.tsx` | Web HTML template | ✅ Updated | None - working correctly |
| `modal.tsx` | Modal screen template | ⚠️ Not configured | Delete or configure as needed |

---

## Recommendations

### 1. Keep `+not-found.tsx`
- ✅ Already updated to match your design
- ✅ Provides good user experience for errors
- ✅ No changes needed

### 2. Keep `+html.tsx`
- ✅ Already updated with your theme colors
- ✅ Essential for web builds
- ✅ No changes needed (unless you want to add more meta tags)

### 3. Decide on `modal.tsx`
- **Option A**: Delete it if you don't need modals
- **Option B**: Keep it for future use (settings, help, etc.)
- **Option C**: Configure it now if you have a use case

If you want to delete it:
```bash
rm app/modal.tsx
```

If you want to use it, update it to match your design system and configure it in `_layout.tsx`.

---

## Testing

### Test `+not-found.tsx`
```tsx
// Navigate to a non-existent route
router.push('/this-does-not-exist');
// Should show the not-found screen
```

### Test `+html.tsx`
```bash
# Run web version
npx expo start --web
# Check the HTML source - should see your cream background
```

### Test `modal.tsx`
```tsx
// First configure it in _layout.tsx, then:
router.push('/modal');
// Should show as a modal (slides up from bottom on iOS)
```

---

## Additional Resources

- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [File-based Routing](https://docs.expo.dev/router/file-based-routing/)
- [Modals](https://docs.expo.dev/router/navigating-pages/#modals)
- [Special Routes](https://docs.expo.dev/router/advanced/stack/#special-routes)

