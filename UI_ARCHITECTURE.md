# Midpoint Native UI Architecture Guide

## Overview
This document provides a comprehensive guide to understanding the UI structure of the midpoint-native application and how to efficiently overhaul it.

## Tech Stack

### Core Technologies
- **React Native** (0.81.5) - Mobile framework
- **Expo** (~54.0.18) - Development platform and tooling
- **Expo Router** (~6.0.13) - File-based routing (like Next.js)
- **TypeScript** - Type safety
- **NativeWind** (^4.2.1) - Tailwind CSS for React Native
- **Tailwind CSS** (^3.4.18) - Utility-first CSS framework

### Key Libraries
- **Lucide React Native** - Icon library
- **React Native Reanimated** - Animations
- **Expo Linear Gradient** - Gradient backgrounds
- **React Native Safe Area Context** - Safe area handling
- **Expo Contacts** - Contact access
- **Expo Haptics** - Haptic feedback

## Project Structure

```
midpoint-native/
├── app/                    # Screen components (file-based routing)
│   ├── _layout.tsx        # Root layout with navigation setup
│   ├── index.tsx          # Login/Welcome screen
│   ├── locations.tsx      # Location selection screen
│   ├── map.tsx            # Map/results screen
│   └── poll.tsx           # Voting/polling screen
│
├── components/            # Reusable UI components
│   ├── ui/               # Base UI component library
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Label.tsx
│   │   └── Separator.tsx
│   │
│   ├── ActivitySelector.tsx        # Activity type selector
│   ├── FriendCarousel.tsx          # Friend selection carousel
│   └── LocationInputWithAutocomplete.tsx  # Location autocomplete input
│
├── utils/                # Utility functions
│   ├── cn.ts            # className utility (clsx + tailwind-merge)
│   ├── haptics.ts       # Haptic feedback helpers
│   ├── types.ts         # TypeScript type definitions
│   └── network.ts       # Network utilities
│
├── hooks/               # Custom React hooks
│   └── useLocationSearch.ts  # Location search hook
│
├── services/            # API services
│   └── PlacesService.ts # Google Places API service
│
├── config/              # Configuration
│   └── environment.ts   # Environment variables
│
├── constants/           # Constants
│   ├── Colors.ts
│   └── dimensions.ts
│
├── tailwind.config.js   # Tailwind configuration
├── global.css          # Global styles
└── package.json        # Dependencies
```

## Design System

### Color Palette
The app uses a custom color palette defined in `tailwind.config.js`:

- **Primary**: `#c2410c` (Orange)
- **Secondary**: `#2563eb` (Blue)
- **Background**: `#ffffff` (White)
- **Foreground**: `#1e293b` (Dark gray)
- **Muted**: `#f1f5f9` (Light gray)
- **Border**: `#e2e8f0` (Gray border)

### Styling Approach

#### 1. **NativeWind (Tailwind CSS)**
- Primary styling method
- Utility-first classes (e.g., `className="flex-row items-center"`)
- Configured in `tailwind.config.js`
- Used throughout components via `className` prop

#### 2. **StyleSheet API**
- Used in some screens (index.tsx, locations.tsx)
- Traditional React Native styling
- Used for complex styles or when Tailwind isn't sufficient

#### 3. **Mixed Approach**
- Many components use both NativeWind and StyleSheet
- NativeWind for layout and spacing
- StyleSheet for complex or dynamic styles

### Component Patterns

#### Base UI Components (`components/ui/`)
These follow a shadcn/ui-inspired pattern:
- **Composable**: Can be combined (Card + CardContent)
- **Customizable**: Accept `className` prop for styling
- **Type-safe**: Full TypeScript support
- **Consistent**: Use design system colors and spacing

Example:
```tsx
<Card className="border-secondary/20">
  <CardContent className="p-4">
    <Text>Content</Text>
  </CardContent>
</Card>
```

#### Screen Components (`app/`)
Each screen follows a similar structure:
1. **SafeAreaView** - Handles safe areas
2. **LinearGradient** - Background gradient
3. **Card** - Main content container
4. **Header** - Gradient header with icon and title
5. **Content** - Form/content area
6. **Actions** - Buttons and interactions

## Screen Breakdown

### 1. Login Screen (`app/index.tsx`)
**Purpose**: User onboarding and profile creation

**Key Features**:
- Profile picture upload
- Name and phone input
- Gradient background (`#dbeafe` to `#fef3c7`)
- Gradient header (`#c2410c` to `#2563eb`)

**Styling**: Pure StyleSheet API

**Navigation**: Navigates to `/locations` on submit

### 2. Locations Screen (`app/locations.tsx`)
**Purpose**: Friend selection and location input

**Key Features**:
- Friend carousel (horizontal scroll)
- Location inputs with autocomplete
- Activity selector (restaurants, cafes, shopping)
- Add/remove location functionality
- Search button to find midpoint

**Styling**: Mixed (StyleSheet + NativeWind)

