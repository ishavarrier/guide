package dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.midpoint.dto.Coordinates;
import com.midpoint.dto.Place;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PlaceTest {

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void testDefaultConstructorAndSetters() {
        Place p = new Place();

        Coordinates coords = new Coordinates(40.7128, -74.0060);
        Place.Photo photo = new Place.Photo();
        photo.setPhotoReference("ref-123");
        photo.setHeight(300);
        photo.setWidth(400);
        photo.setUrl("http://example.com/photo.jpg");
        List<Place.Photo> photos = new ArrayList<>();
        photos.add(photo);

        Place.TravelSummary ts = new Place.TravelSummary();
        ts.setOriginIndex(1);
        ts.setDistanceMeters(1234);
        ts.setDurationSeconds(567);
        ts.setDistanceText("1.2 km");
        ts.setDurationText("9 mins");
        ts.setMode("driving");
        List<Place.TravelSummary> travelSummaries = new ArrayList<>();
        travelSummaries.add(ts);

        p.setPlaceId("pid-1");
        p.setName("Test Place");
        p.setAddress("123 Main St");
        p.setRating(4.5);
        p.setUserRatingsTotal(99);
        p.setPriceLevel(2);
        p.setPhotos(photos);
        p.setTypes(new String[]{"restaurant", "food"});
        p.setDistance(0.42);
        p.setCoordinates(coords);
        p.setTravelSummaries(travelSummaries);

        assertEquals("pid-1", p.getPlaceId());
        assertEquals("Test Place", p.getName());
        assertEquals("123 Main St", p.getAddress());
        assertEquals(4.5, p.getRating());
        assertEquals(99, p.getUserRatingsTotal());
        assertEquals(2, p.getPriceLevel());
        assertNotNull(p.getPhotos());
        assertEquals(1, p.getPhotos().size());
        assertEquals("ref-123", p.getPhotos().get(0).getPhotoReference());
        assertArrayEquals(new String[]{"restaurant", "food"}, p.getTypes());
        assertEquals(0.42, p.getDistance());
        assertNotNull(p.getCoordinates());
        assertEquals(40.7128, p.getCoordinates().getLat());
        assertEquals(-74.0060, p.getCoordinates().getLng());
        assertNotNull(p.getTravelSummaries());
        assertEquals(1, p.getTravelSummaries().size());
        assertEquals(1, p.getTravelSummaries().get(0).getOriginIndex());
        assertEquals("driving", p.getTravelSummaries().get(0).getMode());
    }

    @Test
    void testAllArgsConstructor() {
        Coordinates coords = new Coordinates(1.23, 4.56);
        Place p = new Place("pid-2", "Another Place", "456 Side St", coords);

        assertEquals("pid-2", p.getPlaceId());
        assertEquals("Another Place", p.getName());
        assertEquals("456 Side St", p.getAddress());
        assertEquals(1.23, p.getCoordinates().getLat());
        assertEquals(4.56, p.getCoordinates().getLng());
        assertNull(p.getRating());
        assertNull(p.getPhotos());
        assertNull(p.getTypes());
    }

    @Test
    void testPhotoConstructorAndSetters() {
        Place.Photo photo = new Place.Photo("ref-999", 800, 1200, "http://img");
        assertEquals("ref-999", photo.getPhotoReference());
        assertEquals(800, photo.getHeight());
        assertEquals(1200, photo.getWidth());
        assertEquals("http://img", photo.getUrl());

        photo.setUrl("http://img2");
        assertEquals("http://img2", photo.getUrl());
    }

    @Test
    void testTravelSummaryConstructorAndSetters() {
        Place.TravelSummary ts = new Place.TravelSummary(0, 2500, 600, "2.5 km", "10 mins", "walking");
        assertEquals(0, ts.getOriginIndex());
        assertEquals(2500, ts.getDistanceMeters());
        assertEquals(600, ts.getDurationSeconds());
        assertEquals("2.5 km", ts.getDistanceText());
        assertEquals("10 mins", ts.getDurationText());
        assertEquals("walking", ts.getMode());

        ts.setMode("bicycling");
        assertEquals("bicycling", ts.getMode());
    }

    @Test
    void testJacksonDeserialization_WithJsonPropertyNames() throws Exception {
        String json = """
        {
          "place_id": "pid-json",
          "name": "JSON Place",
          "address": "789 Avenue",
          "rating": 4.2,
          "user_ratings_total": 321,
          "price_level": 3,
          "photos": [
            {"photo_reference":"ph-1","height":500,"width":600,"url":"http://ph1"},
            {"photo_reference":"ph-2","height":700,"width":800,"url":"http://ph2"}
          ],
          "types": ["cafe","point_of_interest"],
          "distance": 1.11,
          "coordinates": {"lat": 9.87, "lng": 6.54},
          "travel_summaries": [
            {"origin_index":0,"distance_meters":1000,"duration_seconds":300,"distance_text":"1 km","duration_text":"5 mins","mode":"driving"}
          ]
        }
        """;

        Place p = mapper.readValue(json, Place.class);

        assertEquals("pid-json", p.getPlaceId());
        assertEquals("JSON Place", p.getName());
        assertEquals("789 Avenue", p.getAddress());
        assertEquals(4.2, p.getRating());
        assertEquals(321, p.getUserRatingsTotal());
        assertEquals(3, p.getPriceLevel());
        assertEquals(2, p.getPhotos().size());
        assertEquals("ph-2", p.getPhotos().get(1).getPhotoReference());
        assertArrayEquals(new String[]{"cafe","point_of_interest"}, p.getTypes());
        assertEquals(1.11, p.getDistance());
        assertNotNull(p.getCoordinates());
        assertEquals(9.87, p.getCoordinates().getLat());
        assertEquals(6.54, p.getCoordinates().getLng());
        assertEquals(1, p.getTravelSummaries().size());
        Place.TravelSummary ts = p.getTravelSummaries().get(0);
        assertEquals(0, ts.getOriginIndex());
        assertEquals(1000, ts.getDistanceMeters());
        assertEquals(300, ts.getDurationSeconds());
        assertEquals("1 km", ts.getDistanceText());
        assertEquals("5 mins", ts.getDurationText());
        assertEquals("driving", ts.getMode());
    }

    @Test
    void testJacksonSerialization_JsonPropertyNamesAppear() throws Exception {
        Place p = new Place();
        p.setPlaceId("pid-ser");
        p.setName("Serialize Me");
        p.setAddress("1010 Serialize Rd");
        p.setRating(3.3);
        p.setUserRatingsTotal(12);
        p.setPriceLevel(1);
        p.setTypes(new String[]{"restaurant"});
        p.setDistance(0.99);
        p.setCoordinates(new Coordinates(12.34, 56.78));
        p.setPhotos(Arrays.asList(new Place.Photo("ph-x", 100, 200, "http://phx")));
        p.setTravelSummaries(List.of(new Place.TravelSummary(2, 2222, 444, "2.2 km", "7 mins", "driving")));

        String json = mapper.writeValueAsString(p);
        JsonNode node = mapper.readTree(json);

        // Verify @JsonProperty fields are emitted with correct names
        assertEquals("pid-ser", node.get("place_id").asText());
        assertEquals(12, node.get("user_ratings_total").asInt());
        assertEquals(1, node.get("price_level").asInt());
        assertTrue(node.has("travel_summaries"));
        assertTrue(node.get("travel_summaries").isArray());
        assertEquals(2, node.get("travel_summaries").get(0).get("origin_index").asInt());
        assertEquals(2222, node.get("travel_summaries").get(0).get("distance_meters").asInt());
        assertEquals(444, node.get("travel_summaries").get(0).get("duration_seconds").asInt());
        assertEquals("2.2 km", node.get("travel_summaries").get(0).get("distance_text").asText());
        assertEquals("7 mins", node.get("travel_summaries").get(0).get("duration_text").asText());

        // And plain fields too
        assertEquals("Serialize Me", node.get("name").asText());
        assertEquals("1010 Serialize Rd", node.get("address").asText());
        assertEquals(3.3, node.get("rating").asDouble(), 1e-9);
        assertEquals(0.99, node.get("distance").asDouble(), 1e-9);

        // Nested objects/arrays
        assertTrue(node.get("photos").isArray());
        assertEquals("ph-x", node.get("photos").get(0).get("photo_reference").asText());
        assertTrue(node.get("types").isArray());
        assertEquals("restaurant", node.get("types").get(0).asText());
        assertEquals(12.34, node.get("coordinates").get("lat").asDouble(), 1e-9);
        assertEquals(56.78, node.get("coordinates").get("lng").asDouble(), 1e-9);
    }
}
