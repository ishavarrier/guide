package com.midpoint.controller;

import com.midpoint.dto.*;
import com.midpoint.service.GoogleMapsService;
import com.midpoint.service.MidpointService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/places")
@CrossOrigin(origins = "*")
public class PlacesController {

    private static final Logger LOGGER = LoggerFactory.getLogger(PlacesController.class);

    private final GoogleMapsService googleMapsService;
    private final MidpointService midpointService;

    public PlacesController(GoogleMapsService googleMapsService, MidpointService midpointService) {
        this.googleMapsService = googleMapsService;
        this.midpointService = midpointService;
    }

    @GetMapping("/autocomplete")
    public Mono<ResponseEntity<List<PlacePrediction>>> getPlaceAutocomplete(
            @RequestParam String input,
            @RequestParam(required = false) String sessionToken) {
        
        // Generate session token if not provided
        String token = sessionToken != null ? sessionToken : UUID.randomUUID().toString();
        
        return googleMapsService.getPlaceAutocomplete(input, token)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.internalServerError().build());
    }

    @GetMapping("/details")
    public Mono<ResponseEntity<PlaceDetails>> getPlaceDetails(
            @RequestParam String placeId,
            @RequestParam(required = false) String sessionToken) {
        
        // Generate session token if not provided
        String token = sessionToken != null ? sessionToken : UUID.randomUUID().toString();
        
        return googleMapsService.getPlaceDetails(placeId, token)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.internalServerError().build());
    }

    @PostMapping("/midpoint")
    public Mono<ResponseEntity<MidpointResponse>> findMidpoint(@RequestBody MidpointRequest request) {
        LOGGER.info("🌐 [CONTROLLER] Received midpoint request with {} coordinates and {} filters",
                request.getCoords() != null ? request.getCoords().size() : 0,
                request.getFilters() != null ? request.getFilters().size() : 0);
        
        return midpointService.findMidpointAndPlaces(request)
                .map(response -> {
                    LOGGER.info("✅ [CONTROLLER] Returning midpoint response with {} places", response.getPlaces().size());
                    return ResponseEntity.ok(response);
                })
                .doOnError(error -> LOGGER.error("❌ [CONTROLLER] Error processing midpoint request", error))
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Places API is running");
    }
}
