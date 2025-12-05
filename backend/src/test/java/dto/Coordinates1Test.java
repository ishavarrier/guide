package dto;

import com.midpoint.dto.Coordinates;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class Coordinates1Test {

    @Test
    void testDefaultConstructorAndSetters() {
        Coordinates coords = new Coordinates();
        coords.setLat(37.7749);
        coords.setLng(-122.4194);

        assertNotNull(coords);
        assertEquals(37.7749, coords.getLat());
        assertEquals(-122.4194, coords.getLng());
    }

    @Test
    void testAllArgsConstructor() {
        Coordinates coords = new Coordinates(40.7128, -74.0060);

        assertEquals(40.7128, coords.getLat());
        assertEquals(-74.0060, coords.getLng());
    }
}