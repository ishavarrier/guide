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
class PlacesControllerMidpointTest {

    @Autowired
    private WebTestClient webTestClient;

    @MockBean
    private GoogleMapsService googleMapsService;

    @MockBean
    private MidpointService midpointService;

    @MockBean
    private SecurityFilterChain securityFilterChain;

    @Test
    void testFindMidpoint_Success() {
        MidpointRequest request = new MidpointRequest();
        request.setCoords(Arrays.asList(
            new Coordinates(40.7128, -74.0060),
            new Coordinates(40.7589, -73.9851)
        ));
        request.setFilters(Arrays.asList("restaurant"));
        
        Coordinates midpoint = new Coordinates(40.7350, -73.9950);
        List<Place> places = Arrays.asList(createTestPlace());
        MidpointResponse response = new MidpointResponse(
            midpoint,
            "New York, NY, USA",
            places,
            8047
        );
        
        when(midpointService.findMidpointAndPlaces(any(MidpointRequest.class)))
            .thenReturn(Mono.just(response));
        
        webTestClient.post()
            .uri("/api/places/midpoint")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isOk()
            .expectHeader().contentType(MediaType.APPLICATION_JSON)
            .expectBody(MidpointResponse.class)
            .consumeWith(result -> {
                MidpointResponse responseBody = result.getResponseBody();
                assertNotNull(responseBody.getMidpoint());
                assertEquals("New York, NY, USA", responseBody.getMidpointAddress());
                assertEquals(1, responseBody.getPlaces().size());
                assertEquals(8047, responseBody.getRadiusMeters());
            });
    }

    @Test
    void testFindMidpoint_Error() {
        MidpointRequest request = new MidpointRequest();
        request.setCoords(Arrays.asList(new Coordinates(40.7128, -74.0060)));
        request.setFilters(Collections.emptyList());
        
        when(midpointService.findMidpointAndPlaces(any(MidpointRequest.class)))
            .thenReturn(Mono.error(new RuntimeException("Service error")));
        
        webTestClient.post()
            .uri("/api/places/midpoint")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isBadRequest();
    }

    @Test
    void testHealth() {
        webTestClient.get()
            .uri("/api/places/health")
            .exchange()
            .expectStatus().isOk()
            .expectBody(String.class)
            .isEqualTo("Places API is running");
    }

    @Test
    void testFindMidpoint_WithEmptyFilters() {
        MidpointRequest request = new MidpointRequest();
        request.setCoords(Arrays.asList(
            new Coordinates(40.7128, -74.0060),
            new Coordinates(40.7589, -73.9851)
        ));
        request.setFilters(Collections.emptyList());
        
        Coordinates midpoint = new Coordinates(40.7350, -73.9950);
        List<Place> places = Collections.emptyList();
        MidpointResponse response = new MidpointResponse(
            midpoint,
            "New York, NY, USA",
            places,
            8047
        );
        
        when(midpointService.findMidpointAndPlaces(any(MidpointRequest.class)))
            .thenReturn(Mono.just(response));
        
        webTestClient.post()
            .uri("/api/places/midpoint")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isOk()
            .expectBody(MidpointResponse.class)
            .consumeWith(result -> {
                MidpointResponse responseBody = result.getResponseBody();
                assertNotNull(responseBody);
                assertEquals(0, responseBody.getPlaces().size());
            });
    }

    @Test
    void testFindMidpoint_WithNullFilters() {
        MidpointRequest request = new MidpointRequest();
        request.setCoords(Arrays.asList(
            new Coordinates(40.7128, -74.0060),
            new Coordinates(40.7589, -73.9851)
        ));
        request.setFilters(null);
        
        Coordinates midpoint = new Coordinates(40.7350, -73.9950);
        List<Place> places = Collections.emptyList();
        MidpointResponse response = new MidpointResponse(
            midpoint,
            "New York, NY, USA",
            places,
            8047
        );
        
        when(midpointService.findMidpointAndPlaces(any(MidpointRequest.class)))
            .thenReturn(Mono.just(response));
        
        webTestClient.post()
            .uri("/api/places/midpoint")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isOk();
    }

    @Test
    void testFindMidpoint_WithSingleCoordinate() {
        MidpointRequest request = new MidpointRequest();
        request.setCoords(Arrays.asList(new Coordinates(40.7128, -74.0060)));
        request.setFilters(Collections.emptyList());
        
        Coordinates midpoint = new Coordinates(40.7128, -74.0060);
        List<Place> places = Collections.emptyList();
        MidpointResponse response = new MidpointResponse(
            midpoint,
            "New York, NY, USA",
            places,
            8047
        );
        
        when(midpointService.findMidpointAndPlaces(any(MidpointRequest.class)))
            .thenReturn(Mono.just(response));
        
        webTestClient.post()
            .uri("/api/places/midpoint")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isOk();
    }

    @Test
    void testFindMidpoint_WithMultipleCoordinates() {
        MidpointRequest request = new MidpointRequest();
        request.setCoords(Arrays.asList(
            new Coordinates(40.7128, -74.0060),
            new Coordinates(40.7589, -73.9851),
            new Coordinates(40.7489, -73.9680)
        ));
        request.setFilters(Arrays.asList("restaurant", "cafe"));
        
        Coordinates midpoint = new Coordinates(40.7350, -73.9950);
        List<Place> places = Arrays.asList(createTestPlace());
        MidpointResponse response = new MidpointResponse(
            midpoint,
            "New York, NY, USA",
            places,
            8047
        );
        
        when(midpointService.findMidpointAndPlaces(any(MidpointRequest.class)))
            .thenReturn(Mono.just(response));
        
        webTestClient.post()
            .uri("/api/places/midpoint")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isOk()
            .expectBody(MidpointResponse.class)
            .consumeWith(result -> {
                MidpointResponse responseBody = result.getResponseBody();
                assertNotNull(responseBody);
                assertEquals(1, responseBody.getPlaces().size());
            });
    }

    private Place createTestPlace() {
        Place place = new Place();
        place.setPlaceId("test-place-id");
        place.setName("Test Restaurant");
        place.setAddress("123 Test St");
        place.setCoordinates(new Coordinates(40.7130, -74.0060));
        place.setRating(4.5);
        return place;
    }
}

