#!/usr/bin/env bash
set -e  # exit on first error

# ----- Load env vars from .env.local if it exists -----
ENV_FILE=".env.local"

if [ -f "$ENV_FILE" ]; then
  echo "Loading environment from $ENV_FILE"
  # export everything in the file as env vars
  set -o allexport
  # shellcheck source=/dev/null
  source "$ENV_FILE"
  set +o allexport
else
  echo "⚠️  $ENV_FILE not found. Using whatever is already in your environment."
fi


# ----- Start Expo -----
echo "✅ Environment loaded. Starting Expo..."
# Use npx so users don’t need a global expo-cli
npx expo start --tunnel
