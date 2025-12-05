# Midpoint Backend

A Spring Boot backend service that provides Google Maps Places API integration for the Midpoint Activity Finder React Native app.

## 🚀 Quick Start

### Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- Google Maps API key

### Setup

1. **Clone and navigate to backend directory**:

   ```bash
   cd backend
   ```

2. **Set your Google Maps API key**:

   ```bash
   export GOOGLE_MAPS_API_KEY="your_api_key_here"
   ```

3. **Build and run**:

   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

4. **Test the service**:
   ```bash
   curl http://localhost:8080/api/places/health
   ```

## 🔧 Configuration

### Environment Variables

| Variable              | Description         | Default                    |
| --------------------- | ------------------- | -------------------------- |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | `YOUR_GOOGLE_MAPS_API_KEY` |
| `SERVER_PORT`         | Server port         | `8080`                     |

### Application Properties

The application uses `application.yml` for configuration:

```yaml
server:
  port: 8080

google:
  maps:
    api:
      key: ${GOOGLE_MAPS_API_KEY:YOUR_GOOGLE_MAPS_API_KEY}

cors:
  allowed-origins: "*"
  allowed-methods: "GET,POST,PUT,DELETE,OPTIONS"
  allowed-headers: "*"
```

## 📡 API Endpoints

### Health Check

```http
GET /api/places/health
```

**Response:**

```
Places API is running
```

### Place Autocomplete

```http
GET /api/places/autocomplete?input={query}&sessionToken={token}
```

**Parameters:**

- `input` (required): Search query
- `sessionToken` (optional): Session token for billing

**Response:**

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

### Place Details

```http
GET /api/places/details?placeId={id}&sessionToken={token}
```

**Parameters:**

- `placeId` (required): Google Places ID
- `sessionToken` (optional): Session token for billing

**Response:**

```json
{
  "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
  "name": "Starbucks",
  "formatted_address": "123 Main St, New York, NY 10001, USA",
  "geometry": {
    "location": {
      "lat": 40.7128,
      "lng": -74.006
    }
  },
  "rating": 4.2,
  "types": ["cafe", "food", "point_of_interest", "establishment"]
}
```

## 🏗️ Architecture

### Components

- **PlacesController**: REST endpoints for place operations
- **GoogleMapsService**: Service layer for Google Maps API integration
- **DTOs**: Data transfer objects for API responses
- **CorsConfig**: CORS configuration for cross-origin requests

### Data Flow

```
React Native App
    ↓ HTTP Request
PlacesController
    ↓ Service Call
GoogleMapsService
    ↓ HTTP Request
Google Maps Places API
    ↓ Response
GoogleMapsService
    ↓ Processed Data
PlacesController
    ↓ JSON Response
React Native App
```

## 🔒 Security

### CORS Configuration

The application includes CORS configuration to allow cross-origin requests from the React Native app.

### API Key Security

- Store API keys in environment variables
- Never commit API keys to version control
- Use restricted API keys in production

## 🧪 Testing

### Manual Testing

1. **Health Check**:

   ```bash
   curl http://localhost:8080/api/places/health
   ```

2. **Autocomplete Test**:

   ```bash
   curl "http://localhost:8080/api/places/autocomplete?input=Starbucks"
   ```

3. **Place Details Test**:
   ```bash
   curl "http://localhost:8080/api/places/details?placeId=ChIJN1t_tDeuEmsRUsoyG83frY4"
   ```

### Unit Testing

```bash
mvn test
```

## 🚀 Production Deployment

### Environment Setup

```bash
export GOOGLE_MAPS_API_KEY="your_production_api_key"
export SPRING_PROFILES_ACTIVE="production"
```

### Docker Deployment

```dockerfile
FROM openjdk:17-jdk-slim
COPY target/midpoint-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Security Considerations

- Use HTTPS
- Implement rate limiting
- Add authentication if needed
- Monitor API usage
- Set up proper CORS origins

## 📊 Monitoring

### Health Checks

- Application health: `/api/places/health`
- Google Maps API connectivity: Check logs for API errors

### Logging

The application logs all API requests and responses. Check logs for:

- API key issues
- Rate limiting
- Network connectivity
- Response parsing errors

## 🔧 Troubleshooting

### Common Issues

1. **API Key Not Set**:

   ```
   Error: Google Maps API key not configured
   ```

   Solution: Set `GOOGLE_MAPS_API_KEY` environment variable

2. **CORS Errors**:

   ```
   Access to fetch at 'http://localhost:8080' from origin 'http://localhost:3000' has been blocked by CORS policy
   ```

   Solution: Check CORS configuration in `CorsConfig.java`

3. **Google Maps API Errors**:
   ```
   Error: REQUEST_DENIED
   ```
   Solution: Check API key restrictions and enabled APIs

### Debug Mode

Enable debug logging by setting:

```yaml
logging:
  level:
    com.midpoint: DEBUG
```

## 📈 Performance

### Optimization Tips

- Use session tokens for billing optimization
- Implement caching for frequently requested places
- Add rate limiting to prevent abuse
- Monitor API quota usage

### Scaling

- Use load balancers for multiple instances
- Implement connection pooling
- Add caching layer (Redis)
- Monitor memory and CPU usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
