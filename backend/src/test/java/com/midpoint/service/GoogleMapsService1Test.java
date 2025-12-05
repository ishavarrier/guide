package com.midpoint.service;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings({"unchecked", "rawtypes"})
class GoogleMapsService1Test {

    @Mock
    private WebClient webClient;

    @Mock
    private WebClient.RequestBodyUriSpec requestBodyUriSpec;

    @Mock
    private WebClient.RequestBodySpec requestBodySpec;

    @Mock
    private WebClient.RequestHeadersSpec requestHeadersSpec;

    @Mock
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;

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
    void testGetPlaceAutocomplete_Success() {
        String input = "New York";
        String session = "sess-123";
        String mockResponse = """
            {
              "predictions": [
                {
                  "place_id": "pid-1",
                  "description": "Place One, New York, NY",
                  "structured_formatting": {
                    "main_text": "Place One",
                    "secondary_text": "New York, NY"
                  }
                },
                {
                  "place_id": "pid-2",
                  "description": "Place Two, Brooklyn, NY",
                  "structured_formatting": {
                    "main_text": "Place Two"
                  }
                }
              ],
              "status": "OK"
            }
            """;

        when(webClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.header(anyString(), anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.bodyValue(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));

        Mono<List<PlacePrediction>> mono = googleMapsService.getPlaceAutocomplete(input, session);

        StepVerifier.create(mono)
            .assertNext(predictions -> {
                assertEquals(2, predictions.size());

                PlacePrediction p1 = predictions.get(0);
                assertEquals("pid-1", p1.getPlaceId());
                assertEquals("Place One, New York, NY", p1.getDescription());
                assertNotNull(p1.getStructuredFormatting());
                assertEquals("Place One", p1.getStructuredFormatting().getMainText());
                assertEquals("New York, NY", p1.getStructuredFormatting().getSecondaryText());

                PlacePrediction p2 = predictions.get(1);
                assertEquals("pid-2", p2.getPlaceId());
                assertEquals("Place Two, Brooklyn, NY", p2.getDescription());
                assertNotNull(p2.getStructuredFormatting());
                assertEquals("Place Two", p2.getStructuredFormatting().getMainText());
                assertNull(p2.getStructuredFormatting().getSecondaryText());
            })
            .verifyComplete();

        ArgumentCaptor<String> urlCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> bodyCaptor = ArgumentCaptor.forClass(String.class);
        verify(requestBodyUriSpec).uri(urlCaptor.capture());
        verify(requestBodySpec).bodyValue(bodyCaptor.capture());
        assertEquals("https://places.googleapis.com/v1/places:autocomplete", urlCaptor.getValue());
        assertTrue(bodyCaptor.getValue().contains("\"input\":\"New York\""));
        verify(requestBodySpec, atLeastOnce()).header(eq("Content-Type"), anyString());
        verify(requestBodySpec, atLeastOnce()).header(eq("X-Goog-Api-Key"), eq(apiKey));
    }

    @Test
    void testGetPlaceAutocomplete_EmptyResults() {
        String input = "Nowhere";
        String session = "sess-123";
        String mockResponse = "{\"predictions\":[],\"status\":\"OK\"}";

        when(webClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.header(anyString(), anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.bodyValue(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));

        Mono<List<PlacePrediction>> mono = googleMapsService.getPlaceAutocomplete(input, session);

        StepVerifier.create(mono)
            .assertNext(list -> assertTrue(list.isEmpty()))
            .verifyComplete();
    }

    @Test
    void testParseAutocompleteResponse_MultiplePredictions_Loop() {
        // Test the loop in parseAutocompleteResponse (line 70)
        // This ensures the loop processes all predictions in the array
        String mockResponse = """
            {
              "predictions": [
                {
                  "place_id": "pid-1",
                  "description": "First Place, City, State",
                  "structured_formatting": {
                    "main_text": "First Place"
                  }
                },
                {
                  "place_id": "pid-2",
                  "description": "Second Place, City, State",
                  "structured_formatting": {
                    "main_text": "Second Place"
                  }
                },
                {
                  "place_id": "pid-3",
                  "description": "Third Place, City, State",
                  "structured_formatting": {
                    "main_text": "Third Place"
                  }
                }
              ],
              "status": "OK"
            }
            """;

        when(webClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.header(anyString(), anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.bodyValue(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));

        Mono<List<PlacePrediction>> mono = googleMapsService.getPlaceAutocomplete("test", "session-123");

        StepVerifier.create(mono)
            .assertNext(predictions -> {
                // The loop should process all 3 predictions
                assertEquals(3, predictions.size(), 
                    "Loop should process all 3 predictions");
                
                // Verify each prediction was processed by the loop
                assertEquals("pid-1", predictions.get(0).getPlaceId());
                assertEquals("pid-2", predictions.get(1).getPlaceId());
                assertEquals("pid-3", predictions.get(2).getPlaceId());
            })
            .verifyComplete();
    }


}
