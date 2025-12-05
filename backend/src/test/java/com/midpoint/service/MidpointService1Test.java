package com.midpoint.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.midpoint.dto.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MidpointService1Test {

    @Mock
    private WebClient webClient;

    @Mock
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;

    @Mock
    private WebClient.RequestHeadersSpec requestHeadersSpec;

    @Mock
    private WebClient.ResponseSpec responseSpec;

    @InjectMocks
    private MidpointService midpointService;

    private ObjectMapper objectMapper;
    private String apiKey = "test-api-key";

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        ReflectionTestUtils.setField(midpointService, "apiKey", apiKey);
        ReflectionTestUtils.setField(midpointService, "objectMapper", objectMapper);
        ReflectionTestUtils.setField(midpointService, "webClient", webClient);
    }

    @Test
    void testCalculateCentroid_SingleCoordinate() {
        List<Coordinates> coords = Arrays.asList(new Coordinates(40.7128, -74.0060));
        Coordinates result = midpointService.calculateCentroid(coords);
        
        assertNotNull(result);
        assertEquals(40.7128, result.getLat(), 0.0001);
        assertEquals(-74.0060, result.getLng(), 0.0001);
    }

    @Test
    void testCalculateCentroid_MultipleCoordinates() {
        List<Coordinates> coords = Arrays.asList(
            new Coordinates(40.7128, -74.0060),
            new Coordinates(40.7589, -73.9851),
            new Coordinates(40.7489, -73.9680)
        );
        Coordinates result = midpointService.calculateCentroid(coords);
        
        assertNotNull(result);
        assertTrue(result.getLat() >= 40.7128 && result.getLat() <= 40.7589);
        assertTrue(result.getLng() >= -74.0060 && result.getLng() <= -73.9680);
    }

    @Test
    void testCalculateCentroid_EmptyList() {
        List<Coordinates> coords = new ArrayList<>();
        
        assertThrows(IllegalArgumentException.class, () -> {
            midpointService.calculateCentroid(coords);
        });
    }

    @Test
    void testCalculateGeodesicMidpoint() {
        Coordinates a = new Coordinates(40.7128, -74.0060);
        Coordinates b = new Coordinates(40.7589, -73.9851);
        
        Coordinates result = midpointService.calculateGeodesicMidpoint(a, b);
        
        assertNotNull(result);
        assertTrue(result.getLat() >= 40.7128 && result.getLat() <= 40.7589);
        assertTrue(result.getLng() >= -74.0060 && result.getLng() <= -73.9851);
    }

    @Test
    void testCalculateDistance() {
        Coordinates coord1 = new Coordinates(40.7128, -74.0060);
        Coordinates coord2 = new Coordinates(40.7589, -73.9851);
        
        double distance = midpointService.calculateDistance(coord1, coord2);
        
        assertTrue(distance > 0);
        assertTrue(distance < 100); // Should be less than 100 miles for NYC coordinates
    }

    @Test
    void testComputeDynamicRadiusMeters_SingleCoordinate() {
        List<Coordinates> coords = Arrays.asList(new Coordinates(40.7128, -74.0060));
        
        int radius = midpointService.computeDynamicRadiusMeters(coords);
        
        assertTrue(radius >= 1000 && radius <= 50000);
    }

    @Test
    void testComputeDynamicRadiusMeters_MultipleCoordinates() {
        List<Coordinates> coords = Arrays.asList(
            new Coordinates(40.7128, -74.0060),
            new Coordinates(40.7589, -73.9851)
        );
        
        int radius = midpointService.computeDynamicRadiusMeters(coords);
        
        assertTrue(radius >= 500 && radius <= 50000);
    }

    @Test
    void testValidateAndCorrectMidpoint_ValidMidpoint() {
        Coordinates midpoint = new Coordinates(40.7350, -73.9950);
        List<Coordinates> coords = Arrays.asList(
            new Coordinates(40.7128, -74.0060),
            new Coordinates(40.7589, -73.9851)
        );
        
        Coordinates result = midpointService.validateAndCorrectMidpoint(midpoint, coords);
        
        assertNotNull(result);
        assertEquals(midpoint.getLat(), result.getLat(), 0.0001);
        assertEquals(midpoint.getLng(), result.getLng(), 0.0001);
    }

    @Test
    void testValidateAndCorrectMidpoint_SingleCoordinate() {
        Coordinates midpoint = new Coordinates(40.7128, -74.0060);
        List<Coordinates> coords = Arrays.asList(new Coordinates(40.7128, -74.0060));
        
        Coordinates result = midpointService.validateAndCorrectMidpoint(midpoint, coords);
        
        assertEquals(midpoint.getLat(), result.getLat(), 0.0001);
        assertEquals(midpoint.getLng(), result.getLng(), 0.0001);
    }

    @Test
    void testValidateAndCorrectMidpoint_InvalidMidpoint() {
        // Create a midpoint that's too far from the input coordinates
        Coordinates midpoint = new Coordinates(40.9000, -74.1000); // Far from inputs
        List<Coordinates> coords = Arrays.asList(
            new Coordinates(40.7128, -74.0060),
            new Coordinates(40.7589, -73.9851)
        );
        
        Coordinates result = midpointService.validateAndCorrectMidpoint(midpoint, coords);
        
        assertNotNull(result);
        // Should be corrected to geodesic midpoint
        assertNotEquals(midpoint.getLat(), result.getLat(), 0.1);
    }

    @Test
    void testReverseGeocode_Success() {
        Coordinates coordinates = new Coordinates(40.7128, -74.0060);
        String mockResponse = "{\"status\":\"OK\",\"results\":[{\"formatted_address\":\"New York, NY, USA\"}]}";
        
        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));
        
        Mono<String> result = midpointService.reverseGeocode(coordinates);
        
        StepVerifier.create(result)
            .expectNext("New York, NY, USA")
            .verifyComplete();
    }

    @Test
    void testReverseGeocode_Error() {
        Coordinates coordinates = new Coordinates(40.7128, -74.0060);
        
        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.error(new RuntimeException("API Error")));
        
        Mono<String> result = midpointService.reverseGeocode(coordinates);
        
        StepVerifier.create(result)
            .expectNextMatches(address -> address.contains("40.7128") && address.contains("-74.0060"))
            .verifyComplete();
    }


}

