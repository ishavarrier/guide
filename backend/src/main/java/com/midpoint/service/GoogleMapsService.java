package com.midpoint.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.midpoint.dto.PlaceDetails;
import com.midpoint.dto.PlacePrediction;
import com.midpoint.exception.PlacesResponseParsingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;

@Service
public class GoogleMapsService {
    
    private static final Logger LOGGER = LoggerFactory.getLogger(GoogleMapsService.class);
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    @Value("${google.maps.api.key}")
    private String apiKey;
    
    private static final String PLACES_AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
    private static final String PLACE_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";

    public GoogleMapsService() {
        this.webClient = WebClient.builder().build();
        this.objectMapper = new ObjectMapper();
    }

    public Mono<List<PlacePrediction>> getPlaceAutocomplete(String input, String sessionToken) {
        try {
            // Build request body JSON
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("input", input);
            
            // Note: locationBias can be added here if coordinates are available
            // For now, we'll send just the input field
            
            String requestBodyJson = objectMapper.writeValueAsString(requestBody);

            return webClient.post()
                    .uri(PLACES_AUTOCOMPLETE_URL)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header("X-Goog-Api-Key", apiKey)
                    .bodyValue(requestBodyJson)
                    .retrieve()
                    .bodyToMono(String.class)
                    .map(this::parseAutocompleteResponse)
                    .doOnError(error -> LOGGER.error("Autocomplete error: {}", error.getMessage(), error))
                    .onErrorReturn(new ArrayList<>());
        } catch (JsonProcessingException e) {
            LOGGER.error("Error building autocomplete request", e);
            return Mono.just(new ArrayList<>());
        }
    }

    public Mono<PlaceDetails> getPlaceDetails(String placeId, String sessionToken) {
        String url = String.format("%s?place_id=%s&key=%s&sessiontoken=%s&fields=place_id,name,formatted_address,geometry,formatted_phone_number,website,rating,types",
                PLACE_DETAILS_URL, 
                placeId, 
                apiKey, 
                sessionToken);

        return webClient.get()
                .uri(url)
                .retrieve()
                .bodyToMono(String.class)
                .map(this::parsePlaceDetailsResponse)
                .onErrorReturn(new PlaceDetails());
    }

    private List<PlacePrediction> parseAutocompleteResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            // New API uses "suggestions" instead of "predictions"
            JsonNode suggestions = root.has("suggestions") ? root.get("suggestions") : root.get("predictions");
            
