package dto;

import com.midpoint.dto.Coordinates;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class Coordinates2Test {

    @Test
    void testSettersOverrideValues() {
        Coordinates coords = new Coordinates(1.0, 2.0);
        coords.setLat(10.5);
        coords.setLng(20.5);

        assertEquals(10.5, coords.getLat());
        assertEquals(20.5, coords.getLng());
    }

    @Test
    void testNullValues() {
        Coordinates coords = new Coordinates();
        coords.setLat(null);
        coords.setLng(null);

        assertNull(coords.getLat());
        assertNull(coords.getLng());
    }
}