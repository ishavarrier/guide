package dto;

import com.midpoint.dto.Coordinates;
import com.midpoint.dto.MidpointRequest;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class MidpointRequestTest {

    @Test
    void testDefaultConstructorAndSetters() {
        MidpointRequest request = new MidpointRequest();

        List<Coordinates> coords = Arrays.asList(
                new Coordinates(40.7128, -74.0060),
                new Coordinates(34.0522, -118.2437)
        );
        List<String> filters = Arrays.asList("restaurant", "park");

        request.setCoords(coords);
        request.setFilters(filters);

        assertNotNull(request.getCoords());
        assertEquals(2, request.getCoords().size());
        assertEquals(40.7128, request.getCoords().get(0).getLat());
        assertEquals(-118.2437, request.getCoords().get(1).getLng());

        assertNotNull(request.getFilters());
        assertEquals(2, request.getFilters().size());
        assertTrue(request.getFilters().contains("restaurant"));
        assertTrue(request.getFilters().contains("park"));
    }

    @Test
    void testAllArgsConstructor() {
        List<Coordinates> coords = Arrays.asList(
                new Coordinates(51.5074, -0.1278),
                new Coordinates(48.8566, 2.3522)
        );
        List<String> filters = Arrays.asList("museum", "cafe");

        MidpointRequest request = new MidpointRequest(coords, filters);

        assertEquals(coords, request.getCoords());
        assertEquals(filters, request.getFilters());
        assertEquals(51.5074, request.getCoords().get(0).getLat());
        assertEquals(2.3522, request.getCoords().get(1).getLng());
    }

    @Test
    void testSettersOverrideValues() {
        MidpointRequest request = new MidpointRequest();

        request.setCoords(Arrays.asList(new Coordinates(10.0, 20.0)));
        request.setFilters(Arrays.asList("gas_station"));

        assertEquals(1, request.getCoords().size());
        assertEquals(10.0, request.getCoords().get(0).getLat());
        assertEquals(20.0, request.getCoords().get(0).getLng());
        assertEquals(1, request.getFilters().size());
        assertEquals("gas_station", request.getFilters().get(0));

        // Change values again
        request.setCoords(Arrays.asList(new Coordinates(30.0, 40.0)));
        request.setFilters(Arrays.asList("cafe", "restaurant"));

        assertEquals(30.0, request.getCoords().get(0).getLat());
        assertEquals(2, request.getFilters().size());
        assertEquals("restaurant", request.getFilters().get(1));
    }
}
