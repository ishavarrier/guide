package com.midpoint.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class Place {
    @JsonProperty("place_id")
    private String placeId;
    
    private String name;
    private String address;
    private Double rating;
    @JsonProperty("user_ratings_total")
    private Integer userRatingsTotal;
    @JsonProperty("price_level")
    private Integer priceLevel;
    private List<Photo> photos;
    private String[] types;
    private Double distance;
    private Coordinates coordinates;
    @JsonProperty("travel_summaries")
    private List<TravelSummary> travelSummaries;

    // Constructors
    public Place() {}

    public Place(String placeId, String name, String address, Coordinates coordinates) {
        this.placeId = placeId;
        this.name = name;
        this.address = address;
        this.coordinates = coordinates;
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getUserRatingsTotal() {
        return userRatingsTotal;
    }

    public void setUserRatingsTotal(Integer userRatingsTotal) {
        this.userRatingsTotal = userRatingsTotal;
    }

    public Integer getPriceLevel() {
        return priceLevel;
    }

    public void setPriceLevel(Integer priceLevel) {
        this.priceLevel = priceLevel;
    }

    public List<Photo> getPhotos() {
        return photos;
    }

    public void setPhotos(List<Photo> photos) {
        this.photos = photos;
    }

    public String[] getTypes() {
        return types;
    }

    public void setTypes(String[] types) {
        this.types = types;
    }

    public Double getDistance() {
        return distance;
    }

    public void setDistance(Double distance) {
        this.distance = distance;
    }

    public Coordinates getCoordinates() {
        return coordinates;
    }

    public void setCoordinates(Coordinates coordinates) {
        this.coordinates = coordinates;
    }

    public List<TravelSummary> getTravelSummaries() {
        return travelSummaries;
    }

    public void setTravelSummaries(List<TravelSummary> travelSummaries) {
        this.travelSummaries = travelSummaries;
    }

    public static class Photo {
        @JsonProperty("photo_reference")
        private String photoReference;
        private Integer height;
        private Integer width;
        private String url;

        // Constructors
        public Photo() {}

        public Photo(String photoReference, Integer height, Integer width, String url) {
            this.photoReference = photoReference;
            this.height = height;
            this.width = width;
            this.url = url;
        }

        // Getters and Setters
        public String getPhotoReference() {
            return photoReference;
        }

        public void setPhotoReference(String photoReference) {
            this.photoReference = photoReference;
        }

        public Integer getHeight() {
            return height;
        }

        public void setHeight(Integer height) {
            this.height = height;
        }

        public Integer getWidth() {
            return width;
        }

        public void setWidth(Integer width) {
            this.width = width;
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }
    }

    public static class TravelSummary {
        @JsonProperty("origin_index")
        private Integer originIndex;
        @JsonProperty("distance_meters")
        private Integer distanceMeters;
        @JsonProperty("duration_seconds")
        private Integer durationSeconds;
        @JsonProperty("distance_text")
        private String distanceText;
        @JsonProperty("duration_text")
        private String durationText;
        private String mode;

        // Constructors
        public TravelSummary() {}

        public TravelSummary(Integer originIndex, Integer distanceMeters, Integer durationSeconds, 
                           String distanceText, String durationText, String mode) {
            this.originIndex = originIndex;
            this.distanceMeters = distanceMeters;
            this.durationSeconds = durationSeconds;
            this.distanceText = distanceText;
            this.durationText = durationText;
            this.mode = mode;
        }

        // Getters and Setters
        public Integer getOriginIndex() {
            return originIndex;
        }

        public void setOriginIndex(Integer originIndex) {
            this.originIndex = originIndex;
        }

        public Integer getDistanceMeters() {
            return distanceMeters;
        }

        public void setDistanceMeters(Integer distanceMeters) {
            this.distanceMeters = distanceMeters;
        }

        public Integer getDurationSeconds() {
            return durationSeconds;
        }

        public void setDurationSeconds(Integer durationSeconds) {
            this.durationSeconds = durationSeconds;
        }

        public String getDistanceText() {
            return distanceText;
        }

        public void setDistanceText(String distanceText) {
            this.distanceText = distanceText;
        }

        public String getDurationText() {
            return durationText;
        }

        public void setDurationText(String durationText) {
            this.durationText = durationText;
        }

        public String getMode() {
            return mode;
        }

        public void setMode(String mode) {
            this.mode = mode;
        }
    }
}