**Components Used**:
- `FriendCarousel`
- `LocationInputWithAutocomplete`
- `ActivitySelector`
- `Button`, `Card`, `Avatar`, `Separator` (from ui/)

**Navigation**: Navigates to `/map` with midpoint data

### 3. Map Screen (`app/map.tsx`)
**Purpose**: Display midpoint results and nearby places

**Key Features**:
- Midpoint location display
- List of nearby places
- Place details (rating, distance, travel times)
- Place photos
- Share button

**Styling**: Primarily NativeWind

**Components Used**:
- `Card`, `CardContent`
- `Badge`
- `Button`
- `Avatar`

**Navigation**: Navigates to `/poll` on share

### 4. Poll Screen (`app/poll.tsx`)
**Purpose**: Group voting and confirmation

**Key Features**:
- Vote confirmation UI
- Suggestion input
- Group response display
- Progress bar
- Real-time vote tracking

**Styling**: Primarily NativeWind

**Components Used**:
- `Card`, `CardContent`
- `Button`
- `Input`
- `Badge`
- `Avatar`
- `Separator`

## Key Components Deep Dive

### FriendCarousel (`components/FriendCarousel.tsx`)
- Horizontal scrollable list of friends
- Selection state management
- Contact integration (expo-contacts)
- Modal for adding friends
- Manual friend addition
- Uses `Avatar` component for display

### ActivitySelector (`components/ActivitySelector.tsx`)
- Icon-based activity selection
- Visual feedback on selection
- Uses StyleSheet for styling
- Haptic feedback on selection

### LocationInputWithAutocomplete (`components/LocationInputWithAutocomplete.tsx`)
- Google Places autocomplete
- Debounced search
- Suggestion dropdown
- Loading states
- Error handling
- Uses `useLocationSearch` hook

### UI Components (`components/ui/`)
All UI components use:
- `cn()` utility for className merging
- NativeWind for styling
- Consistent prop interfaces
- TypeScript types

## Styling Strategy for UI Overhaul

### Quick Wins (Time Savers)

#### 1. **Update Tailwind Config**
Location: `tailwind.config.js`
- Change colors in the `theme.extend.colors` section
- Update spacing, font sizes, border radius
- All components using Tailwind will automatically update

#### 2. **Update Global Styles**
Location: `global.css`
- Add custom CSS classes
- Override Tailwind defaults
- Add animation keyframes

#### 3. **Create Theme Constants**
Location: `constants/Colors.ts` (if exists) or create new file
- Centralize color definitions
- Update all StyleSheet references
- Makes theme switching easier

### Component-Level Updates

#### 1. **Base UI Components** (`components/ui/`)
**Priority**: HIGH
- These are used throughout the app
- Update once, affects everywhere
- Start here for maximum impact

**Files to Update**:
- `Button.tsx` - Update variants, colors, sizes
- `Card.tsx` - Update borders, shadows, spacing
- `Input.tsx` - Update input styling
- `Badge.tsx` - Update badge styles
- `Avatar.tsx` - Update avatar styling

#### 2. **Screen Components** (`app/`)
**Priority**: MEDIUM
- Update one screen at a time
- Test navigation between screens
- Ensure consistency

**Update Order**:
1. `index.tsx` (Login) - First impression
2. `locations.tsx` - Main interaction screen
3. `map.tsx` - Results display
4. `poll.tsx` - Final interaction

#### 3. **Feature Components** (`components/`)
**Priority**: MEDIUM
- Update based on usage frequency
- `FriendCarousel` - High visibility
- `ActivitySelector` - High visibility
- `LocationInputWithAutocomplete` - Functional, less visual impact

### Styling Migration Strategy

#### Option 1: Pure NativeWind (Recommended)
**Pros**:
- Consistent styling approach
- Easy to maintain
- Better performance (no StyleSheet overhead)
- Easier theme switching

**Cons**:
- Need to migrate existing StyleSheet code
- Learning curve if not familiar with Tailwind

**Steps**:
1. Convert StyleSheet styles to Tailwind classes
2. Remove StyleSheet imports
3. Update className props
4. Test thoroughly

#### Option 2: Hybrid Approach (Current)
**Pros**:
- No migration needed
- Use best tool for each case
- Gradual migration possible

**Cons**:
- Inconsistent styling approach
- Harder to maintain
- Two styling systems to understand

#### Option 3: Pure StyleSheet
**Pros**:
- Native React Native approach
- Full control
- No external dependencies

**Cons**:
- More verbose
- Harder to maintain consistency
- No utility classes

### Recommended Overhaul Approach

#### Phase 1: Design System Setup (1-2 days)
1. **Define new color palette**
   - Update `tailwind.config.js`
   - Create color constants file
   - Document color usage

2. **Update base UI components**
   - Start with `Button.tsx`
   - Update `Card.tsx`
   - Update `Input.tsx`
   - Test each component in isolation

