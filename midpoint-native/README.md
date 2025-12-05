# Midpoint Native (Expo)

This package contains the Expo app for Midpoint. Follow the steps below to get it running locally.

## Quick start

1. Install prerequisites: Node.js, npm, Expo CLI, and Expo Go on your device.
2. Export the required Expo env vars (values are in the shared Google Doc). Example:
   ```bash
   export EXPO_PUBLIC_DEVICE_IP="your-ip"
   export EXPO_PUBLIC_API_BASE_URL="http://your-ip:8080/api/places"
   ```
3. Install dependencies and launch Expo:
   ```bash
   npm install
   npx expo start
   ```
   Press `i`/`a` for simulators or scan the QR code with Expo Go.

Make sure the backend is running and reachable, and repeat the export commands in each new terminal session.
