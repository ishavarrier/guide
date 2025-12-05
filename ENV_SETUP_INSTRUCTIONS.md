# Environment Setup Instructions

This guide will help you set up the `.env` files to keep your sensitive information secure when uploading to GitHub.

## Backend Setup (.env file for Java Backend)

1. Navigate to the `backend` directory
2. Create a `.env` file (or copy from `.env.example` if it exists)
3. Add your Google Maps API key:

```
GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

4. Run the backend with the environment variable:

```bash
export GOOGLE_MAPS_API_KEY="your_actual_api_key_here"
cd backend
mvn spring-boot:run
```

Or you can use a package like `dotenv` if you prefer.

## Frontend Setup (.env file for React Native)

1. Navigate to the `midpoint-native` directory
2. Create a `.env` file with the following content:

```
EXPO_PUBLIC_DEVICE_IP=your_computer_ip_here
```

Example:

```
EXPO_PUBLIC_DEVICE_IP=192.168.1.237
```

**How to find your computer's IP:**

- **Mac/Linux**: Run `ipconfig getifaddr en0` (or `en1`, `en2`, etc.)
- **Windows**: Run `ipconfig` and look for "IPv4 Address" under your active network adapter

3. Restart your Expo development server after creating/updating the `.env` file

## What's Been Secured?

✅ Google Maps API key - moved to environment variables  
✅ Local IP addresses - moved to `.env` file  
✅ All `.env` files added to `.gitignore`

## Important Notes

- The `.env` files are now in `.gitignore` and will NOT be uploaded to GitHub
- Never commit your actual API keys or IP addresses
- Share `.env.example` files (without real values) as templates for other developers

## Files Modified

1. `backend/src/main/resources/application.yml` - Removed hardcoded API key
2. `backend/src/main/java/com/midpoint/service/GoogleMapsService.java` - Removed hardcoded fallback
3. `midpoint-native/utils/network.ts` - Now reads from environment variables
4. `midpoint-native/app.json` - Updated to use localhost for development
5. `.gitignore` - Added `.env` files
6. `midpoint-native/.gitignore` - Added `.env` files

Your code is now safe to commit to GitHub! 🎉
