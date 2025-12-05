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
class PlacesController2Test {

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

    @Test
    void testGetPlaceDetails_WithSessionToken() {
        PlaceDetails details = new PlaceDetails();
        
        when(googleMapsService.getPlaceDetails("test-place-id", "custom-token"))
            .thenReturn(Mono.just(details));
        
        webTestClient.get()
            .uri("/api/places/details?placeId=test-place-id&sessionToken=custom-token")
            .exchange()
            .expectStatus().isOk()
            .expectBody(PlaceDetails.class);
    }

    @Test
    void testGetPlaceDetails_Error() {
        when(googleMapsService.getPlaceDetails(eq("test-place-id"), anyString()))
            .thenReturn(Mono.error(new RuntimeException("Service error")));
        
        webTestClient.get()
            .uri("/api/places/details?placeId=test-place-id")
            .exchange()
            .expectStatus().is5xxServerError();
    }

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

    @Test
    void testGetPlaceAutocomplete_EmptyInput() {
        List<PlacePrediction> predictions = Collections.emptyList();
        
        when(googleMapsService.getPlaceAutocomplete(eq(""), anyString()))
            .thenReturn(Mono.just(predictions));
        
        webTestClient.get()
            .uri("/api/places/autocomplete?input=")
            .exchange()
            .expectStatus().isOk()
            .expectBodyList(PlacePrediction.class)
            .hasSize(0);
    }

    @Test
    void testGetPlaceDetails_EmptyPlaceId() {
        PlaceDetails details = new PlaceDetails();
        
        when(googleMapsService.getPlaceDetails(eq(""), anyString()))
            .thenReturn(Mono.just(details));
        
        webTestClient.get()
            .uri("/api/places/details?placeId=")
            .exchange()
            .expectStatus().isOk()
            .expectBody(PlaceDetails.class);
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

