package com.midpoint.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PlacePrediction {
    @JsonProperty("place_id")
    private String placeId;
    
    private String description;
    
    @JsonProperty("structured_formatting")
    private StructuredFormatting structuredFormatting;

    // Constructors
    public PlacePrediction() {}

    public PlacePrediction(String placeId, String description, StructuredFormatting structuredFormatting) {
        this.placeId = placeId;
        this.description = description;
        this.structuredFormatting = structuredFormatting;
    }

    // Getters and Setters
    public String getPlaceId() {
        return placeId;
    }

    public void setPlaceId(String placeId) {
        this.placeId = placeId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public StructuredFormatting getStructuredFormatting() {
        return structuredFormatting;
    }

    public void setStructuredFormatting(StructuredFormatting structuredFormatting) {
        this.structuredFormatting = structuredFormatting;
    }

    public static class StructuredFormatting {
        @JsonProperty("main_text")
        private String mainText;
        
        @JsonProperty("secondary_text")
        private String secondaryText;

        // Constructors
        public StructuredFormatting() {}

        public StructuredFormatting(String mainText, String secondaryText) {
            this.mainText = mainText;
            this.secondaryText = secondaryText;
        }

        // Getters and Setters
        public String getMainText() {
            return mainText;
        }

        public void setMainText(String mainText) {
            this.mainText = mainText;
        }

        public String getSecondaryText() {
            return secondaryText;
        }

        public void setSecondaryText(String secondaryText) {
            this.secondaryText = secondaryText;
        }
    }
}
