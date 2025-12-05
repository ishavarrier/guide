package com.midpoint.dto;

import java.util.List;

public class MidpointRequest {
    private List<Coordinates> coords;
    private List<String> filters;

    // Constructors
    public MidpointRequest() {}

    public MidpointRequest(List<Coordinates> coords, List<String> filters) {
        this.coords = coords;
        this.filters = filters;
    }

    // Getters and Setters
    public List<Coordinates> getCoords() {
        return coords;
    }

    public void setCoords(List<Coordinates> coords) {
        this.coords = coords;
    }

    public List<String> getFilters() {
        return filters;
    }

    public void setFilters(List<String> filters) {
        this.filters = filters;
    }
}
