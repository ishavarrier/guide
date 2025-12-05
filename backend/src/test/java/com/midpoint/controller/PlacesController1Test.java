package com.midpoint.controller;

import com.midpoint.dto.*;
import com.midpoint.service.GoogleMapsService;
import com.midpoint.service.MidpointService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@WebFluxTest(
    controllers = PlacesController.class,
    excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.reactive.ReactiveSecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class
    }
)
class PlacesController1Test {

    @Autowired
    private WebTestClient webTestClient;

    @MockBean
    private GoogleMapsService googleMapsService;

    @MockBean
    private MidpointService midpointService;

    @MockBean
    private SecurityFilterChain securityFilterChain;

    @Test
    void testGetPlaceAutocomplete_Success() {
        PlacePrediction prediction = new PlacePrediction();
        prediction.setPlaceId("test-place-id");
        prediction.setDescription("Test Place, New York, NY, USA");
        
        PlacePrediction.StructuredFormatting formatting = new PlacePrediction.StructuredFormatting();
        formatting.setMainText("Test Place");
        formatting.setSecondaryText("New York, NY, USA");
        prediction.setStructuredFormatting(formatting);
        
        List<PlacePrediction> predictions = Arrays.asList(prediction);
        
        when(googleMapsService.getPlaceAutocomplete(eq("Test"), anyString()))
            .thenReturn(Mono.just(predictions));
        
        webTestClient.get()
            .uri("/api/places/autocomplete?input=Test")
            .exchange()
            .expectStatus().isOk()
            .expectHeader().contentType(MediaType.APPLICATION_JSON)
            .expectBodyList(PlacePrediction.class)
            .hasSize(1)
            .consumeWith(result -> {
                PlacePrediction response = result.getResponseBody().get(0);
                assertEquals("test-place-id", response.getPlaceId());
                assertEquals("Test Place, New York, NY, USA", response.getDescription());
            });
    }

    @Test
    void testGetPlaceAutocomplete_WithSessionToken() {
        List<PlacePrediction> predictions = Collections.emptyList();
        
        when(googleMapsService.getPlaceAutocomplete("Test", "custom-token"))
            .thenReturn(Mono.just(predictions));
        
        webTestClient.get()
            .uri("/api/places/autocomplete?input=Test&sessionToken=custom-token")
            .exchange()
            .expectStatus().isOk()
            .expectBodyList(PlacePrediction.class)
            .hasSize(0);
    }

    @Test
    void testGetPlaceAutocomplete_Error() {
        when(googleMapsService.getPlaceAutocomplete(eq("Test"), anyString()))
            .thenReturn(Mono.error(new RuntimeException("Service error")));
        
        webTestClient.get()
            .uri("/api/places/autocomplete?input=Test")
            .exchange()
            .expectStatus().is5xxServerError();
    }

    @Test
    void testGetPlaceDetails_Success() {
        PlaceDetails details = new PlaceDetails();
        details.setPlaceId("test-place-id");
        details.setName("Test Place");
        details.setFormattedAddress("123 Test St, New York, NY, USA");
        
        PlaceDetails.Geometry geometry = new PlaceDetails.Geometry();
        PlaceDetails.Geometry.Location location = new PlaceDetails.Geometry.Location();
        location.setLat(40.7128);
        location.setLng(-74.0060);
        geometry.setLocation(location);
        details.setGeometry(geometry);
        
        when(googleMapsService.getPlaceDetails(eq("test-place-id"), anyString()))
            .thenReturn(Mono.just(details));
        
        webTestClient.get()
            .uri("/api/places/details?placeId=test-place-id")
            .exchange()
            .expectStatus().isOk()
            .expectHeader().contentType(MediaType.APPLICATION_JSON)
            .expectBody(PlaceDetails.class)
            .consumeWith(result -> {
                PlaceDetails response = result.getResponseBody();
                assertEquals("test-place-id", response.getPlaceId());
                assertEquals("Test Place", response.getName());
                assertNotNull(response.getGeometry());
            });
    }

}

