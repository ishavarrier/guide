# Testing the Midpoint API

## Test the new midpoint endpoint

You can test the new `/api/places/midpoint` endpoint with the following curl command:

```bash
curl -X POST http://localhost:8080/api/places/midpoint \
  -H "Content-Type: application/json" \
  -d '{
    "coords": [
      {"lat": 40.7128, "lng": -74.0060},
      {"lat": 40.7589, "lng": -73.9851}
    ],
    "filters": ["restaurant", "cafe"]
  }'
```

## Expected Response

The API will return a JSON response containing:

- `midpoint`: The calculated midpoint coordinates
- `midpoint_address`: The human-readable address of the midpoint
- `places`: An array of nearby restaurants/cafes with:
  - Basic info (name, address, rating, etc.)
  - Photos from Google Places
  - Travel summaries from each origin location
- `radius_meters`: The search radius used

## Features Implemented

✅ **Midpoint Calculation**: Spherical mean approximation for multiple coordinates  
✅ **Dynamic Radius**: Automatically calculates search radius based on input spread  
✅ **Place Search**: Finds restaurants, cafes, parks, etc. near the midpoint  
✅ **Photo URLs**: Includes Google Places photos  
✅ **Travel Summaries**: Distance/duration from each origin using Distance Matrix API  
✅ **Address Resolution**: Converts coordinates to human-readable addresses  
✅ **Error Handling**: Graceful fallbacks when APIs fail

## Environment Setup

Make sure your `.env` file in the `backend` directory contains:

```
GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

The backend will automatically load this environment variable and use it for all Google Maps API calls.
