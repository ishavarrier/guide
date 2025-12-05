package com.midpoint.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PlaceDetails {
    @JsonProperty("place_id")
    private String placeId;
    
    private String name;
    private String formattedAddress;
    private Geometry geometry;
    private String formattedPhoneNumber;
    private String website;
    private Double rating;
    private String[] types;

    // Constructors
    public PlaceDetails() {}

    public PlaceDetails(String placeId, String name, String formattedAddress, Geometry geometry) {
        this.placeId = placeId;
        this.name = name;
        this.formattedAddress = formattedAddress;
        this.geometry = geometry;
    }

    // Getters and Setters
    public String getPlaceId() {
        return placeId;
    }

    public void setPlaceId(String placeId) {
        this.placeId = placeId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFormattedAddress() {
        return formattedAddress;
    }

    public void setFormattedAddress(String formattedAddress) {
        this.formattedAddress = formattedAddress;
    }

    public Geometry getGeometry() {
        return geometry;
    }

    public void setGeometry(Geometry geometry) {
        this.geometry = geometry;
    }

    public String getFormattedPhoneNumber() {
        return formattedPhoneNumber;
    }

    public void setFormattedPhoneNumber(String formattedPhoneNumber) {
        this.formattedPhoneNumber = formattedPhoneNumber;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public String[] getTypes() {
        return types;
    }

    public void setTypes(String[] types) {
        this.types = types;
    }

    public static class Geometry {
        private Location location;

        public Geometry() {}

        public Geometry(Location location) {
            this.location = location;
        }

        public Location getLocation() {
            return location;
        }

        public void setLocation(Location location) {
            this.location = location;
        }

        public static class Location {
            private Double lat;
            private Double lng;

            public Location() {}

            public Location(Double lat, Double lng) {
                this.lat = lat;
                this.lng = lng;
            }

            public Double getLat() {
                return lat;
            }

            public void setLat(Double lat) {
                this.lat = lat;
            }

            public Double getLng() {
                return lng;
            }

            public void setLng(Double lng) {
                this.lng = lng;
            }
        }
    }
}