            List<PlacePrediction> result = new ArrayList<>();
            if (suggestions != null && suggestions.isArray()) {
                for (JsonNode suggestion : suggestions) {
                    PlacePrediction place = new PlacePrediction();
                    
                    // New API structure: placePrediction.placeId vs old: place_id
                    if (suggestion.has("placePrediction")) {
                        JsonNode placePrediction = suggestion.get("placePrediction");
                        place.setPlaceId(placePrediction.get("placeId").asText());
                        
                        String description = "";
                        // New API: text.text structure
                        if (placePrediction.has("text")) {
                            JsonNode textNode = placePrediction.get("text");
                            if (textNode.has("text")) {
                                description = textNode.get("text").asText();
                            } else {
                                description = textNode.asText();
                            }
                        } else if (placePrediction.has("description")) {
                            description = placePrediction.get("description").asText();
                        }
                        place.setDescription(description);
                        
                        // Ensure description is not empty
                        if (description == null || description.isEmpty()) {
                            LOGGER.warn("Empty description for placeId: {}, skipping", place.getPlaceId());
                            continue;
                        }
                        
                        // New API: structuredFormatting structure
                        PlacePrediction.StructuredFormatting formatting = new PlacePrediction.StructuredFormatting();
                        if (placePrediction.has("structuredFormat")) {
                            JsonNode structuredFormat = placePrediction.get("structuredFormat");
                            if (structuredFormat.has("mainText")) {
                                String mainText = structuredFormat.get("mainText").asText();
                                formatting.setMainText(mainText != null && !mainText.isEmpty() ? mainText : description);
                            } else {
                                formatting.setMainText(description);
                            }
                            if (structuredFormat.has("secondaryText")) {
                                String secondaryText = structuredFormat.get("secondaryText").asText();
                                if (secondaryText != null && !secondaryText.isEmpty()) {
                                    formatting.setSecondaryText(secondaryText);
                                }
                            }
                        } else {
                            // Parse description to extract main and secondary text
                            // Format is typically: "Main Text, Secondary Text, City, State"
                            // Example: "Amoeba Music, Haight Street, San Francisco, CA, USA"
                            if (description != null && !description.isEmpty()) {
                                String[] parts = description.split(",", 2);
                                if (parts.length >= 2) {
                                    String mainText = parts[0].trim();
                                    String secondaryText = parts[1].trim();
                                    // Use first part as main text (e.g., "Amoeba Music")
                                    formatting.setMainText(mainText.isEmpty() ? description : mainText);
                                    // Use rest as secondary text (e.g., "Haight Street, San Francisco, CA, USA")
                                    if (!secondaryText.isEmpty()) {
                                        formatting.setSecondaryText(secondaryText);
                                    }
                                } else {
                                    // No comma found, use entire description as main text
                                    formatting.setMainText(description.trim());
                                }
                            } else {
                                formatting.setMainText("Unknown location");
                            }
                        }
                        
                        // Ensure mainText is always set and not empty
                        if (formatting.getMainText() == null || formatting.getMainText().isEmpty()) {
                            formatting.setMainText(description);
                        }
                        
                        LOGGER.debug("Created place: placeId={}, description={}, mainText={}, secondaryText={}", 
                                place.getPlaceId(), description, formatting.getMainText(), formatting.getSecondaryText());
                        place.setStructuredFormatting(formatting);
                    } else {
                        // Fallback to old API structure for backward compatibility
                        place.setPlaceId(suggestion.get("place_id").asText());
                        place.setDescription(suggestion.get("description").asText());
                        
                        PlacePrediction.StructuredFormatting formatting = new PlacePrediction.StructuredFormatting();
                        JsonNode structuredFormatting = suggestion.get("structured_formatting");
                        if (structuredFormatting != null) {
                            formatting.setMainText(structuredFormatting.get("main_text").asText());
                            if (structuredFormatting.has("secondary_text")) {
                                formatting.setSecondaryText(structuredFormatting.get("secondary_text").asText());
                            }
                        } else {
                            // Fallback: use description as mainText if structured_formatting not available
                            formatting.setMainText(place.getDescription());
                        }
                        place.setStructuredFormatting(formatting);
                    }
                    
                    // Validate that structuredFormatting is set and has mainText
                    if (place.getStructuredFormatting() == null) {
                        LOGGER.warn("structuredFormatting is null for placeId: {}, skipping", place.getPlaceId());
                        continue;
                    }
                    if (place.getStructuredFormatting().getMainText() == null || 
                        place.getStructuredFormatting().getMainText().isEmpty()) {
                        LOGGER.warn("mainText is null or empty for placeId: {}, setting to description", place.getPlaceId());
                        place.getStructuredFormatting().setMainText(
                            place.getDescription() != null && !place.getDescription().isEmpty() 
                                ? place.getDescription() 
                                : "Unknown location");
                    }
                    
                    result.add(place);
                }
            }
            return result;
        } catch (JsonProcessingException e) {
            throw new PlacesResponseParsingException("Error parsing autocomplete response", e);
        }
    }

    private PlaceDetails parsePlaceDetailsResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode result = root.get("result");
            
            if (result == null) {
                return new PlaceDetails();
            }
            
            PlaceDetails placeDetails = new PlaceDetails();
            placeDetails.setPlaceId(result.get("place_id").asText());
            placeDetails.setName(result.get("name").asText());
            placeDetails.setFormattedAddress(result.get("formatted_address").asText());
            
            // Parse geometry
            JsonNode geometry = result.get("geometry");
            if (geometry != null) {
                PlaceDetails.Geometry geom = new PlaceDetails.Geometry();
                JsonNode location = geometry.get("location");
                if (location != null) {
                    PlaceDetails.Geometry.Location loc = new PlaceDetails.Geometry.Location();
                    loc.setLat(location.get("lat").asDouble());
                    loc.setLng(location.get("lng").asDouble());
                    geom.setLocation(loc);
                }
                placeDetails.setGeometry(geom);
            }
            
            // Parse additional fields
            if (result.has("formatted_phone_number")) {
                placeDetails.setFormattedPhoneNumber(result.get("formatted_phone_number").asText());
            }
        if (result.has("website")) {
                placeDetails.setWebsite(result.get("website").asText());
            }
            if (result.has("rating")) {
                placeDetails.setRating(result.get("rating").asDouble());
            }
            if (result.has("types")) {
                JsonNode types = result.get("types");
                if (types.isArray()) {
                    String[] typesArray = new String[types.size()];
                    for (int i = 0; i < types.size(); i++) {
                        typesArray[i] = types.get(i).asText();
                    }
                    placeDetails.setTypes(typesArray);
                }
            }
            
            return placeDetails;
        } catch (JsonProcessingException e) {
            throw new PlacesResponseParsingException("Error parsing place details response", e);
        }
    }
}
