# Render Deployment Guide for React Native App

This guide explains how to deploy the React Native Expo app (from `midpoint-native` folder) to Render.

## Overview

The deployment uses the React Native code in the `midpoint-native` folder, which is built for web using Expo's static export feature.

## Configuration

### render.yaml

The `render.yaml` file has been configured to:

1. **Backend Service**: Deploy the Java Spring Boot backend from the `backend` folder
2. **Frontend Service**: Deploy the React Native Expo web app from the `midpoint-native` folder

### Frontend Service Details

- **Build Command**: `cd midpoint-native && npm install && npm run build:web`
  - Changes to the `midpoint-native` directory
  - Installs dependencies
  - Runs `expo export:web` which generates static files in the `dist` directory
- **Start Command**: `cd midpoint-native && npm run serve`
  - Changes to the `midpoint-native` directory
  - Serves the static files from `dist` using the `serve` package

**Important**: The build and start commands use `cd midpoint-native` to ensure Render builds from the correct folder. You may also want to set the **Root Directory** to `midpoint-native` in the Render dashboard (Settings → Build & Deploy → Root Directory) as an additional safeguard.

## Environment Variables

### Required Environment Variables

1. **EXPO_PUBLIC_API_BASE_URL**: The full URL to your backend API

   - Format: `https://your-backend-service.onrender.com/api/places`
   - **Important**: The `fromService` property in `render.yaml` may only provide the host. You may need to manually set this in the Render dashboard to include the full URL with protocol and path.

2. **PORT**: Set to `3000` (already configured in render.yaml)

3. **NODE_ENV**: Set to `production` (already configured in render.yaml)

### Setting Environment Variables in Render

1. Go to your Render dashboard
2. Navigate to your `midpoint-frontend` service
3. Go to the **Environment** tab
4. Add or update `EXPO_PUBLIC_API_BASE_URL` with the full backend URL:
   ```
   https://midpoint-backend.onrender.com/api/places
   ```
   (Replace `midpoint-backend` with your actual backend service name)

## Build Process

1. **Clean Install**: The build command removes any existing `node_modules` and `package-lock.json` to avoid npm optional dependency issues
2. **Install Dependencies**: `npm install --legacy-peer-deps` installs all required packages with legacy peer dependency resolution
3. **Build Static Files**: `npm run build:web` runs `expo export:web` which:
   - Compiles the React Native code for web
   - Generates static HTML, CSS, and JavaScript files
   - Outputs everything to the `dist` directory
4. **Serve Static Files**: `npm run serve` starts a static file server on port 3000

## Troubleshooting

### Issue: Cannot find module @rollup/rollup-linux-x64-gnu

**Solution**: This is a known npm bug with optional dependencies. The build command already handles this by:

1. Removing `node_modules` and `package-lock.json` before installing
2. Using `--legacy-peer-deps` flag during installation

If you still encounter this error, you can try:

- Updating npm: `npm install -g npm@latest`
- Using yarn instead: Update build command to use `yarn install` instead of `npm install`

### Issue: Build fails with "expo export:web" not found

**Solution**: Make sure you're using Expo CLI v54+. The command should be available. If not, try:

```bash
npx expo export:web
```

### Issue: Files not found in dist directory

**Solution**: Check the Expo export output. The directory might be `web-build` instead of `dist`. If so, update the serve command in `package.json`:

```json
"serve": "npx serve web-build -l ${PORT:-3000}"
```

### Issue: API calls failing

**Solution**:

1. Verify `EXPO_PUBLIC_API_BASE_URL` is set correctly in Render dashboard
2. Ensure the backend service is running and accessible
3. Check that the URL includes the protocol (`https://`) and full path (`/api/places`)

### Issue: Port conflicts

**Solution**: Render automatically sets the `PORT` environment variable. The serve command uses `${PORT:-3000}` which means it will use the `PORT` env var if set, otherwise defaults to 3000.

## Testing Locally

Before deploying, you can test the build process locally:

```bash
cd midpoint-native
npm install
npm run build:web
npm run serve
```

Then visit `http://localhost:3000` to verify the app works.

## Notes

- The React Native app uses Expo Router for navigation
- Static export is configured in `app.json` with `"output": "static"`
- The app is built for web using `react-native-web` which allows React Native components to run in browsers
- All environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the Expo app
