# Midpoint Activity Finder - Backend & Frontend Integration

This document provides complete setup instructions for integrating the Java backend with Google Maps Places API and the React Native frontend.

## 🏗️ Architecture Overview

```
React Native App (Frontend)
    ↓ HTTP Requests
Java Spring Boot Backend
    ↓ Google Maps Places API
Google Maps Services
```

## 📋 Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- Node.js 16 or higher
- React Native development environment
- Google Cloud Platform account with Maps API enabled

## 🔑 API Key Setup

### 1. Google Cloud Platform Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Places API
   - Maps JavaScript API (if needed for frontend)
4. Create API keys:
   - **Backend API Key**: For server-side requests
   - **Frontend API Key**: For client-side requests (if needed)

### 2. API Key Security

#### Backend API Key

- Restrict to your server's IP address
- Restrict to Places API only
- Use environment variables for storage

#### Frontend API Key (if used)

- Restrict to your app's bundle ID
- Restrict to specific APIs
- Consider using proxy backend for better security

## 🚀 Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Configure API Key

#### Option A: Environment Variable (Recommended)

```bash
export GOOGLE_MAPS_API_KEY="your_backend_api_key_here"
```

#### Option B: Application Properties

Edit `src/main/resources/application.yml`:

```yaml
google:
  maps:
    api:
      key: "your_backend_api_key_here"
```

### 3. Build and Run Backend

```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 4. Test Backend

```bash
# Health check
curl http://localhost:8080/api/places/health

# Test autocomplete (replace with your search term)
curl "http://localhost:8080/api/places/autocomplete?input=New%20York"
```

## 📱 Frontend Setup

### 1. Install Dependencies

```bash
cd midpoint-native
npm install
```

### 2. Configure Backend URL

Edit `services/PlacesService.ts`:

```typescript
const API_BASE_URL = "http://localhost:8080/api/places"; // Change to your backend URL
```

For production, use your deployed backend URL:

```typescript
const API_BASE_URL = "https://your-backend-domain.com/api/places";
```

### 3. Run React Native App

```bash
# For iOS
npx expo start --ios

# For Android
npx expo start --android
```

## 🔧 Configuration Files

### Backend Configuration

#### `application.yml`

```yaml
server:
  port: 8080

google:
  maps:
    api:
      key: ${GOOGLE_MAPS_API_KEY:"AIzaSyBeqo4XHEXbH9Pc-MFHznozu8pGHEWEYVw"}

cors:
  allowed-origins: "*" # Configure properly for production
```

#### `CorsConfig.java`

```java
@Configuration
@Configuration
public class CorsConfig {
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    // use the actual web origin you see in the error
    config.setAllowedOriginPatterns(List.of("http://localhost:8081"));
    config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
    config.setAllowedHeaders(List.of("Content-Type","Authorization","X-Requested-With","Accept"));
    config.setExposedHeaders(List.of("Location")); // optional
    config.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
  }
}
```

### Frontend Configuration

#### `PlacesService.ts`

```typescript
const API_BASE_URL = "http://localhost:8080/api/places";
```

## 🧪 Testing the Integration

### 1. Backend Testing

```bash
# Test autocomplete
curl "http://localhost:8080/api/places/autocomplete?input=Starbucks"

# Test place details
curl "http://localhost:8080/api/places/details?placeId=ChIJN1t_tDeuEmsRUsoyG83frY4"
```

### 2. Frontend Testing

1. Open the React Native app
2. Navigate to the locations page
3. Start typing in a location input field
4. Verify autocomplete suggestions appear
5. Select a suggestion and verify it populates the field

## 🚀 Production Deployment

### Backend Deployment

1. **Environment Variables**:

   ```bash
   export GOOGLE_MAPS_API_KEY="your_production_api_key"
   export SPRING_PROFILES_ACTIVE="production"
   ```

2. **CORS Configuration**:
   Update `CorsConfig.java` to restrict origins:

   ```java
   configuration.setAllowedOrigins(Arrays.asList("https://your-app-domain.com"));
   ```

3. **Security**:
   - Use HTTPS
   - Implement rate limiting
   - Add authentication if needed
   - Monitor API usage

### Frontend Deployment

1. **Update API URL**:

   ```typescript
   const API_BASE_URL = "https://your-backend-domain.com/api/places";
   ```

2. **Build for Production**:
   ```bash
   npx expo build:android
   npx expo build:ios
   ```

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**:

   - Ensure backend CORS is configured correctly
   - Check allowed origins in production

2. **API Key Issues**:

   - Verify API key is correct
   - Check API restrictions in Google Cloud Console
   - Ensure required APIs are enabled

3. **Network Issues**:

   - Check backend is running
   - Verify network connectivity
   - Check firewall settings

4. **Autocomplete Not Working**:
   - Check console for errors
   - Verify backend health endpoint
   - Test API calls manually

### Debug Commands

```bash
# Check backend health
curl http://localhost:8080/api/places/health

# Test with verbose output
curl -v "http://localhost:8080/api/places/autocomplete?input=test"

# Check React Native logs
npx expo logs
```

## 📊 API Endpoints

### Backend Endpoints

- `GET /api/places/health` - Health check
- `GET /api/places/autocomplete?input={query}&sessionToken={token}` - Get place suggestions
- `GET /api/places/details?placeId={id}&sessionToken={token}` - Get place details

### Request/Response Examples

#### Autocomplete Request

```bash
GET /api/places/autocomplete?input=Starbucks&sessionToken=abc123
```

#### Autocomplete Response

```json
[
  {
    "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
    "description": "Starbucks, 123 Main St, New York, NY, USA",
    "structured_formatting": {
      "main_text": "Starbucks",
      "secondary_text": "123 Main St, New York, NY, USA"
    }
  }
]
```

## 🔒 Security Best Practices

1. **API Key Management**:

   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys regularly

2. **Backend Security**:

   - Implement rate limiting
   - Add request validation
   - Use HTTPS in production
   - Monitor for abuse

3. **Frontend Security**:
   - Validate all inputs
   - Sanitize user data
   - Use secure communication

## 📈 Monitoring and Analytics

1. **Backend Monitoring**:

   - Monitor API usage
   - Track response times
   - Set up alerts for errors

2. **Google Cloud Monitoring**:
   - Monitor API quota usage
   - Set up billing alerts
   - Track API performance

## 🆘 Support

For issues or questions:

1. Check this documentation
2. Review console logs
3. Test API endpoints manually
4. Check Google Cloud Console for API issues
