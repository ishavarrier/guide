package com.midpoint.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class MidpointResponse {
    private Coordinates midpoint;
    @JsonProperty("midpoint_address")
    private String midpointAddress;
    private List<Place> places;
    @JsonProperty("radius_meters")
    private Integer radiusMeters;

    // Constructors
    public MidpointResponse() {}

    public MidpointResponse(Coordinates midpoint, String midpointAddress, 
                          List<Place> places, Integer radiusMeters) {
        this.midpoint = midpoint;
        this.midpointAddress = midpointAddress;
        this.places = places;
        this.radiusMeters = radiusMeters;
    }

    // Getters and Setters
    public Coordinates getMidpoint() {
        return midpoint;
    }

    public void setMidpoint(Coordinates midpoint) {
        this.midpoint = midpoint;
    }

    public String getMidpointAddress() {
        return midpointAddress;
    }

    public void setMidpointAddress(String midpointAddress) {
        this.midpointAddress = midpointAddress;
    }

    public List<Place> getPlaces() {
        return places;
    }

    public void setPlaces(List<Place> places) {
        this.places = places;
    }

    public Integer getRadiusMeters() {
        return radiusMeters;
    }

    public void setRadiusMeters(Integer radiusMeters) {
        this.radiusMeters = radiusMeters;
    }
}