3. **Create design tokens**
   - Spacing scale
   - Typography scale
   - Border radius scale
   - Shadow system

#### Phase 2: Screen Updates (3-5 days)
1. **Login Screen** (`index.tsx`)
   - Update gradients
   - Update form styling
   - Update button styles
   - Test user flow

2. **Locations Screen** (`locations.tsx`)
   - Update friend carousel
   - Update location inputs
   - Update activity selector
   - Update button styles

3. **Map Screen** (`map.tsx`)
   - Update place cards
   - Update header
   - Update list styling
   - Update badges

4. **Poll Screen** (`poll.tsx`)
   - Update vote UI
   - Update progress bar
   - Update suggestion form
   - Update response cards

#### Phase 3: Component Refinement (2-3 days)
1. **Update feature components**
   - `FriendCarousel.tsx`
   - `ActivitySelector.tsx`
   - `LocationInputWithAutocomplete.tsx`

2. **Add animations**
   - Use React Native Reanimated
   - Add transitions
   - Add micro-interactions

3. **Polish and test**
   - Test on iOS and Android
   - Test different screen sizes
   - Test dark mode (if implementing)
   - Fix any styling issues

## Key Files to Modify for Quick UI Changes

### 1. Color Scheme
**File**: `tailwind.config.js`
```javascript
colors: {
  primary: '#c2410c',  // Change this
  secondary: '#2563eb', // Change this
  // ... other colors
}
```

### 2. Global Styles
**File**: `global.css`
```css
/* Add custom styles here */
```

### 3. Component Styles
**Files**: 
- `components/ui/*.tsx` - Base components
- `app/*.tsx` - Screen components

### 4. Gradients
**Files**: 
- `app/index.tsx` - Login gradient
- `app/locations.tsx` - Locations gradient
- `app/map.tsx` - Map header gradient
- `app/poll.tsx` - Poll gradient

**Current gradients**:
- Background: `['#dbeafe', '#fef3c7']` (Blue to yellow)
- Header: `['#c2410c', '#2563eb']` (Orange to blue)

## Best Practices

### 1. Consistency
- Use design system colors
- Use consistent spacing (Tailwind spacing scale)
- Use consistent typography
- Use consistent border radius

### 2. Performance
- Prefer NativeWind over StyleSheet for simple styles
- Use StyleSheet.create() for complex styles
- Avoid inline styles
- Use React.memo() for expensive components

### 3. Maintainability
- Keep components small and focused
- Use composition over inheritance
- Document complex styling decisions
- Use TypeScript for type safety

### 4. Accessibility
- Use semantic components
- Provide proper labels
- Ensure sufficient color contrast
- Test with screen readers

## Common Patterns

### Card Pattern
```tsx
<Card className="border-secondary/20">
  <CardContent className="p-4">
    {/* Content */}
  </CardContent>
</Card>
```

### Button Pattern
```tsx
<Button 
  onPress={handlePress}
  variant="default"
  size="lg"
  className="w-full"
>
  <Text>Button Text</Text>
</Button>
```

### Input Pattern
```tsx
<Input
  placeholder="Enter text"
  value={value}
  onChangeText={setValue}
  className="w-full"
/>
```

### Gradient Header Pattern
```tsx
<LinearGradient colors={['#c2410c', '#2563eb']}>
  <View className="p-6">
    <Text className="text-white text-xl">Title</Text>
  </View>
</LinearGradient>
```

## Testing Your Changes

### 1. Visual Testing
- Test on iOS simulator
- Test on Android emulator
- Test on physical devices
- Test different screen sizes

### 2. Functional Testing
- Test navigation flow
- Test form submissions
- Test interactions
- Test error states

### 3. Performance Testing
- Check for re-renders
- Check for memory leaks
- Check for performance issues
- Profile with React DevTools

## Resources

### Documentation
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [NativeWind Docs](https://www.nativewind.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Native Docs](https://reactnative.dev/docs/getting-started)

### Tools
- [Expo DevTools](https://docs.expo.dev/workflow/expo-dev-tools/)
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/)

## Summary

### Quick Start Checklist
- [ ] Update `tailwind.config.js` with new colors
- [ ] Update base UI components (`components/ui/`)
- [ ] Update screen components (`app/`)
- [ ] Update feature components (`components/`)
- [ ] Test on iOS and Android
- [ ] Test navigation flow
- [ ] Polish and refine

### Time-Saving Tips
1. **Start with Tailwind config** - Changes propagate everywhere
2. **Update base components first** - Maximum impact
3. **Use component composition** - Reuse existing components
4. **Test incrementally** - Don't wait until the end
5. **Use design system** - Consistency saves time

### Key Takeaways
- The app uses **Expo Router** for file-based routing
- **NativeWind (Tailwind)** is the primary styling method
- **StyleSheet** is used for complex styles
- **Base UI components** are the foundation
- **Screen components** follow a consistent pattern
- **Design system** is defined in `tailwind.config.js`

Good luck with your UI overhaul! 🎨

