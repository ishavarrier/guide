package com.midpoint.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.midpoint.dto.PlaceDetails;
import com.midpoint.dto.PlacePrediction;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings({"unchecked", "rawtypes"})
class GoogleMapsService2Test {

    @Mock
    private WebClient webClient;

    @Mock
    private WebClient.RequestBodyUriSpec requestBodyUriSpec;

    @Mock
    private WebClient.RequestBodySpec requestBodySpec;

    @Mock
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;

    @Mock
    private WebClient.RequestHeadersSpec requestHeadersSpec;

    @Mock
    private WebClient.ResponseSpec responseSpec;

    @InjectMocks
    private GoogleMapsService googleMapsService;

    private final String apiKey = "test-api-key";
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setup() {
        ReflectionTestUtils.setField(googleMapsService, "apiKey", apiKey);
        ReflectionTestUtils.setField(googleMapsService, "objectMapper", objectMapper);
        ReflectionTestUtils.setField(googleMapsService, "webClient", webClient);
    }


    @Test
    void testGetPlaceAutocomplete_ParseError_returnsEmptyList() {
        String input = "Bad JSON";
        String session = "sess-123";
        String invalidJson = "not-json";

        when(webClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.header(anyString(), anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.bodyValue(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(invalidJson));

        Mono<List<PlacePrediction>> mono = googleMapsService.getPlaceAutocomplete(input, session);

        StepVerifier.create(mono)
            .assertNext(list -> assertTrue(list.isEmpty()))
            .verifyComplete();
    }

    @Test
    void testGetPlaceAutocomplete_NetworkError_returnsEmptyList() {
        String input = "NYC";
        String session = "sess-999";

        when(webClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.header(anyString(), anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.bodyValue(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class))
            .thenReturn(Mono.error(new RuntimeException("network down")));

        Mono<List<PlacePrediction>> mono = googleMapsService.getPlaceAutocomplete(input, session);

        StepVerifier.create(mono)
            .assertNext(list -> assertTrue(list.isEmpty()))
            .verifyComplete();
    }



    @Test
    void testGetPlaceDetails_Success() {
        String placeId = "abc123";
        String session = "sess-1";
        String mockResponse = """
            {
              "result": {
                "place_id": "abc123",
                "name": "Test Cafe",
                "formatted_address": "123 Main St, New York, NY",
                "geometry": {
                  "location": {"lat": 40.7128, "lng": -74.0060}
                },
                "formatted_phone_number": "+1 212-555-0123",
                "website": "https://test.example.com",
                "rating": 4.6,
                "types": ["cafe", "food", "point_of_interest"]
              },
              "status": "OK"
            }
            """;

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));

        Mono<PlaceDetails> mono = googleMapsService.getPlaceDetails(placeId, session);

        StepVerifier.create(mono)
            .assertNext(details -> {
                assertEquals("abc123", details.getPlaceId());
                assertEquals("Test Cafe", details.getName());
                assertEquals("123 Main St, New York, NY", details.getFormattedAddress());
                assertNotNull(details.getGeometry());
                assertNotNull(details.getGeometry().getLocation());
                assertEquals(40.7128, details.getGeometry().getLocation().getLat(), 1e-6);
                assertEquals(-74.0060, details.getGeometry().getLocation().getLng(), 1e-6);
                assertEquals("+1 212-555-0123", details.getFormattedPhoneNumber());
                assertEquals("https://test.example.com", details.getWebsite());
                assertEquals(4.6, details.getRating(), 1e-9);
                assertArrayEquals(new String[] {"cafe", "food", "point_of_interest"}, details.getTypes());
            })
            .verifyComplete();

        ArgumentCaptor<String> urlCaptor = ArgumentCaptor.forClass(String.class);
        verify(requestHeadersUriSpec).uri(urlCaptor.capture());
        String used = urlCaptor.getValue();
        assertTrue(used.contains("place_id=" + placeId));
        assertTrue(used.contains("sessiontoken=" + session));
        assertTrue(used.contains("key=" + apiKey));
        assertTrue(used.contains("fields=place_id,name,formatted_address,geometry,formatted_phone_number,website,rating,types"));
    }

    @Test
    void testGetPlaceDetails_NoResult_returnsEmptyObject() {
        String placeId = "missing";
        String session = "sess-2";
        String mockResponse = "{\"status\":\"OK\"}";

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));

        Mono<PlaceDetails> mono = googleMapsService.getPlaceDetails(placeId, session);

        StepVerifier.create(mono)
            .assertNext(details -> {
                // all default/empty because result was absent
                assertNull(details.getPlaceId());
                assertNull(details.getName());
                assertNull(details.getFormattedAddress());
                assertNull(details.getGeometry());
                assertNull(details.getFormattedPhoneNumber());
                assertNull(details.getWebsite());
                assertNull(details.getTypes());
            })
            .verifyComplete();
    }

    @Test
    void testGetPlaceDetails_PartialFields() {
        String placeId = "partial";
        String session = "sess-3";
        String mockResponse = """
            {
              "result": {
                "place_id": "partial",
                "name": "Partial Place",
                "formatted_address": "Somewhere",
                "geometry": { }
              },
              "status": "OK"
            }
            """;

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));

        Mono<PlaceDetails> mono = googleMapsService.getPlaceDetails(placeId, session);

        StepVerifier.create(mono)
            .assertNext(details -> {
                assertEquals("partial", details.getPlaceId());
                assertEquals("Partial Place", details.getName());
                assertEquals("Somewhere", details.getFormattedAddress());
                // geometry present but no location inside
                assertNotNull(details.getGeometry());
                assertNull(details.getGeometry().getLocation());
                // optional fields absent
                assertNull(details.getFormattedPhoneNumber());
                assertNull(details.getWebsite());
                // assertNull(details.getRating());  // default double
                assertNull(details.getTypes());
            })
            .verifyComplete();
    }

    @Test
    void testGetPlaceDetails_ParseError_returnsEmptyObject() {
        String placeId = "oops";
        String session = "sess-4";
        String invalidJson = "not-json";

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        // parsePlaceDetailsResponse will throw; onErrorReturn(new PlaceDetails()) should catch
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(invalidJson));

        Mono<PlaceDetails> mono = googleMapsService.getPlaceDetails(placeId, session);

        StepVerifier.create(mono)
            .assertNext(details -> {
                assertNull(details.getPlaceId());
                assertNull(details.getName());
            })
            .verifyComplete();
    }

    @Test
    void testGetPlaceDetails_NetworkError_returnsEmptyObject() {
        String placeId = "neterr";
        String session = "sess-5";

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class))
            .thenReturn(Mono.error(new RuntimeException("down")));

        Mono<PlaceDetails> mono = googleMapsService.getPlaceDetails(placeId, session);

        StepVerifier.create(mono)
            .assertNext(details -> {
                assertNull(details.getPlaceId());
                assertNull(details.getName());
                assertNull(details.getFormattedAddress());
            })
            .verifyComplete();
    }
}
